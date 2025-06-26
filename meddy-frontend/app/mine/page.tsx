'use client'
import { useRef, useEffect, useMemo, useState } from 'react'
import './page.scss'
import { Button, Upload, Modal, Form, Input } from 'antd'
import { DeleteOutlined, CloudUploadOutlined, EditOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { CONFIG } from '@/config-global'
import { STORAGE_KEY } from '@/auth/context/jwt/constant'
import { message, Popconfirm } from 'antd'
import axios, { endpoints } from '@/utils/axios'
import { generateRandomId } from '@/utils/util'
import { Tooltip } from 'antd';
import { WebSocketClient } from '@/contexts/socket-client'
import moment from 'moment'

interface ProgressData {
  progress_value: number;
  progress_name: string;
  status: 'processing' | 'done' | 'error';
}

interface Observer {
  socket: WebSocketClient | null;
}

class UploadStatusManager {
  private observers: Map<string, Observer>;

  constructor() {
    this.observers = new Map();
  }

  createObserver(task_id: string) {
    const socket = this.initSocket(task_id);
    this.observers.set(task_id, {
      socket,
    });
  }

  private initSocket(task_id: string) {
    const socket = new WebSocketClient(`${CONFIG.socketUrl}/rag_progress/${task_id}`, {
      maxRetries: 5,
      retryDelay: 3000,
      debug: true,
    });

    socket.on('open', () => {
      console.log(`WebSocket connected for task: ${task_id}`);
    });

    socket.on('close', () => {
      this.removeObserver(task_id);
    });

    socket.on('message', (data: ProgressData) => {
      this.updateProgress(task_id, data);
    });

    socket.connect();
    return socket;
  }

  private updateProgress(task_id: string, data: ProgressData) {
    const elements = {
      progress: document.getElementById(`status${task_id}`),
      name: document.getElementById(`statusname${task_id}`),
      statusbar: document.getElementById(`statusbar${task_id}`),
    };

    if (!elements.progress || !elements.name) {
      console.warn('Progress elements not found for task:', task_id);
      return;
    }
    console.log('Progress data received:', data);
    elements.progress.innerText = `${data.progress_value}%`;
    elements.name.innerText = data.progress_name;

    if (data.status === 'done' && elements.statusbar) {
      requestAnimationFrame(() => {
        elements.statusbar.classList.add('fade-out');
        elements.statusbar.addEventListener('transitionend', () => {
          elements.statusbar.style.display = 'none';
          this.removeObserver(task_id);
        }, { once: true });
      });
    }
  }

  removeObserver(task_id: string) {
    const observer = this.observers.get(task_id);
    if (observer) {
      if (observer.socket) {
        observer.socket.disconnect();
      }
      this.observers.delete(task_id);
    }
  }
}
const statusManager = new UploadStatusManager();

export default function Mine() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [assitantList, setAssitantList] = useState([])
  const [activeAssitant, setActiveAssitant] = useState({})
  const [fileList, setFileList] = useState([])
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const editCacheName = useRef(null);

  const onedit = () => {
    if (!activeAssitant.name) {
      message.error('请先选择一个助手！');
      return;
    }
    editCacheName.current = activeAssitant.name;
    form.setFieldsValue({
      assistantName: activeAssitant.name,
      assistantDescription: activeAssitant.description,
    });
    setIsModalOpen(true);

  }
  const onshow = () => {
    editCacheName.current = null;
    form.resetFields();
    setIsModalOpen(true)
  }
  const handleCancel = () => {
    editCacheName.current = null;
    form.resetFields();
    setIsModalOpen(false)
  }
  const onFinish = async (data: any) => {
    console.log('Success:', data)
      // 去除首尾空格
    const noblankname = data.assistantName.trim();
    if (!noblankname) {
      message.error('助手名称不能为空！');
      return;
    }
    try {
      const nameExists = assitantList.some(
        (assistant) => assistant.name === noblankname
      );

      if (nameExists) {
        message.error('助手名称已存在，请使用其他名称！');
        return;
      }
      setIsModalOpen(false);
      
      if (editCacheName.current) {
        const params = {
          name: noblankname,
          description: data.assistantDescription,
        }
        await axios.patch(`${endpoints.expert.edit}/${editCacheName.current}`, params);
        setAssitantList((prev) => {
          return prev.map((v) => {
            if (v.name === editCacheName.current) {
              return {
                ...v,
                name: noblankname,
                description: data.assistantDescription,
              };
            }
            return v;
          });
        });
        setActiveAssitant((prev) => {
          return {
            ...prev,
            name: noblankname,
            description: data.assistantDescription,
          };
        });
        message.success('修改成功');
        editCacheName.current = null;
        return;
      }

      const params = {
        expert_name: noblankname,
        expert_description: data.assistantDescription,
      }
      await axios.post(endpoints.expert.add, params);

      setAssitantList([...assitantList, {
        name: noblankname,
        description: data.assistantDescription,
        uuid: generateRandomId(),
        rag_data: [],
      }]);
      message.success('添加成功')
    } catch (error) {
      console.error('Error during sign up:', error)
      throw error
    }
  }
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }
  const accessToken = sessionStorage.getItem(STORAGE_KEY)
  const props: UploadProps = {
    showUploadList: false,
    maxCount: 1,
    accept: '.pdf',
    name: 'file',
    action: `${CONFIG.serverUrl}/rag_data`,
    withCredentials: false,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    data: {
      expert_name: activeAssitant.name, // Add the expert_name parameter
    },
    onChange(info) {
      if (info.file.status === 'uploading') {
        setUploading(true);
      }
      if (info.file.status === 'done') {
        setUploading(false);
        setFileList((prev) => {
          return [
            ...prev,
            { 
              name: info.file.response.data.filepath.split('/').pop(),
              time: moment(Date.now()).format('YYYY/MM/DD'),
              task_id: info.file.response.data.task_id,
              file_id: info.file.response.data.file_id,
              filepath: info.file.response.data.filepath,
            },
          ]
        });
        statusManager.createObserver(info.file.response.data.task_id);
        // message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        setUploading(false);
        message.error(`${info.file.name} 上传失败`);
      }
    },
    beforeUpload: (file) => {
      const isLt50M = file.size / 1024 / 1024 < 300;
      if (!isLt50M) {
        message.error('文件大小不能超过 300MB!');
        return false;
      }
      const fileName = file.name;
      const fileExists = fileList.some((existingFile) => 
        existingFile.name.toLowerCase() === fileName.toLowerCase()
      );

      if (fileExists) {
        message.error('文件已存在,请勿重复上传！');
        return false;
      }
      return true;
    }
  }
  const confirm = (name: string) => () => {
    axios
      .delete(`${endpoints.expert.delete}/${name}`)
      .then(() => {
        setAssitantList((prev) => {
          return prev.filter((v) => v.name !== name)
        })
        setActiveAssitant({});
        message.success('删除成功')
      })
      .catch((error) => {
        console.error('Error deleting file:', error)
        message.error('删除失败')
      })
  }
  const confirmfileid = (file_id: string) => () => {
    axios
      .delete(`${endpoints.expert.rag_data}/${file_id}`, { data: { expert_name: activeAssitant.name }})
      .then(() => {
        setFileList((prev) => {
          return prev.filter((v) => v.file_id !== file_id)
        });
        message.success('删除成功')
      })
      .catch((error) => {
        console.error('Error deleting file:', error)
        message.error('删除失败')
      })
  }
  const onchangeAssit = (name) => () => {
    const assit = assitantList.find((v) => v.name === name)
    setActiveAssitant(assit)
  }
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(endpoints.expert.list)
        // console.log('res', res)
        if (res.data && res.data.data.length > 0) {
          setAssitantList(res.data.data);
          setActiveAssitant(res.data.data[0]);
        }else{
          setAssitantList([]);
          setActiveAssitant({});
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])
  useEffect(() => {
    if (activeAssitant.rag_data) {
      const formatFile = activeAssitant.rag_data.map((v) => {
        return {
          file_id: v.file_id,
          time: moment(v.create_time).format('YYYY/MM/DD'),
          name: v.file_path.split('/').pop(),
        }
      })
      // TODO:添加socket监听，更新文件处理状态，但是后端没有一个初始状态，所以只能在收到socket消息后设置状态
      setFileList(formatFile)
    } else {
      setFileList([])
    }
  }, [activeAssitant])

  const disabled = useMemo(() => {
    return !activeAssitant.name || uploading
  }, [activeAssitant.name, uploading]);
  return (
    <div className='mine-container'>
      <div className='header'>
        <div className='title'>
          <Button onClick={onshow}>添加助手</Button>
        </div>
        <div className='action'>
          <Modal
            title='添加助手'
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={isModalOpen}
            onCancel={handleCancel}
            footer={null}
            width={700}>
            <Form
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete='off'
              style={{ width: 500, margin: '0 auto' }}
              form={form}
              preserve={false}
              layout='vertical'>
              <Form.Item
                label='助手名称'
                name='assistantName'
                rules={[
                  {
                    required: true,
                    message: '请输入助手名称!',
                  },
                ]}>
                <Input />
              </Form.Item>

              <Form.Item
                label='助手介绍'
                name='assistantDescription'
                rules={[
                  {
                    required: true,
                    message: '请输入助手介绍!',
                  },
                ]}>
                <Input.TextArea rows={2} maxLength={30} showCount />
              </Form.Item>

              <Form.Item label={null}>
                <Button type='primary' htmlType='submit'>
                  提交
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </div>
      <div className='content'>
        <div className='assitant-list'>
          {assitantList.map((item) => (
            <div
              key={item.name}
              className={`assitant-item ${activeAssitant.name === item.name ? 'active' : ''}`}
              onClick={onchangeAssit(item.name)}>
              {item.name}
              <Popconfirm
                title='确认删除助手'
                description='助手删除后不可恢复，是否确认删除？'
                onConfirm={confirm(item.name)}
                okText='确定'
                cancelText='取消'>
                <DeleteOutlined style={{ fontSize: '14px', float: 'right' }} />
              </Popconfirm>
            </div>
          ))}
        </div>
        <div className='assitant-content'>
          <div className='role-info'>
            <div className='edit-role'>
              助手信息
             <EditOutlined onClick={onedit} className='edit-assistant' />
            </div>
            <div className='edit-role-content'>
              <span className='edit-label'>介绍</span>{activeAssitant.description}
            </div>
          </div>
          <div className='file-info'>
            <div className='edit-file'>
              知识库
              <Upload {...props}>
                <Button 
                icon={<CloudUploadOutlined />}      
                    loading={uploading}
          disabled={disabled}>     {uploading ? '上传中...' : '上传文件'}</Button>
              </Upload>
            </div>
            <div className='edit-file-content'>
              {fileList.map((v, index) => (
                <div className='file-card' key={`${v.name}${index}`}>
                  <div className='file-icon'>
                    <svg
                      viewBox='0 0 1024 1024'
                      version='1.1'
                      xmlns='http://www.w3.org/2000/svg'
                      p-id='5571'
                      width='24'
                      height='24'>
                      <path
                        d='M875.008 985.984H148.992A84.992 84.992 0 0 1 64 900.992V123.008C64 76.032 102.08 38.016 148.992 38.016h560.832c21.952 0 43.008 8.448 58.88 23.68l165.12 158.592c16.768 16 26.176 38.144 26.176 61.312v619.392c0 46.976-38.08 84.992-84.992 84.992z'
                        fill='#8A5DE2'
                        p-id='5572'></path>
                      <path
                        d='M755.456 572.16l-94.144-94.08c-55.232-55.232-151.488-55.232-206.592 0-12.608 12.544-17.792 18.624-24.768 33.92 13.76 11.968 56.128 26.368 73.088 10.688 13.44-13.568 34.24-17.472 53.376-17.472s38.72 11.968 52.224 25.536l94.144 94.08c13.568 13.568 20.992 31.552 20.992 50.688s-7.424 37.12-20.992 50.624a71.68 71.68 0 0 1-101.248 0L530.048 654.72c-15.68 11.328-49.536 20.48-87.104 14.08 5.248 7.936 11.328 15.488 18.368 22.528l87.552 87.552c28.48 28.544 65.92 42.752 103.296 42.752 37.376 0 74.88-14.208 103.296-42.688 27.584-27.648 42.816-64.32 42.816-103.36s-15.232-75.712-42.816-103.296z'
                        fill='#FFFFFF'
                        p-id='5573'></path>
                      <path
                        d='M569.216 592.64a145.92 145.92 0 0 0 24.32-33.472c-12.16-26.88-59.84-21.504-74.368-9.152-28.096 26.24-76.544 17.28-103.872-10.048L321.152 445.824A71.68 71.68 0 0 1 422.4 344.512L488.96 410.88c20.288-9.088 50.496-16.512 90.496-10.88a146.816 146.816 0 0 0-18.112-22.016L475.072 291.84c-55.168-55.232-151.424-55.168-206.592 0-56.96 56.96-56.96 149.632 0 206.656l94.144 94.08c28.48 28.544 65.92 42.752 103.296 42.752 37.44 0 74.88-14.208 103.296-42.688z'
                        fill='#FFFFFF'
                        p-id='5574'></path>
                    </svg>
                  </div>
                  <div className='file-detail'>
                     <Tooltip title={v.name}>
                       <div className='file-name'>{v.name}</div>
                     </Tooltip>
                    <div className='time'>
                      {v.time}
                      {
                        v.file_id && (
                      <div className='hover-show'>
                        <Popconfirm
                          title='确认删除文件'
                          description='文件删除后不可恢复，是否确认删除？'
                          onConfirm={confirmfileid(v.file_id)}
                          okText='确定'
                          cancelText='取消'>
                          <DeleteOutlined style={{ fontSize: '14px' }} />
                        </Popconfirm>
                      </div>
                        )
                      }
                    </div>
                  </div>
                  {
                    v.task_id && <div id={`statusbar${v.task_id}`} className="status"><span id={`statusname${v.task_id}`}>处理中</span><span id={`status${v.task_id}`}>0%</span></div>
                  }
                  
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}