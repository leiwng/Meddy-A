'use client'

import Send from './send'
import ChatHeader from './chat-header'
import { useStickToBottomContext, StickToBottom } from 'use-stick-to-bottom'
import HumanMessage from './messages/human'
import AssistantMessage from './messages/ai'
import { useSocket } from '@/contexts/SocketContext'
import { useEffect, useRef } from 'react'
import { useAuthContext } from '@/auth/hooks'

import { useThread } from '@/contexts/ThreadContext'
import { generateRandomId } from '@/utils/util'
import { DownOutlined } from '@ant-design/icons';
import { useMessages, useAction } from '@/contexts/StreamContext'

function SocketRecieve() {
  const { lastMessage, isConnected } = useSocket()
  const { user } = useAuthContext()

  const { setMessages } = useAction();
  const { getOtherThreads, otherThreads, threadId } = useThread()

  useEffect(() => {
    if (!isConnected) {
      return
    }
    if (!lastMessage.thread_id) {
      return
    }
    console.log('lastMessage', lastMessage)
    if (!lastMessage.additional_kwargs.uid) {
      // 没有发送者信息
      return
    }
    console.log(
      'threadId',
      threadId,
      user.userId,
      lastMessage.additional_kwargs.uid,
    )
    if (user.userId === lastMessage.additional_kwargs.uid) {
      // 转发给自己的消息不处理
      return
    }
    // 专家需要更新列表
    if (user.role === 'expert') {
      const thread = otherThreads.find(
        (v) => v.thread_id === lastMessage.thread_id,
      )
      if (!thread) {
        getOtherThreads(user.userId)
      }
    }
    // 进入聊天界面更新聊天信息
    if (!threadId) {
      return
    }
    console.log('data.thread_id', lastMessage.thread_id)
    if (threadId === lastMessage.thread_id) {
      setMessages((pre) => {
        return [
          ...pre,
          { ...lastMessage, id: generateRandomId(), type: 'human' },
        ]
      })
    }
  }, [lastMessage, isConnected, threadId])
  return <></>
}

function MessageContent() {
  const { messages } = useMessages();
  // console.log('messages', messages)
  return (
    <>
      {messages.map((message, index) => (
        <div key={message.id || `${message.type}-${index}`}>
          {message.type === 'human' && (
            <HumanMessage
              // key={message.id || `${message.type}-${index}`}
              message={message}
            />
          )}
          {message.type === 'ai' && (
            <AssistantMessage
              // key={message.id || `${message.type}-${index}`}
              message={message}
            />
          )}
        </div>
      ))}
    </>
  )
}

function EmptyContent() {
  const { messages } = useMessages();
  if (messages.length > 0) {
    return <></>
  }
 return  (<div className='empty-chat'>
      <div className='empty-chat-text'>我是医小助，我可以为你解答遗传学知识，以及处理显微镜图像</div>
  </div>)
}

export default function Chat() {
  // const { messages } = useChat()
 const autoScrollEnabled = useRef(true);
  return (
    <div className='chat-ui'>
      <SocketRecieve />
      <ChatHeader />
      <div className='chat-content'>
        <StickToBottom className='chat-zone'  >
          <StickToBottom.Content className='chat-column'>
            <div className='chat-list' >        
                  <MessageContent />        
            </div>
          </StickToBottom.Content>
          <ScrollToBottom autoScrollEnabled={autoScrollEnabled} />
        </StickToBottom>
        <div className='bottom-content'>
          <div className='bottom-wrapper'>
            <EmptyContent />
            <Send autoScrollEnabled={autoScrollEnabled} />
            <div className='attention'>内容由ai生成，请仔细甄别</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScrollToBottom({ autoScrollEnabled }) {
  const { messages } = useMessages();
  const { isAtBottom, scrollToBottom, scrollRef } = useStickToBottomContext();
  const lastInvokeRef = useRef<number>(0);
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);
  // const autoScrollEnabled = useRef(true);

  // 监听用户滚动行为
  useEffect(() => {
    const scrollEl = scrollRef?.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      // 判断是否在底部
      const atBottom =
        Math.abs(
          scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight
        ) < 2;
      autoScrollEnabled.current = atBottom;
    };

    scrollEl.addEventListener('scroll', handleScroll);
    return () => {
      scrollEl.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRef]);

  // 自动滚动逻辑（节流）
  useEffect(() => {
    if (!autoScrollEnabled.current) return; // 用户未在底部时不自动滚动

    const now = Date.now();
    const elapsed = now - lastInvokeRef.current;

    if (elapsed > 500) {
      scrollToBottom();
      lastInvokeRef.current = now;
    } else {
      if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
      throttleTimeout.current = setTimeout(() => {
        scrollToBottom();
        lastInvokeRef.current = Date.now();
      }, 500 - elapsed);
    }

    return () => {
      if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
    };
  }, [messages, scrollToBottom]);

  return (
    !isAtBottom && (
      <div
        className="scroll-to-bottom"
        onClick={() => {
          scrollToBottom();
          autoScrollEnabled.current = true; // 用户手动点按钮后恢复自动滚动
        }}
      >
        <DownOutlined />
      </div>
    )
  );
}