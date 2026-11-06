import type { Metadata } from "next";
// Fonts are served from this site, so visitors never connect to a font provider.
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/playfair-display/500.css";
import "@fontsource/playfair-display/600.css";
import "@fontsource/playfair-display/500-italic.css";
import "@fontsource/playfair-display/600-italic.css";
import "./globals.css";
export const metadata: Metadata = { title: "Lash by Doye | London, Ontario", description: "Thoughtfully tailored lash extensions in London, Ontario. Find your look, explore the service menu, and request an appointment with Lash by Doye." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
