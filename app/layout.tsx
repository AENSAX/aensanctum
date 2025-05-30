// 导入 Next.js 的 Metadata 类型
import type { Metadata } from 'next';
// 导入 Geist 和 Geist_Mono 字体
import { Geist, Geist_Mono } from 'next/font/google';
import React from 'react';
// 导入全局样式文件
import './globals.css';
// 导入主题提供者组件
import ThemeRegistry from './ThemeRegistry';

// 配置 Geist Sans 字体
const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

// 配置 Geist Mono 字体
const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

// 导出网站元数据配置
export const metadata: Metadata = {
    title: 'AenSanctum',
    description: '圣地',
};

// 根布局组件,接收子组件作为参数
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // HTML 根元素,设置语言为英文
        <html lang="en">
            {/* body 元素,应用字体变量和抗锯齿效果 */}
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {/* 主题提供者 */}
                <ThemeRegistry>
                    {/* 渲染子组件 */}
                    {children}
                </ThemeRegistry>
            </body>
        </html>
    );
}
