'use client'
import { useSettings } from '@/contexts/SettingContext'
import { ReactNode, useState } from 'react'
import Header from './header'
import Footer from './footer'
import NewThread from './new-thread'
import ThreadList from './thread-list/thread-list'
import TypeSelect from './type-select'
import { cn } from '@/utils/cn'
import { Drawer, Button } from 'antd';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isMobile, collapsed, toggleCollapsed } = useSettings()
  // console.log('collapsed', collapsed)
  const onclose = () => {
    toggleCollapsed();
  };
  return (
    <div className='chatbox'>
      {
        isMobile && !collapsed && <div className='mask' onClick={onclose}></div>
      }
      <div
        className={cn('leftinfo', {
          'chatbox__sidebar--collapsed': collapsed,
          'chatbox__sidebar--expanded': !collapsed,
          'chat-phone': isMobile,
        })}>
        <Header />
        <NewThread />
        <TypeSelect />
        <ThreadList />
        <Footer isMobile={isMobile} />
      </div>

      <div className='rightinfo'>{children}</div>
    </div>
  )
}
