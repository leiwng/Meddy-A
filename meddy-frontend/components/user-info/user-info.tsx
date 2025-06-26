'use client'
import React, { useMemo, useState } from 'react'
import RightIcon from '@/components/ui/right-icon'
import { Button, Drawer, Form, Input } from 'antd'
import { useAuthContext } from '@/auth/hooks'

const { TextArea } = Input

export default function UserInfo() {
  const [open, setOpen] = useState(false)

  const { user } = useAuthContext()

  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }
  const width = (window?.innerWidth || 800) - 260
  const uinfo = useMemo(() => {
    if (!user) {
      return { name: '' };
    }
    return {
      name: user.full_name ? user.full_name: user.username,
    };
  }, [user]);

  return (
    <>
      <RightIcon onClick={showDrawer} />
      <Drawer title='个人信息' onClose={onClose} open={open} width={width}>
        <div
          style={{
            padding: '20px',
            width: '500px',
            margin: '0 auto', // 水平居中
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: 'calc(100% - 40px)', // 减去padding的高度
          }}>
          <Form layout='vertical' initialValues={uinfo}>
            
            <Form.Item
              label='名称'
              name='name'
              rules={[{ required: true, message: '请输入名称' }]}>
              <Input placeholder='请输入名称' size="large" />
            </Form.Item>
           
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                保存
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </>
  )
}