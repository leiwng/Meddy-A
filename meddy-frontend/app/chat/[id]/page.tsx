'use client'
import ChatUI from '@/components/chatui';

import { useThread } from '@/contexts/ThreadContext';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ChatHistory() {
  const params = useParams();

  const { setThreadId } = useThread();

  const { id } = params;
  useEffect(() => {
    setThreadId(id as string);
  }, []);

  return <ChatUI />;
}