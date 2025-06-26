'use client'

import React, { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { MobileOutlined, LockOutlined, LeftOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [phone, setPhone] = useState('')
  const router = useRouter()

  const sendVerificationCode = async (phoneNumber: string) => {
    try {
      await fetch('/api/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone: phoneNumber }),
      })
      messageApi.success('验证码已发送')
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      messageApi.error('发送验证码失败')
    }
  }

  const verifyCode = async (values: { phone: string; code: string }) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      if (!response.ok) throw new Error('验证失败')

      setPhone(values.phone)
      setCurrentStep(1)
    } catch (error) {
      messageApi.error('验证码验证失败')
    } finally {
      setCurrentStep(1)
      setLoading(false)
    }
  }

  const resetPassword = async (values: {
    password: string
    confirm: string
  }) => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ phone, password: values.password }),
      })
      if (!response.ok) throw new Error('重置失败')

      messageApi.success('密码重置成功')
      router.push('/auth/signin')
    } catch (error) {
      messageApi.error('密码重置失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {contextHolder}
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '24px',
          fontSize: '20px',
          fontWeight: 500,
          color: '#1f2937',
        }}>
        重置统一登录密码
      </h2>

      {currentStep === 0 ? (
        <Form form={form} onFinish={verifyCode}>
          <Form.Item
            name='phone'
            rules={[
              { required: true, message: '请输入手机号!' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' },
            ]}>
            <Input
              prefix={<MobileOutlined />}
              placeholder='手机号'
              size='large'
            />
          </Form.Item>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <Form.Item
              name='code'
              rules={[{ required: true, message: '请输入验证码!' }]}
              style={{ flex: 1, marginBottom: 0 }}>
              <Input
                prefix={<span style={{ fontWeight: 'bold' }}>#</span>}
                placeholder='验证码'
                size='large'
              />
            </Form.Item>

            <Button
              size='large'
              disabled={countdown > 0}
              onClick={() => {
                const phone = form.getFieldValue('phone')
                if (phone && /^1[3-9]\d{9}$/.test(phone)) {
                  sendVerificationCode(phone)
                } else {
                  messageApi.error('请输入正确的手机号')
                }
              }}>
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </div>

          <Form.Item>
            <Button size="large" type='primary' htmlType='submit' loading={loading} block>
              下一步
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Link href='/auth/signin' className='text-blue-600'>
              {' '}
              返回登录{' '}
            </Link>
          </div>
        </Form>
      ) : (
        <div>
          <Button
            type='link'
            icon={<LeftOutlined />}
            onClick={() => setCurrentStep(0)}
            style={{
              marginLeft: -12,
              marginBottom: 16,
              color: '#6b7280',
            }}>
            返回手机验证
          </Button>

          <Form form={form} onFinish={resetPassword}>
            <Form.Item
              name='password'
              rules={[{ required: true, message: '请输入新密码!' }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder='新密码'
                size='large'
              />
            </Form.Item>

            <Form.Item
              name='confirm'
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认新密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不匹配!'))
                  },
                }),
              ]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder='确认新密码'
                size='large'
              />
            </Form.Item>

            <Form.Item>
              <Button type='primary' htmlType='submit' loading={loading} block>
                确认重置
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </div>
  )
}

export default ForgotPassword
