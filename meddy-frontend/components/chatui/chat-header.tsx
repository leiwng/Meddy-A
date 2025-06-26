'use client'
import { useThread } from '@/contexts/ThreadContext';
import {useMemo} from 'react';
import { Tooltip, Button, Radio } from 'antd'
import { useSettings } from '@/contexts/SettingContext'
import { useRouter, usePathname } from 'next/navigation';

export default function ChatHeader() {
    const { collapsed, toggleCollapsed } = useSettings()
  const threadsData = useThread();
  const title: string = useMemo(() => {
    const thread = threadsData.userThreads.find((value) => value.thread_id === threadsData.threadId);
   if(thread && thread.metadata && thread.metadata.title) {
     return thread.metadata.title;
   }
   return '新对话';
  }, [threadsData.userThreads, threadsData.threadId]);
  return <div className="chat-title">
          {
          collapsed && <WrapHeader toggleCollapsed={toggleCollapsed} />
        }
        {title}
  </div>
}

function WrapHeader({ toggleCollapsed }) {
    const pathname = usePathname();
    const router = useRouter();
    const { setThreadId } = useThread();
  const onOpen = () => {
    toggleCollapsed()
  }
  const onnew = () => {
    console.log('pathname', pathname);
    if (pathname === '/') {
      return;
    }
    setThreadId('');
    router.push('/');
  };
  return (
    <div className='wrap-header'>
      <Tooltip title='打开侧栏'>
        <div className='open' onClick={onOpen}>
          <svg
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              d='M4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2H6C4.89543 2 4 2.89543 4 4Z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
            <path d='M12 2V22' stroke='currentColor' strokeWidth='2' />
          </svg>
        </div>
      </Tooltip>

      <Tooltip title='新建对话'>
        <div className='add-chat' onClick={onnew}>
          <svg
            viewBox='0 0 1024 1024'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            p-id='5869'
            width='24'
            height='24'>
            <path
              d='M513.1264 98.065067c-247.637333 0-449.092267 173.568-449.092267 386.901333 0 78.882133 27.306667 154.8288 79.4624 220.706133l-55.637333 111.4112a50.7904 50.7904 0 0 0 52.462933 72.772267l242.107734-34.679467c53.4528 13.994667 110.08 19.182933 164.829866 15.598934a25.6 25.6 0 1 0-3.345066-51.063467 473.2928 473.2928 0 0 1-148.48-14.062933 50.688 50.688 0 0 0-20.1728-1.194667l-241.5616 35.498667 55.6032-111.4112a52.497067 52.497067 0 0 0-6.280534-55.944534c-44.373333-55.569067-67.7888-120.456533-67.7888-187.630933 0-185.105067 178.4832-335.701333 397.892267-335.701333S911.018667 299.861333 911.018667 484.9664a286.72 286.72 0 0 1-15.121067 91.921067 25.634133 25.634133 0 0 0 48.5376 16.418133 339.490133 339.490133 0 0 0 17.749333-108.3392c0-213.333333-201.4208-386.901333-449.058133-386.901333'
              fill='#C0C0C0'
              p-id='5870'></path>
            <path
              d='M879.0016 704h-102.7072v-102.7072a25.6 25.6 0 0 0-51.2 0v102.741333h-102.7072a25.6 25.6 0 0 0 0 51.2h102.741333v102.673067a25.6 25.6 0 0 0 51.2 0v-102.7072h102.673067a25.6 25.6 0 0 0 0-51.2'
              fill='#C0C0C0'
              p-id='5871'></path>
          </svg>
        </div>
      </Tooltip>
    </div>
  )
}
