import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "爆款雷达 | 低粉高赞选题库",
  description: "搜索低粉爆款，拆解内容结构，生成可拍的二创脚本。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
