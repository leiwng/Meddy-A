import { useEffect, useMemo, useRef, useState } from 'react'
import { message } from 'antd'
import axios, { endpoints } from '@/utils/axios'
import { Popover, Popconfirm } from 'antd'
import Image from 'next/image'
import { Avatar, Tooltip, Button } from 'antd'
import { UserOutlined, MessageOutlined } from '@ant-design/icons'

const ExpertItem = ({ expert, onSelect }) => {
  const {
    username,
    avatar,
    organization = '华西附二院妇产科',
    responseCount = 10000,
    expertises = '遗传科学，神经科学，生物医学。病理研究，中药理论都擅长',
  } = expert
  const formattedResponseCount = responseCount > 100 ? '100+' : responseCount
  return (
    <div className='expert-item'>
      <div className='expert-basic'>
        <Avatar size={40} src={avatar} icon={!avatar && <UserOutlined />} />
        <div className='expert-info'>
          <div className='expert-main'>
            <Tooltip title={username.length > 10 ? username : ''}>
              <span className='expert-name'>
                {username.length > 10
                  ? `${username.slice(0, 10)}...`
                  : username}
              </span>
            </Tooltip>
            <span className='expert-responses'>
              已回复 {formattedResponseCount} 次
            </span>
          </div>
          <Tooltip title={organization.length > 15 ? organization : ''}>
            <div className='expert-org'>
              {organization.length > 15
                ? `${organization.slice(0, 15)}...`
                : organization}
            </div>
          </Tooltip>
        </div>
      </div>
      <div className='expert-bottom'>
        <div className='expert-expertise'>{expertises}</div>
      </div>
      <div className='expert-btn'>
        <Button
          type='primary'
          size='small'
          icon={<MessageOutlined />}
          onClick={(e) => {
            console.log('username', username)
            e.stopPropagation()
            onSelect(username)
          }}>
          咨询
        </Button>
      </div>
    </div>
  )
}

export default function ToolContact({
  selectList,
  setSelectList,
  threadId,
  patchThread,
}) {
  const container = useRef()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [data, setData] = useState([])
  const [messageApi, contextHolder] = message.useMessage()

  const onSelect = (eid) => {
    if (selectList.length >= 2) {
      messageApi.error('无法添加更多专家')
      setPopoverOpen(false)
      return
    }
    setPopoverOpen(false)
    setSelectList((prev) => {
      const newSet = new Set([...prev])
      newSet.add(eid)
      return [...newSet]
    })
  }

  const content = (
    <div className='expert-list'>
      <div className='expert-title'>专家列表</div>
      {data.map((expert) => (
        <ExpertItem key={expert.username} expert={expert} onSelect={onSelect} />
      ))}
      {data.length === 0 && <div className='no-content'>暂无数据</div>}
    </div>
  )

  const onConfirm = (eid) => ()=> {
    const newSet = new Set(selectList)
    if (newSet.has(eid)) {
      newSet.delete(eid)
      setSelectList([...newSet])
      if (threadId) {
        const mutil_expert = [...newSet].reduce(
          (a, b) => ({ ...a, [b]: b }),
          {},
        )
        patchThread(threadId, { mutil_expert })
      }
    }
  }

  useEffect(() => {
    axios
      .get(endpoints.auth.users, { params: { role: 'expert' } })
      .then((res) => {
        const { users } = res.data
        setData(users)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  useEffect(() => {
    if (!threadId) {
      setSelectList([])
    }
  }, [threadId])


  return (
    <>
      {contextHolder}
      {/* <div className='select-list'>
        {selectList.map((v) => (
          <Popconfirm
            key={v}
            icon={null}
            title=''
            description='确定不再与专家进行沟通?'
            onConfirm={onConfirm(v)}
            // onCancel={cancel}
            okText='确定'
            cancelText='取消'>
            <div
              className='expert-tag'
              style={{
                height: '28px',
                lineHeight: '26px',
                fontSize: '14px',
              }}>
              <div className='expert-name'>@{v}</div>
              <div className='close'></div>
            </div>
          </Popconfirm>
        ))}
      </div> */}
      <div className='tool-contact' ref={container}>
        <Popover
          open={popoverOpen}
          onOpenChange={(visible) => setPopoverOpen(visible)}
          getPopupContainer={() => container.current}
          content={content}
          trigger='click'>
          <div
            className='contact'
            onClick={() => {
              setPopoverOpen(true)
            }}>
            <Image src='/contact.svg' width={24} height={24} alt='咨询专家' />
            <span className='tooltip'>咨询专家</span>
          </div>
        </Popover>
      </div>
    </>
  )
}
