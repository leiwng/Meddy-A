// import Image from 'next/image';
import { useModal } from '@/contexts/ModalContext';
import { Image, Space } from 'antd';
import { LeftOutlined, RightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';

export default function ImgList({ imgList }) {
  const { changeImgModal } = useModal();

  const onshow = (fileurl: string) => () => {
    changeImgModal(true, fileurl);
  };
  return (    <div className="imglist">
      <Image.PreviewGroup
        preview={{
          toolbarRender: (_, { transform: { scale }, actions: { onActive, onZoomOut, onZoomIn } }) => (
            <Space size={18} className="toolbar">
              <LeftOutlined onClick={() => onActive?.(-1)} />
              <RightOutlined onClick={() => onActive?.(1)} />
              <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
              <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
            </Space>
          ),
          onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
        }}
      >
        {imgList.map((fileurl, index) => (
          <div className="imglist-img" key={fileurl+index}>    
            <Image 
              preview={{ mask: null }} 
              alt="img" 
              width={50} 
              height={50} 
              className="preimg" 
              src={fileurl} 
            />
          </div>
        ))}
      </Image.PreviewGroup>
    </div>)
}