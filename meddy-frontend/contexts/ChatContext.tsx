'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { Client, Thread } from "@langchain/langgraph-sdk";
import { CONFIG } from '@/config-global';
import { generateRandomId } from '@/utils/util';
import { ModelOptions } from "@/app/types";
import { createClient } from '@/utils/util';

interface ChatContextType {
  messages: any[];
  // setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

type ContentItem = {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: string;
}

export interface GraphInput {
  messages: Record<string, any>[];
  selectedModel: ModelOptions
  content: string | ContentItem[];
  threadId: string;
}

type DispatchContextType = {
  resetChat: () => void;
  streamMessage: (params: GraphInput) => void;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  setInterrupt: React.Dispatch<React.SetStateAction<boolean>>;
  runId: string;
}
const ChatContext = createContext<ChatContextType | undefined>(undefined);
const DispatchContext = createContext<DispatchContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState([]);
  const [interrupt, setInterrupt] = useState(false);
  const [runId, setRunId] = useState('');
  const [isRuning, setIsRuning] = useState(false);

  const resetChat = () => {
    setMessages([]);
    setInterrupt(false);
    setRunId('');
  };

  const streamhandle = async (stream) => {
    let hasProgressBeenSet = false;
    const progressAIMessageId = generateRandomId();

    for await (const chunk of stream) {
      // console.log('chunk', chunk);
      if (!runId && chunk.data?.run_id) {
        setRunId(chunk.data?.run_id);
      }
      if (!hasProgressBeenSet) {
        hasProgressBeenSet = true;
        setMessages((prevMessages) => {
          return [...prevMessages, {
            id: progressAIMessageId,
            type: 'ai',
            content: '',
            status: 'process',
          }];
        });
        continue
      }
      if (chunk.event === 'values') {
        if (chunk.data.messages && chunk.data.messages.length > 0) {
          console.log('values .messages',chunk.data.messages);
          const lastindex = chunk.data.messages.length - 1;
          const chunkData = chunk.data.messages[lastindex];
          if (chunkData.content && chunkData.type === 'ai') {
            setMessages((prevMessages) => {
              return prevMessages.map((prev) => {
                if (prev.id === progressAIMessageId) {
                  return { ...prev, content: chunkData.content };
                }
                return prev;
              });
            });
          }
        }
      } 
      if (chunk.event === 'messages') {
        const message = chunk.data[0];
        if (message.content && message.type === 'AIMessageChunk') {
          setMessages((prevMessages) => {
            return prevMessages.map((prev) => {
              if (prev.id === progressAIMessageId) {
                return { ...prev, content: `${prev.content}${message.content}` };
              }
              return prev;
            });
          });
        }
        if (message.tool_calls && message.tool_calls.length === 1) {
          const tool = message.tool_calls[0];
          console.log('tool', tool);
          if (tool.args.question) {
            setInterrupt(true);
            setMessages((prevMessages) => {
              return prevMessages.map((prev) => {
                if (prev.id === progressAIMessageId) {
                  return { ...prev, content: tool.args.question };
                }
                return prev;
              });
            });

          }
        }
      } 
      if (chunk.event === 'messages/partial') {
        const message = chunk.data[0];
        if (message.content) {
          setMessages((prevMessages) => {
            const existingMessageIndex = prevMessages.findIndex(
              (msg) => msg.id === progressAIMessageId,
            );
            // eslint-disable-next-line no-negated-condition
            if (existingMessageIndex !== -1) {
              return [
                ...prevMessages.slice(0, existingMessageIndex),
                { id: progressAIMessageId, content: message.content, type: 'ai' },
                ...prevMessages.slice(existingMessageIndex + 1),
              ];
            }
            return prevMessages;
          });
        }
        if (message.tool_calls && message.tool_calls.length === 1) {
          const tool = message.tool_calls[0];
          if (tool.name === 'Response' && tool.args.file_path) {
            setMessages((prevMessages) => {
              const existingMessageIndex = prevMessages.findIndex(
                (msg) => msg.id === progressAIMessageId,
              );
              // const image_url = value.split('/').pop()
              const imgs = tool.args.file_path.map((value) => ({ type: 'image_url', image_url: value }));
              const content = [
                { type: 'text', text: tool.args.response },
                ...imgs
              ];
              // eslint-disable-next-line no-negated-condition
              if (existingMessageIndex !== -1) {
                return [
                  ...prevMessages.slice(0, existingMessageIndex),
                  { id: progressAIMessageId, content, type: 'ai' },
                  ...prevMessages.slice(existingMessageIndex + 1),
                ];
              }
              return prevMessages;
            });
          }
          if (tool.name === 'AskHuman') {
            setInterrupt(true);
            setMessages((prevMessages) => {
              const existingMessageIndex = prevMessages.findIndex(
                (msg) => msg.id === progressAIMessageId,
              );
              if (existingMessageIndex !== -1) {
                return [
                  ...prevMessages.slice(0, existingMessageIndex),
                  { id: progressAIMessageId, content: tool.args.question, type: 'ai' },
                  ...prevMessages.slice(existingMessageIndex + 1),
                ];
              }
              return prevMessages;
            });
          }
        }
      }
      if (chunk.event === 'error') {
        setMessages((prevMessages) => {
          return prevMessages.map((prev) => {
            if (prev.id === progressAIMessageId) {
              return { ...prev, content: '系统出错，请稍后尝试', status: 'done' };
            }
            return prev;
          });
          // const existingMessageIndex = prevMessages.findIndex(
          //   (msg) => msg.id === progressAIMessageId,
          // );
          // // eslint-disable-next-line no-negated-condition
          // if (existingMessageIndex !== -1) {
          //   return [
          //     ...prevMessages.slice(0, existingMessageIndex),
          //     { id: progressAIMessageId, content: '系统出错，请稍后尝试', type: 'ai', status: 'done' },
          //     ...prevMessages.slice(existingMessageIndex + 1),
          //   ];
          // }
        });
      }
    }
  }

  const streamMessage = async (params: GraphInput) => {
    const client = createClient();

    console.log('interrupt', interrupt)
    if (interrupt) {
      setTimeout(() => {
        setInterrupt(false);
      }, 50);
    }
    const stream = client.runs.stream(params.threadId, "agent", {
      // streamMode: ["messages-tuple", "values", "custom"], // "values" | "messages" | "updates" | "events" | "debug" | "custom" | "messages-tuple";
      streamMode: ["values", "messages-tuple", "custom"],
      config: {
        configurable: {
          model_name: params.selectedModel,
          expert_chat_mode: params.expert_chat_mode,
          // model: 'qwen2.5:14b',
          thread_id: params.threadId,
          user_id: params.userId,
        },
      },
      command: interrupt ? { resume: params.content } : {},
      input: interrupt ? {} : { messages: params.messages }
    });
    if(params.expert_chat_mode) {
      for await (const chunk of stream){
        // console.log('expert_chat_mode', chunk)
        if (chunk.event === 'error') {

        }
      }
      return;
    }
    streamhandle(stream);
  };
  const stopMessage = (threadId, runId) => {
    // if (threadId && runId) {
    //   const client = createClient();
    //   client.runs.cancel(threadId, runId);
    // }
  };
  const joinStreamMessage = async (id) => {
    const client = createClient();
    const data = await client.runs.list(id);
    console.log('data', data);
    if (data[0] && data[0].status === 'running') {
      const { run_id } = data[0];
      const stream = client.runs.joinStream(id, run_id);
      streamhandle(stream);
    }
  }
  return (
    <DispatchContext.Provider
      value={{
        streamMessage,
        resetChat,
        setInterrupt,
        setMessages,
        stopMessage,
        joinStreamMessage,
        runId,
      }}
    >
      <ChatContext.Provider
        value={{
          messages,
        }}
      >
        {children}
      </ChatContext.Provider>
    </DispatchContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useThread must be used within a ThreadProvider');
  }
  return context;
}

export function useDispatch() {
  const context = useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useThread must be used within a ThreadProvider');
  }
  return context;
}