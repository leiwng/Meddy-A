'use client'
import React, { useState, useMemo } from 'react'
import { signOut } from '@/auth/context/jwt/action'
import { useAuthContext } from '@/auth/hooks'
import { useRouter } from 'next/navigation'
import RightIcon from '@/components/ui/right-icon'
import UserIcon from '@/components/ui/user-icon'
import ExpertInfo from '@/components/expert-info/expert-info';
import UserInfo from '@/components/user-info/user-info';
import { Tooltip } from 'antd';
import { useSettings } from '@/contexts/SettingContext'

export default function Setting() {
  const { checkUserSession, user } = useAuthContext()
  const { isMobile, collapsed, toggleCollapsed } = useSettings()
  const router = useRouter()
  const onlogout = async () => {
    try {
      await signOut()
      await checkUserSession?.()
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const gotermuse = () => {
    window.open('/term-use')
  }

  const goprivacypolicy = () => {
    window.open('/privacy-policy')
  }
  const onClose = () => {
    toggleCollapsed();
  };
  const uinfo = useMemo(() => {
    if (!user) {
      return { name: '' };
    }
    return {
      name: user.full_name ? user.full_name: user.username,
    };
  }, [user]);

  return (
    <div className='setting-page'>
      <div className='content center'>
        <div className='title'>
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
        设置
        </div>
        <div className='setting-block'>
          <div className='set-name'>账号设置</div>
          <div className='setlist'>
            <div className='set-item'>
              <div className='item-name'>
                <UserIcon />
                <div>{uinfo.name}</div>
              </div>
              <div className='action'>
                <UserInfo />
              </div>
            </div>
            <div className='set-item'>
              <div className='item-name'>普通用户</div>
              <div className='action'>
                <ExpertInfo />
              </div>
            </div>
            <div className='set-item'>
              <div className='item-name'>
                手机号
                <div className='item-value'>13308022222</div>
              </div>
              <div className='action'></div>
            </div>
          </div>
        </div>
        <div className='setting-block'>
          <div className='set-name'>服务协议</div>
          <div className='setlist'>
            <div className='set-item'>
              <div className='item-name'>用户协议</div>
              <div className='action'>
                <RightIcon onClick={gotermuse}/>
              </div>
            </div>
            <div className='set-item'>
              <div className='item-name'>隐私政策</div>
              <div className='action'> <RightIcon onClick={goprivacypolicy}/></div>
            </div>
          </div>
        </div>
        <div className='setting-block'>
          <button onClick={onlogout}>退出登录</button>
        </div>
      </div>
    </div>
  )
}
