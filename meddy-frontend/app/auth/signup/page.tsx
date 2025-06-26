'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message, Space } from 'antd';
import { LockOutlined, MobileOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/auth/context/jwt';
import { handleError} from '@/utils/util';

const SignUpPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const router = useRouter();

  const sendVerificationCode = async (phone: string) => {
    try {
      await fetch('/api/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      messageApi.success('验证码已发送');
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

  const onFinish = async (data: any) => {
    try {
      setLoading(true);
      await signUp({
        phone: data.phone,
        password: data.password,
        code: data.code,
      });
      setLoading(false);
      router.push('/auth/signin');
    } catch (error) {
      setLoading(false);
      
      const txt = handleError(error, '注册失败，请稍后再试')
      messageApi.error(txt);
    }
  };

  return (
    <div className="signup-container">
      {contextHolder}
      <Form
        form={form}
        name="signup"
        onFinish={onFinish}
        style={{ width: 300 }}
      >
        <Form.Item
          name="phone"
          rules={[
            { required: true, message: '请输入手机号!' },
            { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确!' },
          ]}
        >
          <Input 
            prefix={
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MobileOutlined />
                <span style={{ color: '#666' }}>+86</span>
              </span>
            } 
            placeholder="手机号" 
            size="large" 
          />
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
              const phone = form.getFieldValue('phone');
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

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirm"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不匹配!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="确认密码"
            size="large"
          />
        </Form.Item>

        <div className="agreement" style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginBottom: '16px' }}>
          注册即代表已阅读并同意我们的
          <Link target="_blank" rel="noopener noreferrer"   href="/term-use" className="text-blue-600"> 用户协议 </Link>
          与
          <Link target="_blank" rel="noopener noreferrer"  href="/privacy-policy" className="text-blue-600"> 隐私政策</Link>
        </div>

        <Form.Item>
          <Button 
            type="primary"
            loading={loading} 
            htmlType="submit" 
            style={{ width: '100%' }} 
            size="large"
          >
            注册
          </Button>
        </Form.Item>
      </Form>

      <div className="info" style={{ textAlign: 'center' }}>
        已有账号？
        <Link href="/auth/signin">去登录</Link>
      </div>
    </div>
  );
};

export default SignUpPage;