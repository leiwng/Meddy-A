'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message, Tabs, Space } from 'antd';
import { LockOutlined, UserOutlined, MobileOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/auth/hooks';
import { setSession } from '@/auth/context/jwt/utils';
import { signInWithPassword, signInWithPhone } from '@/auth/context/jwt/action';
import { handleError} from '@/utils/util';

const SignInPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [activeTab, setActiveTab] = useState('password');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const { checkUserSession } = useAuthContext();
  const [phoneForm] = Form.useForm();
  
  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      if (activeTab === 'password') {
        await signInWithPassword({ username: values.username, password: values.password });
      } else {
        await signInWithPhone({ phone: values.phone, code: values.code });
      }
      await checkUserSession?.();
      // setLoading(false);
      // window.location.href = '/';
      router.refresh(); // 刷新服务器组件数据
      router.push('/'); // 客户端导航
    } catch (error) {
      setLoading(false);
      const txt = handleError(error, '注册失败，请稍后再试')
      messageApi.error(txt);
    }
  };

  const sendVerificationCode = async (phone: string) => {
    try {
      await fetch('/api/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      messageApi.success('验证码已发送');
      // Start countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      messageApi.error('发送验证码失败');
    }
  };

  const items = [
    {
      key: 'password',
      label: '账号密码登录',
      children: (
        <Form
          name="password_login"
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Link href="/auth/forgot-password" className="text-blue-600">
                忘记密码
              </Link>
              <Link href="/auth/signup" className="text-blue-600">
                立即注册
              </Link>
              <Link href="/auth/user-pwd" className="text-blue-600">
                用户名注册
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }} size="large">
              登录
            </Button>
          </Form.Item>

          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            注册登录即代表已阅读并同意我们的
            <Link target="_blank" rel="noopener noreferrer" href="/term-use" className="text-blue-600"> 用户协议 </Link>
            与
            <Link target="_blank" rel="noopener noreferrer"  href="/privacy-policy" className="text-blue-600"> 隐私政策</Link>
          </div>
        </Form>
      ),
    },
    {
      key: 'phone',
      label: '手机验证码登录',
      children: (
        <Form
          name="phone_login"
          onFinish={onFinish}
          form={phoneForm}
        >
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: '请输入手机号!' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' },
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="手机号" size="large" />
          </Form.Item>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <Form.Item
              name="code"
              rules={[{ required: true, message: '请输入验证码!' }]}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Input
                prefix={<span style={{ fontWeight: 'bold' }}>#</span>}
                placeholder="验证码"
                size="large"
              />
            </Form.Item>

            <Button
              size="large"
              disabled={countdown > 0}
              onClick={() => {
                const phone = phoneForm.getFieldValue('phone');
                if (phone && /^1[3-9]\d{9}$/.test(phone)) {
                  sendVerificationCode(phone);
                } else {
                  messageApi.error('请输入正确的手机号');
                }
              }}
            >
              {countdown > 0 ? `${countdown}s` : '获取验证码'}
            </Button>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }} size="large">
              登录
            </Button>
          </Form.Item>

          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            注册登录即代表已阅读并同意我们的
            <Link target="_blank" rel="noopener noreferrer" href="/term-use" className="text-blue-600"> 用户协议 </Link>
            与
            <Link target="_blank" rel="noopener noreferrer" href="/privacy-policy" className="text-blue-600"> 隐私政策</Link>
            ，未注册的手机号将自动注册
          </div>
        </Form>
      ),
    },
  ];

  return (
    <div className="login-container">
      {contextHolder}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        centered
        items={items}
        style={{ width: 330 }}
      />
    </div>
  );
};

export default SignInPage;