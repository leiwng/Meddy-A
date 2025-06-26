'use client'

import { useState } from 'react'
import { cn } from '@/utils/cn'
import { useAuthContext } from '@/auth/hooks';
import { useThread } from '@/contexts/ThreadContext';
import { useRouter } from 'next/navigation';

export default function TypeSelect() {
  const { user } = useAuthContext();
  const { selected, setSelected, otherThreads, setThreadId } = useThread();
  const router = useRouter();

  const handleTypeChange = (type: 'ai' | 'user') => () => {
    setSelected(type)
  }
  // console.log('user', user)
  if (user && (user.role === 'user' || user.role === 'admin')){
    return null;
  }
  const userQuestionCount = otherThreads.length;
  return (
    <div className="typebox">
      <div className="type-container">
        <div 
          className={cn('type-item', selected === 'ai' && 'selected')}
          onClick={handleTypeChange('ai')}
        >
          AI对话
        </div>
        <div 
          className={cn('type-item', selected === 'user' && 'selected')}
          onClick={handleTypeChange('user')}
        >
          {userQuestionCount > 0 && (
            <div className="top-right">
              {userQuestionCount > 99 ? '99+' : userQuestionCount}
            </div>
          )}
          用户答疑
        </div>
      </div>
    </div>
  )
}