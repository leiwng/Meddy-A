'use client'
import React, { useState, useMemo } from 'react'
import RightIcon from '@/components/ui/right-icon'
import { Button, Drawer, Form, Input, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import UploadImg from '@/components/upload-img/upload-img'

interface ExpertFormValues {
  name: string;
  organization: string;
  department: string;
  departmentPhone: string;
  workBadge: string;
  practiceLicense: string;
  practiceCode: string;
  qualificationCertificate: string;
  qualificationCode: string;
  idNumber: string;
  idCardFront: string[];

}

const ExpertInfo = () => {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const [loading, setLoading] = useState(false)

  const width = (window?.innerWidth || 800) - 260
  const onFinish = async (values: ExpertFormValues) => {
    console.log('values', values)
    try {
      setLoading(true)

      // Call your API endpoint
      const response = await fetch('/api/expert/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('提交失败')
      }

      messageApi.success('专家信息提交成功')
      setOpen(false)
      form.resetFields()
    } catch (error) {
      messageApi.error(
        '提交失败：' + (error instanceof Error ? error.message : '未知错误'),
      )
    } finally {
      setLoading(false)
    }
  }
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }
  const handleIdCardChange = (type: 'front' | 'back', value: string) => {
    const currentValues = form.getFieldValue('idCardFront') || [];
    console.log('currentValues', currentValues)
    if (type === 'front') {
      form.setFieldsValue({ idCardFront: [value, currentValues[1]] })
    } else {
      form.setFieldsValue({ idCardFront: [currentValues[0], value] })
    }
  }
  const uinfo = useMemo(() => {
    return {
      name: '额外范围',
      organization: '',
      department: '',
      departmentPhone: '',
      workBadge: '5159d66dc6c94122a90614ca363f0c93.jpg',
      practiceLicense: '',
      practiceCode: '',
      qualificationCertificate: '',
      qualificationCode: '',
      idNumber: '',
      idCardFront: ['', ''],
    };
  }, []);

  return (
    <>
      <RightIcon onClick={() => setOpen(true)} />
      <Drawer
        title='注册专家'
        onClose={() => setOpen(false)}
        open={open}
        width={width}>
        <div
          style={{
            width: '500px',
            margin: '0 auto',
          }}>
          <Form
            layout='horizontal'
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={uinfo}
          >
            <Form.Item
              label='姓名'
              name='name'
              rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder='请输入姓名' />
            </Form.Item>

            <Form.Item
              label='所在单位'
              name='organization'
              rules={[{ required: true, message: '请输入所在单位' }]}>
              <Input placeholder='请输入所在单位' />
            </Form.Item>

            <Form.Item
              label='所在科室/部门'
              name='department'
              rules={[{ required: true, message: '请输入科室/部门' }]}>
              <Input placeholder='请输入科室/部门' />
            </Form.Item>

            <Form.Item
              label='科室/部门电话'
              name='departmentPhone'
              rules={[{ required: true, message: '请输入科室/部门电话' }]}>
              <Input placeholder='请输入科室/部门电话' />
            </Form.Item>

            <Form.Item
              label='工作胸牌'
              name='workBadge'
              rules={[{ required: true, message: '请上传工作胸牌照片' }]}>
              <UploadImg />
            </Form.Item>

            <Form.Item
              label='医师执业证书'
              name='practiceLicense'
              rules={[{ required: true, message: '请上传医师执业证书照片' }]}>
              <UploadImg />
            </Form.Item>

            <Form.Item
              label='执业证编码'
              name='practiceCode'
              rules={[{ required: true, message: '请输入执业证编码' }]}>
              <Input placeholder='请输入执业证编码' />
            </Form.Item>

            <Form.Item
              label='医师资格证书'
              name='qualificationCertificate'
              rules={[{ required: true, message: '请上传医师资格证书照片' }]}>
              <UploadImg />
            </Form.Item>

            <Form.Item
              label='资格证编码'
              name='qualificationCode'
              rules={[{ required: true, message: '请输入资格证编码' }]}>
              <Input placeholder='请输入资格证编码' />
            </Form.Item>

            <Form.Item
              label='身份证号码'
              name='idNumber'
              rules={[
                { required: true, message: '请输入身份证号码' },
                {
                  pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                  message: '请输入正确的身份证号码',
                },
              ]}>
              <Input placeholder='请输入身份证号码' />
            </Form.Item>

            <Form.Item
              label='身份证正面照片'
              required
              // style={{ marginBottom: 10 }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <Form.Item
                  name={['idCardFront', 0]}
                  rules={[{ required: true, message: '请上传身份证正面照片' }]}
                  style={{ marginBottom: 0 }}>
                  <UploadImg
                    onChange={(value) => handleIdCardChange('front', value)}
                  />
                </Form.Item>
                <Form.Item
                  name={['idCardFront', 1]}
                  rules={[{ required: true, message: '请上传身份证反面照片' }]}
                  style={{ marginBottom: 0 }}>
                  <UploadImg
                    onChange={(value) => handleIdCardChange('back', value)}
                  />
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type='primary' htmlType='submit' block loading={loading}>
                提交申请
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Drawer>
    </>
  )
}

export default ExpertInfo
