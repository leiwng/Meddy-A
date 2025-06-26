'use client'
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react'
import { CONFIG } from '@/config-global'
import { useAuthContext } from '@/auth/hooks'
import { WebSocketClient } from './socket-client'
import { generateRandomId } from '@/utils/util';

interface SocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  lastMessage: {
    additional_kwargs: {
      uid: string
    }
    thread_id: string
    content: string
  }
}

const MAX_RETRIES = 5
const RETRY_DELAY = 3000

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  lastMessage: {
    additional_kwargs: { uid: '' },
    thread_id: '',
    content: '',
  },
})

export const useSocket = () => useContext(SocketContext)

interface SocketProviderProps {
  children: React.ReactNode
}
// 专家通信 socket
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState({
    additional_kwargs: { uid: '' },
    thread_id: '',
    content: '',
  })
  const wsClient = useRef<WebSocketClient | null>(null)
  const { user } = useAuthContext()

  useEffect(() => {
    if (!user) return
    const chatid = generateRandomId();
    wsClient.current = new WebSocketClient(`${CONFIG.socketUrl}/expert_chat/${chatid}` as string, {
      maxRetries: 5,
      retryDelay: 3000,
      debug: true,
    })

    wsClient.current.on('open', () => {
      console.log('WebSocket connected')
      setIsConnected(true)
    })

    wsClient.current.on('close', () => {
      setIsConnected(false)
    })

    wsClient.current.on('message', (data) => {
      setLastMessage({
        thread_id: data.thread_id,
        content: data.content,
        additional_kwargs: data.additional_kwargs,
      })
    })

    wsClient.current.connect()

    return () => {
      wsClient.current?.disconnect()
    }
  }, [user])

  return (
    <SocketContext.Provider
      value={{
        socket: wsClient.current?.ws ?? null,
        isConnected,
        lastMessage,
      }}>
      {children}
    </SocketContext.Provider>
  )
}
