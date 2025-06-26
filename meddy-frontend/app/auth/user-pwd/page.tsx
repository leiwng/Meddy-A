'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/auth/context/jwt';
import { array } from 'zod';
import { handleError} from '@/utils/util';

const SignInPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const onFinish = async (data) => {
    try {
      await signUp({
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      router.push('/auth/signin');
    } catch (error) {
      console.error('error', error);
      
      const txt = handleError(error, '注册失败，请稍后再试')
      messageApi.error(txt);
      // setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  };

  return (

    <div className="">
      {contextHolder}
      <Form
        name="signup"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        style={{ width: 300 }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="用户名" size='large' />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
            size='large'
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
            size='large'
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" loading={loading} htmlType="submit" style={{ width: '100%' }} size='large' >
            注册
          </Button>
        </Form.Item>
      </Form>
      <div className="info">
        已有账号？
        <Link href="/auth/signin">去登录</Link>
      </div>
    </div>

  );
};

export default SignInPage;