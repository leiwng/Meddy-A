export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-content">
        <div className="title">医小助</div>
        <div className="box">
          <div className="authform" >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}