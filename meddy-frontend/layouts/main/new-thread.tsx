'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useThread } from '@/contexts/ThreadContext'
import { useSettings } from '@/contexts/SettingContext'

export default function NewThread() {
  const pathname = usePathname();
  const router = useRouter();
  const { setThreadId } = useThread();
  const { isMobile, collapsed, toggleCollapsed } = useSettings()

  const onnewai = () => {
    console.log('pathname', pathname);
    if (pathname === '/') {
      return;
    }
    if (isMobile) {
      toggleCollapsed()
    }
    setThreadId('');
    router.push('/');
  };
  return (
    <div>
      <button
        onClick={onnewai}
      >
        新建对话
      </button>
    </div>
  )
}
