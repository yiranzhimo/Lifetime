import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '人生追踪器 - Life Tracker',
  description: '人生倒计时、愿望清单、结绳记事',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

