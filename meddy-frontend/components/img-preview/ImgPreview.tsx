'use client'
import Image from 'next/image'
import { useModal } from '@/contexts/ModalContext';

export default function ImgPreview() {
   const { imgModal, changeImgModal } = useModal();
  const handleClose = () => {
    changeImgModal(false, '');
  };
  if (!imgModal.visible) {
    return null
  }
  return (
    <div className="img-modal-overlay">
      <div className="img-modal">
        <div className="img-modal-header">
          <div className="img-modal-title">图片预览</div>
          <button className="img-modal-close" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="img-modal-content">
          <img src={imgModal.url} alt="Preview" />
        </div>
      </div>
    </div>
  );
}