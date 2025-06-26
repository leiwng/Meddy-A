'use client'
import React, { useEffect, useState } from 'react'
import { Input, message } from 'antd'
import { useModal } from '@/contexts/ModalContext'
import { cn } from '@/utils/cn'
import { useThread } from '@/contexts/ThreadContext'
import { Button, Modal } from 'antd'

const { TextArea } = Input

const EditTitle = () => {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const modaldata = useModal()
  const { patchThread } = useThread()
  const [messageApi, contextHolder] = message.useMessage()

  const handleOk = async () => {
    if (!title.trim()) {
      messageApi.error('标题不能为空')
      return
    }

    setLoading(true)
    try {
      await patchThread(modaldata.titleModal.content, { title })
      setLoading(false)
      modaldata.changeTitleModal(false, '', '')
    } catch (error) {
      messageApi.error('更新失败')
    }
  }
  const onChange = (e) => {
    setTitle(e.target.value)
  }
  const handleCancel = () => {
    setTitle('')
    modaldata.changeTitleModal(false, '', null)
  }
  useEffect(() => {
    setTitle(modaldata.titleModal.title)
  }, [modaldata.titleModal.title])
  return (
    <Modal
      title='编辑对话'
      open={modaldata.titleModal.visible}
      onOk={handleOk}
      onCancel={handleCancel}
      cancelText="取消"
      okText="确定"
    >
      <div className='edit-content'>
        <Input
          size='large'
          showCount
          maxLength={14}
          aria-label='TextArea'
          value={title}
          onChange={onChange}
        />
      </div>
    </Modal>
    // <div className={cn("edit-modal", modaldata.titleModal.visible ? 'show' : 'hidden')}>
    //   {contextHolder}
    //   <div className="edit-mask"></div>
    //   <div className="edit-wrap">
    //     <div className="wrap-center">
    //       <div className="edit-dialog">
    //         <div className='edit-header'>
    //           <div className='edit-title'>编辑对话</div>
    //           <div className="close" onClick={handleCancel}></div>
    //         </div>
    //         <div className="edit-content">
    //           <Input size="large" showCount maxLength={10} aria-label="TextArea" value={title} onChange={onChange} />
    //         </div>
    //         <div className='edit-footer'>
    //           <div className='edit-btn' onClick={handleCancel}>取消</div>
    //           <button onClick={handleOk} disabled={loading}>
    //             <span className='edit-btn'>
    //               保存
    //             </span>
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    // <Modal
    //   title="编辑对话标题"
    //   open={modaldata.titleModal.visible}
    //   onOk={handleOk}
    //   onCancel={handleCancel}
    //   confirmLoading={loading}
    //   okText="保存"
    //   cancelText="取消"

    // >
    //  <TextArea showCount maxLength={10}  aria-label="TextArea" value={title} onChange={onChange} onPressEnter={onPressEnter} />
    // </Modal>
  )
}

export default EditTitle
