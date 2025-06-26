

import "./globals.css";
import "@/sass/layout.scss";
import "@/sass/chat.scss";
import "@/sass/input.scss";
import "@/sass/editmodal.scss";
import "@/sass/auth.scss";
import "@/sass/setting.scss";
import '@ant-design/v5-patch-for-react-19';
import { AuthProvider } from '@/auth/context/jwt/index';
import { ThreadProvider } from '@/contexts/ThreadContext';
// import { ChatProvider } from '@/contexts/ChatContext';
import { ModalProvider} from '@/contexts/ModalContext';
import EditTitle from '@/components/edit-title/EditTitle';
import { AuthGuard } from '@/auth/guard';
import ImgPreview from '@/components/img-preview/ImgPreview';
import { SocketProvider } from '@/contexts/SocketContext';
import { StreamProvider } from '@/contexts/StreamContext';
import { SettingProvider } from '@/contexts/SettingContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>医小助</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta
          name="description"
          content="医小助"
        />
        <meta property="og:title" content="医小助" />
        <meta
          property="og:description"
          content="医小助"
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="医小助" />
        <meta
          name="twitter:description"
          content="医小助"
        />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body 
        // className={publicSans.className}
      >
            <SettingProvider>
        <AuthProvider>
          <ModalProvider>
            <ThreadProvider>
              <StreamProvider >
                {/* <ChatProvider> */}
                  <SocketProvider>
                    <AuthGuard>
                        <EditTitle />
                        <ImgPreview />
                        {children}
                    </AuthGuard>
                  </SocketProvider>
                {/* </ChatProvider> */}
                </StreamProvider>
              </ThreadProvider>
            </ModalProvider>
        </AuthProvider>
        </SettingProvider>
      </body>
    </html>
  );
}