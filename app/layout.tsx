import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={openSans.variable}>{children}</body>
        </html>
    );
}

