import type { Metadata } from "next";import "./globals.css";
export const metadata:Metadata={title:"HomeFix Admin",description:"HomeFix operations and account management dashboard"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
