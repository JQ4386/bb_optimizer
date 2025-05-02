// Remove 'use client' - this is now a Server Component
import type { Metadata } from "next";
// import { GeistSans, GeistMono } from "geist/font"; // Reverted Geist font
// import { Inter } from 'next/font/google'; // Use default Inter font
// import { Lato } from 'next/font/google'; // Use Lato font
import { Quicksand } from 'next/font/google'; // Use Quicksand font
import "./globals.css";
// Remove MUI imports that are now handled by ThemeRegistry
// import { ThemeProvider } from '@mui/material/styles';
// import CssBaseline from '@mui/material/CssBaseline';
// import theme from '../theme'; // Import the theme we created
import ThemeRegistry from './ThemeRegistry'; // Import the new client component

// Instantiate Quicksand
const quicksand = Quicksand({ 
  weight: ['300', '400', '500', '600', '700'], 
  subsets: ['latin'],
  display: 'swap',
  // Removed variable definition as className is used directly
});

// Font setup - assuming Geist is correctly installed or replace if needed
// const geistSans = GeistSans({ subsets: ["latin"], variable: "--font-geist-sans"});
// const geistMono = GeistMono({ subsets: ["latin"], variable: "--font-geist-mono" });

// You can keep or modify the metadata as needed
export const metadata: Metadata = {
  title: "AFK Bounty Optimizer", // Updated title
  description: "Optimize your AFK Arena bounty board refreshes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the Quicksand font className to the body */}
      <body className={quicksand.className}>
        {/* Use ThemeRegistry to provide the theme */}
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
