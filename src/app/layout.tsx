import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '人生ときめき育成記',
  description: '仕事・恋愛結婚・推し活・お金。人生の4本柱を記録で育てるアプリ',
  openGraph: {
    title: '人生ときめき育成記',
    description: '仕事・恋愛結婚・推し活・お金。人生の4本柱を記録で育てるアプリ',
    siteName: '人生ときめき育成記',
    locale: 'ja_JP',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
