import ContentMsg from './content-msg';

export default function ChatMessage({ content, role, setImgurl }) {
  return (<div className="chat-item" data-role={role}>
    <div className="iconbox">
      {
        role == 'human' && (
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#E6E6E6" />
            <circle cx="20" cy="16" r="6" fill="#999999" />
            <path d="M8 36C8 29.3726 13.3726 24 20 24C26.6274 24 32 29.3726 32 36" fill="#999999" />
          </svg>
        )
      }

      {role === 'ai' && (
        <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#E6F7FF" />
          <rect x="12" y="12" width="16" height="16" rx="2" fill="#1890FF" />
          <circle cx="16" cy="16" r="2" fill="white" />
          <circle cx="24" cy="16" r="2" fill="white" />
          <path d="M14 22H26V24H14V22Z" fill="white" />
        </svg>
      )}
      {role === 'doctor' && (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#F6FFED" />
          <path d="M18 12H22V28H18V12Z" fill="#52C41A" />
          <path d="M12 18H28V22H12V18Z" fill="#52C41A" />
        </svg>
      )}


    </div>
    <div>
      {role === 'ai' && !content && (
        <div className="thinking">
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
          思考中
        </div>
      )}
      <div className="chat-msg-content" style={{ visibility: content ? 'visible' : 'hidden' }}>
        <ContentMsg content={content} setImgurl={setImgurl} />
      </div>
    </div>
  </div>);
}