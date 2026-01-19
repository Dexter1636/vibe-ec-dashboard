import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '运营内容生成工具',
  description: '批量生成图文草稿，提升运营效率',
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
