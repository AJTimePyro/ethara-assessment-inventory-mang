import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Providers } from "./providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Inventory Management | Ethara",
  description:
    "Inventory Management built by AJTimePyro aka Abhijeet Gupta for Ethara",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-background">
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              {/* Top bar */}
              <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur-sm px-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
                <div className="h-5 w-px bg-border" />
                <span className="text-sm font-medium text-muted-foreground">
                  Ethara Inventory
                </span>
              </header>
              {/* Page content */}
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
