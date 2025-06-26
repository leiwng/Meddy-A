import ImgPreview from '@/components/img-preview/ImgPreview';
import { MarkdownText } from '../markdown/markdown-text';
import { getContent } from './format';
import ImgList from './img-list';
import { useMemo } from 'react';

export default function AssistantMessage({ message }) {
  // console.log('AssistantMessage', message);
  const { content, role, tool_calls, status, desc } = message;
  const { contentString, imgList } = useMemo(() => {
    return getContent(message.content);
  }, [message.content]);
  if (!content && tool_calls && tool_calls.length > 0) {
    return null;
  }
  return (
    <div className="chat-item" data-role={role}>
      <div className="iconbox">
        <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#E6F7FF" />
          <rect x="12" y="12" width="16" height="16" rx="2" fill="#1890FF" />
          <circle cx="16" cy="16" r="2" fill="white" />
          <circle cx="24" cy="16" r="2" fill="white" />
          <path d="M14 22H26V24H14V22Z" fill="white" />
        </svg>
      </div>
      <div>
          <div className="thinking" style={{ display: status && status !=='stop' ? 'inline flex' : 'none' }}>
            <svg viewBox="0 0 24 24" width="16" height="16">
              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="30 30">
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            {desc}
          </div>
        <div className="chat-msg-content" style={{ visibility: content ? 'visible' : 'hidden' }}>
          <MarkdownText>{contentString}</MarkdownText>
          {imgList.length > 0 && <ImgList imgList={imgList} />}
        </div>
      </div>
    </div>
  );
}