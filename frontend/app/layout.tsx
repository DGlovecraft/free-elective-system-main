import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบเสนอและวิเคราะห์รายวิชาเสรี",
  description:
    "ระบบเสนอและวิเคราะห์ความต้องการรายวิชาเสรีของนักศึกษา",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={notoSansThai.variable}>
        {children}
      </body>
    </html>
  );
}