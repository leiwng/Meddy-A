'use client'
// import Image from 'next/image';
import { MarkdownText } from './markdown/markdown-text'
import { useModal } from '@/contexts/ModalContext';
import { CONFIG } from '@/config-global';
import { Image } from 'antd';

export default function ContentMsg({ content }) {
  const { changeImgModal } = useModal();

  const onshow = (fileurl: string) => () => {
    changeImgModal(true, fileurl);
  };
  if (Array.isArray(content)) {
    return (<div className="imglist">{content.map((item, index) => {
      if (item.type === 'text') {
        return <div key={index} className="imglist-text">{item.text}</div>;
      }
      if (item.type === 'image_url') {
        // const filename = item.image_url.split('/').pop()
        const filename = item.image_url;
        const fileurl = `${CONFIG.serverUrl}/image?file_path=${filename}`
        return (<div className="imglist-img" key={filename}>
          <Image preview={{ mask: null }} alt={filename} width={50} height={50} className="preimg" src={fileurl} />
        </div>);
      }
      return null;
    })}</div>);
  }
  return <MarkdownText>{content}</MarkdownText>;
}