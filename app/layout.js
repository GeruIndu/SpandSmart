import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header.jsx";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "SpendSmart: One stop finance platform",
  description: "Intelligent Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          {/* header */}
          <Header />

          <main className="min-h-screen">
            {children}
          </main>
          {/* footer */}
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-00">
              <p>Made with ❤️ by Indrajit Mondal</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
