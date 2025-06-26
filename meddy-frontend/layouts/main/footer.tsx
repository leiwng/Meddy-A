'use client'
import { useAuthContext } from '@/auth/hooks'
import { useRouter } from 'next/navigation'
import { useThread } from '@/contexts/ThreadContext'

const oknamse = ['admin', 'ly', 'hehe', 'dongdong', 'guestA', 'guestB'];

export default function Footer({ isMobile }) {
  const { user } = useAuthContext()
  const router = useRouter()
  const { setThreadId } = useThread()
  const onsetting = () => {
    setThreadId('')
    router.push('/setting')
  }
  const onmine = () => {
    //  ly, hehe, dongdong, guestA, guestB
    const ok = oknamse.includes(user.username)
    if (ok) {
      setThreadId('');
      router.push('/mine');
    }
  }
  // console.log('isMobile', isMobile)
  return (
    <div className='bottom'>
      <div className='userinfo' onClick={onmine}>
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
          />
          <path
            d='M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </svg>
        <div className='username'>{user?.username}</div>
      </div>
      {
        !isMobile &&       <div className='setting' onClick={onsetting}>
        <svg
          viewBox='0 0 1024 1024'
          version='1.1'
          xmlns='http://www.w3.org/2000/svg'
          p-id='9360'
          width='24'
          height='24'>
          <path
            d='M944.48 552.458667l-182.357333 330.666666a73.792 73.792 0 0 1-64.565334 38.325334h-362.133333a73.792 73.792 0 0 1-64.565333-38.325334l-182.357334-330.666666a75.338667 75.338667 0 0 1 0-72.682667l182.357334-330.666667a73.792 73.792 0 0 1 64.565333-38.325333h362.133333a73.792 73.792 0 0 1 64.565334 38.325333l182.357333 330.666667a75.338667 75.338667 0 0 1 0 72.682667z m-55.989333-31.146667a10.773333 10.773333 0 0 0 0-10.378667l-182.037334-330.666666a10.517333 10.517333 0 0 0-9.205333-5.482667H335.733333a10.517333 10.517333 0 0 0-9.205333 5.482667l-182.037333 330.666666a10.773333 10.773333 0 0 0 0 10.378667l182.037333 330.666667a10.517333 10.517333 0 0 0 9.205333 5.472h361.514667a10.517333 10.517333 0 0 0 9.205333-5.472l182.037334-330.666667zM513.738667 682.666667c-94.261333 0-170.666667-76.405333-170.666667-170.666667s76.405333-170.666667 170.666667-170.666667c94.250667 0 170.666667 76.405333 170.666666 170.666667s-76.416 170.666667-170.666666 170.666667z m0-64c58.912 0 106.666667-47.754667 106.666666-106.666667s-47.754667-106.666667-106.666666-106.666667-106.666667 47.754667-106.666667 106.666667 47.754667 106.666667 106.666667 106.666667z'
            fill='#000000'
            p-id='9361'></path>
        </svg>
      </div>
      }
    </div>
  )
}
