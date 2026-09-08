import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Dilla & Bobby — 4 Oktober 2026",description:"Dengan penuh syukur, kami mengundang Anda merayakan pernikahan Dilla dan Bobby. Minggu, 4 Oktober 2026, Gedung AURI Edi Harjoko.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="id"><body>{children}</body></html>}
