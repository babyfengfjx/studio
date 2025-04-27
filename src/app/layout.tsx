import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean sans-serif font
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' }); // Define variable for Tailwind

export const metadata: Metadata = {
  title: '时光流 - 您的个人时间轴', // Updated title in Chinese
  description: '使用时光流按时间顺序整理您的事件。', // Updated description in Chinese
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set language to Chinese
    <html lang="zh-CN">
      {/* Apply the font variable to the body */}
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster /> {/* Add Toaster here */}
      </body>
    </html>
  );
}
