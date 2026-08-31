import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NotificationWidget } from "@/components/shared/NotificationWidget";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SkillPath",
    description: "Platformă de evaluare și învățare pentru dezvoltatori",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="ro" className={`${inter.variable} h-full antialiased`}>
        <head>
            <link
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
                rel="stylesheet"
            />
        </head>
        <body className="min-h-full flex flex-col font-sans">
            {children}
            <NotificationWidget />
        </body>
        </html>
    );
}