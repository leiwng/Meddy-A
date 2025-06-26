'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useContext,
  useState,
  createContext,
} from 'react'
import { createClient } from '@/utils/util'
import { generateRandomId } from '@/utils/util'
import { useThread } from './ThreadContext'
import { useRouter } from 'next/navigation'

class StreamStatus {
  constructor() {
    this.lockruning = false;
    this.interrupt = false;
    this.runId = '';
  }
  resetChat() {
    this.runId = '';
  }
  reset() {
    this.lockruning = false;
    this.interrupt = false;
    this.runId = '';
  }
}

const streamStatus = new StreamStatus();

function getInterruptMsg(interrupts) {
  const msg = {
    id: generateRandomId(),
    type: 'ai',
  }
  
  msg.content = interrupts[Object.keys(interrupts)[0]][0].value
  return msg
}

function getContent(kwargs) {
  if (kwargs.input.messages) {
    const msg = kwargs.input.messages[0];
    return msg;
  }
  if (kwargs.command.resume) {
    return { additional_kwargs: {}, content: kwargs.command.resume }
  }
  return '';
}

class QuestionManage {
  question: string;
  startQuestion: boolean;
  status: string;
  desc: string;
  constructor() {
    this.question = '';
    this.status = '';
    this.desc = '';
    this.startQuestion = false;
  }
  add(message) {
    console.log('add', message);
    if (message.tool_calls && message.tool_calls.length === 1) {
      const tool = message.tool_calls[0]
      console.log('tool', tool);

      if (tool.args.question) {
        streamStatus.interrupt = true; // 设置中断状态，下一次用户消息resume
        this.startQuestion = true; // 收集到用户问题消息
        this.question = tool.args.question;
        return;
      }
      if (tool.type === 'tool_call') {
        if (tool.name === 'remove_background_of_original_image') {
          this.status = 'doing';
          this.desc = '去背景，生成中期图';
          return;
        }
        if (tool.name === 'segment_mid_image') {
           this.status = 'doing';
            this.desc = '分割中期图';
          return;
        }
        if (tool.name === 'recognize_image') {
            this.status = 'doing';
          this.desc = '识别染色体';
          return;
        }
        if (tool.name === 'Response') {
            this.status = 'doing';
          this.desc = '组织回答';
          return;
        }
        if (tool.name === 'OptimizedQuery') {
          this.status = 'doing';
          this.desc = '查询中';
          return;
        }
      } 
      return;
    }
    // 千问plus模型，的question信息，tool_calls只有开始几个字符，剩余内容会放到tool_call_chunks进行补充，
    if (message.tool_call_chunks && message.tool_call_chunks.length === 1) {
      if (!this.startQuestion) { // 只处理问提chunks
        console.log('no start question')
        return;
      }
      const tool = message.tool_call_chunks[0]
      console.log('tool_call_chunks tool', tool)
      if (tool.args) {
        this.question = this.question.concat(tool.args)
      }
    }
  }
  get() {
    const question =  this.question
      // .replace(/\\n/g, '')
      // .replace(/\\/g, '') // Remove backslashes
      // .replace(/\r?\n|\r/g, '') // Remove all types of line breaks
      .replace(/\"}/g, '')
      .trim(); // Remove leading/trailing whitespace
    return { question, status: this.status, desc: this.desc };
  }
  clean(){
    this.question = '';
    this.startQuestion = false;
    this.status = '';
    this.desc = '';
  }
}

const qusManage = new QuestionManage();
const streamhandle = async (stream, dispatchs) => {
  const { setMessages } = dispatchs
  let hasProgressBeenSet = false
  const progressAIMessageId = generateRandomId()
  streamStatus.runId = '';
  for await (const chunk of stream) {
    console.log('chunk', chunk);
    if (!streamStatus.runId && chunk.data?.run_id) {
      streamStatus.runId = chunk.data?.run_id;
    }
    if (!hasProgressBeenSet) {
      hasProgressBeenSet = true
      setMessages((prevMessages) => {
        return [
          ...prevMessages,
          {
            id: progressAIMessageId,
            type: 'ai',
            content: '',
            status: 'doing',
            desc: '思考中',
          },
        ]
      })
      continue
    }
    if (chunk.event === 'values') {
      if (chunk.data.messages && chunk.data.messages.length > 0) {
        // console.log('values .messages', chunk.data.messages)
        const lastindex = chunk.data.messages.length - 1
        const chunkData = chunk.data.messages[lastindex]
        if (chunkData.content && chunkData.type === 'ai') {
          setMessages((prevMessages) => {
            return prevMessages.map((prev) => {
              if (prev.id === progressAIMessageId) {
                return { ...prev, content: chunkData.content }
              }
              return prev
            })
          })
        }
      }
      // deepseek的中断取值
      if(chunk.data.__interrupt__ && chunk.data.__interrupt__.length > 0) {
        const content = chunk.data.__interrupt__[0].value;
        setMessages((prevMessages) => {
          return prevMessages.map((prev) => {
            if (prev.id === progressAIMessageId) {
              return { ...prev, content: content }
            }
            return prev
          })
        })
      }
    }
    if ((chunk.event === 'events')) {
      if (chunk.data.event ==="on_chain_end" && chunk.data.metadata.langgraph_node ==='chat') {
        console.log('on_chain_end', qusManage.status);
        qusManage.status === 'stop';
        setMessages((prevMessages) => {
          return prevMessages.map((prev) => {
            if (prev.id === progressAIMessageId) {
              return { ...prev, status: 'stop', desc: '' }
            }
            return prev
          })
        })
      }
    }
    if (chunk.event === 'messages') {
      const message = chunk.data[0];
      if (message.type === 'AIMessageChunk') {
        if (message.content) {
          setMessages((prevMessages) => {
            return prevMessages.map((prev) => {
              if (prev.id === progressAIMessageId) {
                return { ...prev, content: `${prev.content}${message.content}`, status: 'stop', desc: '' }
              }
              return prev
            })
          });
        } else {
          qusManage.add(message);
          const qus = qusManage.get();
          // console.log('ques', qus)
          if (qus.question) {
            setMessages((prevMessages) => {
              return prevMessages.map((prev) => {
                if (prev.id === progressAIMessageId) {
                  return { ...prev, content: qus }
                }
                return prev
              })
            });
          }else if (qus.status) {
            // console.log('ques status', qus.status)
            setMessages((prevMessages) => {
              return prevMessages.map((prev) => {
                if (prev.id === progressAIMessageId) {
                  return { ...prev, status: qus.status, desc: qus.desc }
                }
                return prev
              })
            });
          }
        }
      }
      if (message.type === 'ai') {
        setMessages((prevMessages) => {
          return prevMessages.map((prev) => {
            if (prev.id === progressAIMessageId) {
              return { ...prev, status: 'stop', desc: '' }
            }
            return prev
          })
        });
      }
      // if (message.tool_calls && message.tool_calls.length === 1) {
      //   const tool = message.tool_calls[0]
      //   console.log('tool', tool)
      //   if (tool.args.question) {
      //     streamStatus.interrupt = true;
      //     setMessages((prevMessages) => {
      //       return prevMessages.map((prev) => {
      //         if (prev.id === progressAIMessageId) {
      //           return { ...prev, content: tool.args.question }
      //         }
      //         return prev
      //       })
      //     })
      //   }
      // } else if (message.tool_call_chunks && message.tool_call_chunks.length === 1) {
      //   const tool = message.tool_call_chunks[0]
      //   console.log('tool_call_chunks tool', tool)
      //   if (tool.args) {
      //     if (tool.args !== "\"}") {
      //       setMessages((prevMessages) => {
      //         return prevMessages.map((prev) => {
      //           if (prev.id === progressAIMessageId) {
      //             return { ...prev, content: `${prev.content}${tool.args}` }
      //           }
      //           return prev
      //         })
      //       })
      //     }
      //   }
      // }
    }
    if (chunk.event === 'messages/partial') {
      const message = chunk.data[0]
      if (message.content) {
        setMessages((prevMessages) => {
          const existingMessageIndex = prevMessages.findIndex(
            (msg) => msg.id === progressAIMessageId,
          )
          // eslint-disable-next-line no-negated-condition
          if (existingMessageIndex !== -1) {
            return [
              ...prevMessages.slice(0, existingMessageIndex),
              { id: progressAIMessageId, content: message.content, type: 'ai' },
              ...prevMessages.slice(existingMessageIndex + 1),
            ]
          }
          return prevMessages
        })
      }
      if (message.tool_calls && message.tool_calls.length === 1) {
        const tool = message.tool_calls[0]
        if (tool.name === 'Response' && tool.args.file_path) {
          setMessages((prevMessages) => {
            const existingMessageIndex = prevMessages.findIndex(
              (msg) => msg.id === progressAIMessageId,
            )
            const imgs = tool.args.file_path.map((value) => ({
              type: 'image_url',
              // image_url: value.split('/').pop(),
              image_url: value,
            }))
            const content = [
              { type: 'text', text: tool.args.response },
              ...imgs,
            ]
            // eslint-disable-next-line no-negated-condition
            if (existingMessageIndex !== -1) {
              return [
                ...prevMessages.slice(0, existingMessageIndex),
                { id: progressAIMessageId, content, type: 'ai' },
                ...prevMessages.slice(existingMessageIndex + 1),
              ]
            }
            return prevMessages
          })
        }
        if (tool.name === 'AskHuman') {
          streamStatus.interrupt = true;
          setMessages((prevMessages) => {
            const existingMessageIndex = prevMessages.findIndex(
              (msg) => msg.id === progressAIMessageId,
            )
            if (existingMessageIndex !== -1) {
              return [
                ...prevMessages.slice(0, existingMessageIndex),
                {
                  id: progressAIMessageId,
                  content: tool.args.question,
                  type: 'ai',
                },
                ...prevMessages.slice(existingMessageIndex + 1),
              ]
            }
            return prevMessages
          })
        }
      }
    }
    if (chunk.event === 'error') {
      if (chunk.data.error === 'UserInterrupt') {
        // TODO暂时不做操作
      } else {
        setMessages((prevMessages) => {
          return prevMessages.map((prev) => {
            if (prev.id === progressAIMessageId) {
              return { ...prev, content: '系统出错，请稍后尝试', status: 'done' }
            }
            return prev
          })
        });
      }
    }
  }
}

function runStream(params) {
  const client = createClient();
  const others = {};
  
  // @专家模式
  if (params.expert_chat_mode) {
    others.expert_chat_mode = true;
    others.rag_chat_mode = false;
    others.rag_expert_name = '';
  } else { // 是否开启知识库
    others.expert_chat_mode = false;
    others.rag_chat_mode = params.rag_chat_mode
    others.rag_expert_name = params.rag_expert_name
  }

  return client.runs.stream(params.threadId, "agent", {
    // streamMode: ["messages-tuple", "values", "custom"], // "values" | "messages" | "updates" | "events" | "debug" | "custom" | "messages-tuple";
    streamMode: ["values", "messages-tuple", "custom"],
    config: {
      configurable: {
        model_name: params.selectedModel,
        expert_chat_mode: params.expert_chat_mode,
        // model: 'qwen2.5:14b',
        thread_id: params.threadId,
        user_id: params.userId,
        ...others,
      },
    },
    command: streamStatus.interrupt ? { resume: params.content } : {},
    input: streamStatus.interrupt ? {} : { messages: params.messages }
  });
}

function useStream() {
  const { threadId, getThreadById, createThread, patchThread, setSelectList } = useThread()
  const [isRuning, setIsRuning] = useState(false) // 正在运行中
  const [messages, setMessages] = useState([])
  const router = useRouter();
  const submit = useCallback(async (params) => {
    console.log('submit', threadId, params);
    streamStatus.lockruning = true;
    try {
      let tid = threadId
      if (!tid) {
        const thread = await createThread(params.user.userId, params.inputTitle, params.mutil_expert)
        tid = thread.thread_id
        window.history.pushState({}, '', `/chat/${tid}`)
      } else {
        await patchThread(tid, { mutil_expert: params.mutil_expert })
      }
      params.threadId = tid;
      
      setMessages((prev) => {
        const addmsg = {
          id: generateRandomId(),
          type: 'human',
          content: params.messages[0].content,
          additional_kwargs: params.messages[0].additional_kwargs,
        }
        return [ ...prev, addmsg]
      });

      setIsRuning(true)
      const stream = runStream(params);
      if (streamStatus.interrupt) { // 中断消息发送后，进行还原
        streamStatus.interrupt = false;
      }
      if(params.expert_chat_mode) {
        for await (const chunk of stream) {          
        }
        return;
      }
      await streamhandle(stream, { setMessages });
    } catch (error) {
      console.error('error', error)
    }finally{
      qusManage.clean();
      setIsRuning(false);
      streamStatus.lockruning = false;
    }
  }, [threadId])

  const stop = useCallback(async () => {
    try {
      const client = createClient();
      await client.runs.cancel(threadId, streamStatus.runId);
      setIsRuning(false);
    } catch (error) {
      console.error('err', error);
    }
  }, [threadId])
  const cleanSream = useCallback(() => {
    streamStatus.reset();
    qusManage.clean();
    setIsRuning(false);
    setMessages([])
  }, [])

  useEffect(() => {
    if (streamStatus.lockruning) {
      return;
    }
    cleanSream()
    if (!threadId) {
      return
    }
    async function initMessage(threadId) {
      try {
        const thread = await getThreadById(threadId)
        // console.log('thread', thread)
        if (thread.metadata && thread.metadata.mutil_expert) {
          const keys = Object.keys(thread.metadata.mutil_expert);
          setSelectList(keys);
        }else{
          setSelectList([]);
        }

        if (thread.status === 'busy') {
          // if (!thread.values) { // TODO 后端暂时没有保存对话
          //   return;
          // }
          // 恢复已有的对话
          if (thread.values) {
            if (Object.keys(thread.interrupts).length !== 0) {
              const msg = getInterruptMsg(thread.interrupts);
              setMessages([...thread.values.messages, msg])
            }else{
              setMessages(thread.values.messages)
            }  
          }

          // 恢复运行中的ai问答
          const client = createClient();
          const runthreads = await client.runs.list(threadId)
          if (runthreads[0] && runthreads[0].status === 'running') {
            // 默认第一个来处理
            const { run_id } = runthreads[0];
            const content = getContent(runthreads[0].kwargs);
            if (!content) {
              return;
            }
            setMessages((prev) => {
              const unsaveMes = {
                id:generateRandomId(),
                type: 'human',
                content: content.content,
                additional_kwargs: content.additional_kwargs,
              }; // ai处理问答消息时，页面刷新回来并没有保存记录，这里进行还原
              return [ ...prev, unsaveMes];
            });
            const stream = client.runs.joinStream(threadId, run_id);
            streamStatus.runId = run_id;
            setIsRuning(true)
            await streamhandle(stream, { setMessages })
            setIsRuning(false)
          }
        }

        if (thread.status === 'interrupted') {
          if (thread.values) {
            if (Object.keys(thread.interrupts).length !== 0) {
              streamStatus.interrupt = true;
              const msg = getInterruptMsg(thread.interrupts);
              setMessages([...thread.values.messages, msg])
            }else{
              setMessages(thread.values.messages)
            }  
          }
        }

        if (thread.status === 'idle') {
          if (thread.values) {
            setMessages(thread.values.messages)
          }
        }
        if (thread.status === 'error') {
          // TODO 处理错误消息
          if (thread.values) {
            const msg = {
              id: generateRandomId(),
              content: '系统出错，请稍后尝试',
              type: 'ai'
            };
            setMessages(thread.values.messages)
          }
        }
      } catch (error) {
        console.log(error);
        if (error.message) {
          if (error.message.indexOf('not found') !== -1) {
            router.replace('/');
          }
        }
      }
    }
    initMessage(threadId)
  }, [threadId])

  return {
    isRuning,
    submit,
    stop,
    cleanSream,
    messages,
    setMessages,
  }
}

const MessageContext = createContext<{ messages: any[] } | undefined>(undefined)
const ActionContext = createContext<{
  isRuning: boolean;
  submit: (params: any) => Promise<void>;
  stop: () => Promise<void>;
  cleanSream: () => void;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
} | undefined>(undefined)

export function StreamProvider({ children }) {
  const { messages, isRuning, submit, cleanSream, stop, setMessages } = useStream();
  const actions = useMemo(() => ({
    isRuning,
    submit,
    stop,
    cleanSream,
    setMessages,
  }), [isRuning, submit, stop, cleanSream, setMessages])

  const messageValue = useMemo(() => ({
    messages
  }), [messages])

  return (
    <ActionContext.Provider value={actions}>
      <MessageContext.Provider value={messageValue}>
        {children}
      </MessageContext.Provider>
    </ActionContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessageContext)
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessageContext')
  }
  return context
}

export function useAction() {
  const context = useContext(ActionContext)
  if (context === undefined) {
    throw new Error('useAction must be used within a ActionContext')
  }
  return context
}