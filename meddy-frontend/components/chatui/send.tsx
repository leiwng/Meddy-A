import { useRef, useState } from 'react'
import { Upload } from 'antd'
import { Input, message, Popconfirm, Tooltip } from 'antd'
import Image from 'next/image'
import type { UploadProps } from 'antd'
import { useThread } from '@/contexts/ThreadContext'
import { useAuthContext } from '@/auth/hooks'
import { STORAGE_KEY } from '@/auth/context/jwt/constant'
import { CONFIG } from '@/config-global'
import ToolContact from './tool-contact'
import { useAction } from '@/contexts/StreamContext'
import { Select } from '@/components/ui/select/select'
import ToolBook from './tool-book'
import { Image as AntImage } from 'antd';
import { useSettings } from '@/contexts/SettingContext'
import { cn } from '@/utils/cn';

// import { useStream } from '@/hooks/useStream';
const { TextArea } = Input

export default function Send({ autoScrollEnabled }) {
  const [connected, setConnected] = useState(false)
  const [input, setInput] = useState('')
  const [fileList, setFileList] = useState([]);
  const [book, setBook] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen2.5:32b')
  const [messageApi, contextHolder] = message.useMessage()
  const textAreaRef = useRef(null)
  // console.log('headers')
  const streamAction = useAction()
  const { isMobile, collapsed, toggleCollapsed } = useSettings()
  const { user } = useAuthContext()
  const {
    selectList,
    setSelectList,
    createThread,
    threadId,
    stopThread,
    patchThread,
    selected,
  } = useThread()

  const onSuccess = (filepath: string) => {
    // const fileurl = filepath.split('/').pop()
    const fileurl = filepath;
    console.log('fileurl', fileurl)
    setFileList((prevFileList) => {
      return [
        ...prevFileList,
        { type: 'img', fileurl: fileurl, image_url: filepath },
      ]
    })
  }
  const accessToken = sessionStorage.getItem(STORAGE_KEY)
  const props: UploadProps = {
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
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        onSuccess(info.file.response.data.filepath)
      } else if (info.file.status === 'error') {
        console.log(info.file)
      }
    },
  }

  const onDelete = (uid) => () => {
    setFileList((prevFileList) => {
      return prevFileList.filter((v) => v.image_url !== uid)
    })
  }
  const onConnect = () => {
    setConnected(!connected)
  }
  const onChange = (e) => {
    // console.log(e.target.value)
    const value = e.target.value
    // 过滤掉只有空格的情况
    if (value.trim() || value.length === 0) {
      setInput(value)
    }
  }
  const onPressEnter = (e) => {
    if (e.nativeEvent.isComposing) {
      return
    }
    if (!e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }
  // const streamvalue = useStream({
  //   assistantId: 'agent',
  // });
  // console.log('streamvalue', streamvalue)
  const onSend = async () => {
    if (!input) {
      return
    }
    if (streamAction.isRuning) {
      return
    }
    let content = input
    if (fileList.length) {
      const sendfile = fileList.map((value) => ({
        type: 'image_url',
        image_url: value.image_url,
      }))
      content = [{ type: 'text', text: input }, ...sendfile]
    }
    const inputTitle = input.length > 14 ? input.slice(0, 14) : input
    setInput('')
    setFileList([])

    const mutil_expert = selectList.reduce((a, b) => ({ ...a, [b]: b }), {})

    const expert_chat_mode = selectList.length > 0 ? true : false;
    autoScrollEnabled.current = true;
    streamAction.submit({
      user,
      inputTitle,
      mutil_expert,
      selectedModel,
      content: content,
      expert_chat_mode,
      userId: user?.userId,
      rag_chat_mode: book ? true : false,
      rag_expert_name: book,
      messages: [
        {
          role: 'human',
          content: content,
          additional_kwargs: {
            uid: user.userId,
            role: user.role,
          },
        },
      ],
    })
  }

  const onStop = async () => {
    streamAction.stop()
  }
  const onConfirm = (eid) => () => {
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

  return (
    <div className='input-content'>
      {contextHolder}
      <div className='input-file'>
        {fileList.map((value) => {
          if (value.type === 'file') {
            return (
              <div className='file-card' key={value.fileurl}>
                <div
                  className='close-icon'
                  onClick={onDelete(value.image_url)}
                />
                <div className='file-name'>
                  哥哥热好热好热微风微风我为丰富微风微风微风我
                </div>
                <div className='file-size'>23M</div>
              </div>
            )
          }
          if (value.type === 'img') {
            return (
              <div className='img-card' key={value.fileurl}>
                <div
                  className={cn('close-icon', { phoneclose: isMobile })}
                  onClick={onDelete(value.image_url)}
                />
                <AntImage preview={{ mask: null }} width={64} height={64} src={`${CONFIG.serverUrl}/image?file_path=${value.fileurl}`} />
                {/* <img
                  src={`${CONFIG.serverUrl}/image?file_path=${value.fileurl}`}
                /> */}
              </div>
            )
          }
          return null
        })}
      </div>
      <div className='input-box'>
        {
          user?.role === 'user' && <div className='select-list'>
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
        </div>
        }

        <TextArea
          ref={textAreaRef}
          autoSize={{ minRows: 1, maxRows: 5 }}
          placeholder='输入你的问题，帮你解答'
          aria-label='TextArea'
          value={input}
          onChange={onChange}
          onPressEnter={onPressEnter}
        />
      </div>
      <div className='tool-box'>
        <div className='wrapleft'>
        <div className='tool-model'>
          <Select
            options={[
              { value: 'deepseek-r1:32b', label: 'deepseek' },
              { value: 'qwen2.5:32b', label: 'qwen_llm' },
              { value: 'qwen-plus', label: 'qwen-plus' },
            ]}
            value={selectedModel}
            onChange={(value) => {
              setSelectedModel(value)
              console.log('selectedModel', value)
            }}
            placeholder='选择模型'
            className='select-model'
          />
          {/* <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}>
            <option value='deepseek-r1:32b'>deepseek-r1</option>
            <option value='qwen2.5:32b'>qwen_llm</option>
            <option value='qwen-plus'>qwen-plus</option>
          </select> */}
        </div>
        {/* <div className='tool-internet'>
          <div
            className={`internet ${connected ? 'connected' : ''}`}
            onClick={onConnect}>
              <div>
              <GlobalOutlined style={{ marginRight: '8px' }}/>
              </div>
              <div>联网思考</div>
            
          </div>
        </div> */}
        <ToolBook selectList={selectList} setBook={setBook} book={book} />
        </div>
        <div className="wrapright">
        {user?.role === 'user' && (
          <ToolContact
            selectList={selectList}
            setSelectList={setSelectList}
            threadId={threadId}
            patchThread={patchThread}
          />
        )}
        <div
          className='tool-upload'
          >
          <Upload {...props}>
            <button className='tooltip-container'>
              <Image src='/upload.svg' width={24} height={24} alt='上传图片' />
              <span className='tooltip'>上传图片</span>
            </button>
          </Upload>
        </div>
        <div className='tool-send'>
          {streamAction.isRuning ? (
            <Tooltip title="停止回答">
              <button className='stop' onClick={onStop}>
                <Image src='/stop.svg' width={24} height={24} alt='停止' />
              </button>
            </Tooltip>
          ) : (
            // <Tooltip title="停止">
            //   <button className='stop' onClick={onStop}>
            //     <Image src='/stop.svg' width={24} height={24} alt='停止' />
            //   </button>
            // </Tooltip>
            <button
              onClick={onSend}
              className={`send ${input ? 'active' : ''}`}
              disabled={!input}>
              <Image src='/send.svg' width={24} height={24} alt='发送' />
            </button>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
