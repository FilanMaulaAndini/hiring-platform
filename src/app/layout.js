import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "../context/ToastContext";
import Toast from "../hooks/toast/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Hiring Platform",
  description: "Join our team! Explore exciting career opportunities with us.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo-icon.svg" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ToastProvider>
          {children}
          <Toast />
        </ToastProvider>
      </body>
    </html>
  );
}
