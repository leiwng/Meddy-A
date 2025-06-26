'use client'
import { useSettings } from '@/contexts/SettingContext'
import { Tooltip } from 'antd'

export default function Header() {
  const { toggleCollapsed } = useSettings()
  const onClose = () => {
    toggleCollapsed()
  }
  return (
    <div className='logo'>
      <div className="logo-line">
        <div>医小助</div>
        <Tooltip title='收起侧栏'>
          <div className='logo-svg-wrap' onClick={onClose}>
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
      </div>
    </div>
  )
}
