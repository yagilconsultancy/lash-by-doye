import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Lash by Doye | London, Ontario", description: "Thoughtfully tailored lash extensions in London, Ontario. Find your look, explore the service menu, and request an appointment with Lash by Doye." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
