import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "온결 | 나만의 결을 발견하는 사주",
  description: "만세력을 기반으로 내 사주팔자와 오늘의 운세를 살펴보는 감성 사주 서비스.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
