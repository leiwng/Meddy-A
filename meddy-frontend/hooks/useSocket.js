import { useEffect, useRef, useCallback, useState } from 'react';
import { CONFIG } from '@/config-global';
import { useAuthContext } from '@/auth/hooks'
import { useAction } from '@/contexts/StreamContext'
import { useThread } from '@/contexts/ThreadContext';
import { generateRandomId } from '@/utils/util';

export function useSocket(options = {}) {
  const {
    url = CONFIG.socketUrl,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const { user } = useAuthContext();
  const { setMessages } = useAction();
  const { getOtherThreads , otherThreads, threadId } = useThread();

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // 开始重连
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, reconnectDelay);
        } else {
          setError('Max reconnection attempts reached');
        }
      };

      wsRef.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('data', data)
          if (!data.additional_kwargs) {
            return;
          }
          console.log('threadId', threadId, user.userId, data.additional_kwargs.uid)
          if (user.userId === data.additional_kwargs.uid) {
            return;
          }
          const thread = otherThreads.find(v => v.thread_id === data.thread_id);
          if (!thread) {
            getOtherThreads(user.userId);
          }
          if(!threadId){
            return;
          }
          console.log('data.thread_id', data.thread_id)
          if (threadId === data.thread_id) {
            setMessages((pre) => {
              return [...projectHmrEvents, { ...data, id: generateRandomId(), type: 'human', }]
            });
          }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError(error);
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      setError(error);
    }
  }, [url, maxReconnectAttempts, reconnectDelay, threadId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  const sendMessage = useCallback((data) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [isConnected]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    disconnect,
    reconnect: connect
  };
}
