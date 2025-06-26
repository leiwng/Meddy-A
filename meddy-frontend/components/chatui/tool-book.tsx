import { FilePdfOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { Avatar, Tooltip, Button, message, Popover } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import axios, { endpoints } from '@/utils/axios'
import { cn } from '@/utils/cn'
import { useSettings } from '@/contexts/SettingContext'

export default function ToolBook({ book, setBook, selectList }) {
   const { isMobile, collapsed, toggleCollapsed } = useSettings()
  const container = useRef()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const [data, setData] = useState([])
  const disable = useMemo(() => {
    return selectList.length > 0
  }, [selectList])

  const onselect = (name) => () => {
    setPopoverOpen(false)
    setBook(name)
  }

  const content = (
    <div className='data-list'>
      <div className='data-title'>知识库</div>
      <div className='data-content'>
        {data.map((value) => (
          <div key={value.name} className='data-item'>
            <div className='data-name'>
              {value.name}
              <Button
                onClick={onselect(value.name)}
                size='small'
                type='primary'
                style={{ float: 'right' }}>
                启用
              </Button>
            </div>
            <div className='data-description'>{value.description}</div>
          </div>
        ))}
      </div>
      {data.length === 0 && <div className='no-content'>暂无数据</div>}
    </div>
  )

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(endpoints.expert.list)
        // console.log('res', res)
        if (res.data && res.data.data.length > 0) {
          setData(res.data.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])
  const ondeselect = () => {
    if (disable) return;
    setBook('')
  }

  // console.log('disable', selectList, disable)
  return (
    <div className='tool-book' ref={container}>
      {book ? (
        <div
          className={cn('took selected', disable ? 'disabled' : '')}
          onClick={ondeselect}>
          <FilePdfOutlined />
          {isMobile ? book.slice(0, 4): book}
        </div>
      ) : (
        <Popover
          open={popoverOpen}
          onOpenChange={(visible) => {
            if (disable) return;
            setPopoverOpen(visible)
          }}
          getPopupContainer={() => container.current}
          content={content}
          trigger='click'>
          <div className={cn('took', disable ? 'disabled' : '')}>
            <FilePdfOutlined style={{ marginRight: '4px' }} />
           {isMobile ? '' : '知识库'} 
          </div>
        </Popover>
      )}
      {
       disable && <span className='tooltip'>咨询专家模式下，知识库不可用</span>
      }
    </div>
  )
}
