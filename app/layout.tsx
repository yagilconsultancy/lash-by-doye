import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Lash by Doye | London, Ontario", description: "Beautiful lashes, thoughtfully tailored. Explore lash extensions and request your appointment in London, Ontario." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
