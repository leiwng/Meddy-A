'use client'
import React, { useState, useEffect } from 'react'
import { Upload, message, Image as AntImage, Button } from 'antd'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons'
import { CONFIG } from '@/config-global'
import { STORAGE_KEY } from '@/auth/context/jwt/constant'
import Image from 'next/image'
import { EyeOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import styles from './upload-img.module.css'
import { useModal } from '@/contexts/ModalContext'

const getBase64 = (img, callback: (url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

export default function UploadImg(props: any) {
  const { changeImgModal } = useModal()

  const onshow = (fileurl: string) => () => {
    changeImgModal(true, fileurl)
  }
  const [previewOpen, setPreviewOpen] = useState(false)
  const { value, onChange } = props
  const [imageUrl, setImageUrl] = useState<string>(() => {
    if (value) {
      return `${CONFIG.serverUrl}/image?file_path=${value}`
    }
    return ''
  })
  const [loading, setLoading] = useState(false)

  const beforeUpload = (file: any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片必须小于 2MB!')
    }
    return isJpgOrPng && isLt2M
  }
  const accessToken = sessionStorage.getItem(STORAGE_KEY)
  const UploadProps = {
    showUploadList: false,
    maxCount: 1,
    accept: 'image/*',
    name: 'image',
    action: `${CONFIG.serverUrl}/image`,
    withCredentials: false,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    onChange(info) {
      if (info.file.status === 'uploading') {
        setLoading(true)
        return
      }
      if (info.file.status === 'done') {
        getBase64(info.file.originFileObj, (url) => {
          setLoading(false)
          setImageUrl(url)
          console.log('info.file.response', info.file.response.data.filepath)
          // const imageUrl = info.file.response.data.filepath.split('/').pop()
          const imageUrl = info.file.response.data.filepath;
          onChange?.(imageUrl) // 通知 Form.Item 值已经改变
        })
      }
      if (info.file.status === 'error') {
        setLoading(false)
        message.error('上传失败')
        console.log(info.file)
      }
    },
  }
  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type='button'>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>点击上传</div>
    </button>
  )
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImageUrl('')
    onChange?.('')
  }
  const handleReupload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 手动触发上传组件的点击事件
    const upload = uploadRef?.querySelector('.ant-upload input[type="file"]');
    if (upload) {
      upload.click();
    }
  };
  return (
    <Upload
      listType='picture-card'
      beforeUpload={beforeUpload}
      style={{ marginBottom: 0 }}
      {...UploadProps}>
      {imageUrl ? (
        <div className={styles.uploadWrapper}>
        <div onClick={(e) => e.stopPropagation()}>  {/* 添加这个包装div来阻止冒泡 */}
          <AntImage
            src={imageUrl}
            alt='uploaded'
            width={98}
            height={98}
            style={{ objectFit: 'cover' }}
            preview={{
              visible: previewOpen,
              onVisibleChange: (visible) => {
                setPreviewOpen(visible)
              },
              mask: false // 移除预览遮罩，避免触发上传
            }}
          />
        </div>
          <div
            className={styles.actionsOverlay}
            onClick={(e) => e.stopPropagation()}>
            <div className={styles.actionsRow}>
              <Button
                type='text'
                size='small'
                icon={<EyeOutlined />}
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewOpen(true)
                }}
              />
              <Button
                type='text'
                size='small'
                icon={<DeleteOutlined />}
                className={styles.actionButton}
                onClick={handleDelete}
              />
            </div>
            {/* <Button
              type='text'
              size='small'
              icon={<UploadOutlined />}
              className={styles.actionButton}
              onClick={handleReupload}
              style={{ color: '#fff', width: '100%' }}
            >
              重新上传
            </Button> */}
          </div>
        </div>
      ) : (
        uploadButton
      )}
    </Upload>
  )
}
