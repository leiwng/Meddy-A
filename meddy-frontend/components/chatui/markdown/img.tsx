import { cn } from "@/utils/cn";
// import Image from "next/image"; 
import { CONFIG } from '@/config-global';
import { useModal } from '@/contexts/ModalContext';
import { Image } from 'antd';

export default function IMG({ node: _node, className, ...props }) {
  const { changeImgModal } = useModal();
  console.log('prop', props);
  const onshow = (fileurl: string) => () => {
    changeImgModal(true, fileurl);
  };
  if (!props.src) {
    return <span></span>
  }
  const fileurl = `${CONFIG.serverUrl}/image?file_path=${props.src}`
  return (
    <span className="imglist-img">
      <Image preview={{ mask: null }} width={50} height={50} alt={props.alt} className="preimg"  src={fileurl} />
    </span>
  )
}
