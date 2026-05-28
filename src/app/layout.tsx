import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '哄哄模拟器 | 练习更好的沟通方式',
    template: '%s | 哄哄模拟器',
  },
  description:
    '在虚拟吵架场景中练习更合适的沟通方式，学会真正哄好一个人。',
  keywords: [
    '哄哄模拟器',
    '恋爱沟通',
    '沟通练习',
    'AI 对话',
    '情绪沟通',
    '互动游戏',
  ],
  authors: [{ name: 'Dragon Peter' }],
  generator: 'Next.js',
  openGraph: {
    title: '哄哄模拟器 | 练习更好的沟通方式',
    description: '在虚拟冲突场景中练习更合适的沟通方式，学会真正接住情绪。',
    siteName: '哄哄模拟器',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
