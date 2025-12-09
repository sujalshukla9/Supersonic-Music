import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import Providers from "@/components/Providers";
import MobileNav from "@/components/MobileNav";
import TopBar from "@/components/TopBar";
import PlayerBar from "@/components/PlayerBar";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Supersonic Music",
    description: "Play Music at the Speed of Your Vibe",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#090910",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.variable} antialiased text-white bg-[#090910] selection:bg-[#8b5cf6] selection:text-white`}
            >
                <Providers>
                    <div className="flex h-screen w-full overflow-hidden">
                        {/* Sidebar - Hidden on mobile, shown on md+ */}
                        <Sidebar />

                        {/* Main Content Area with integrated RightPanel */}
                        <div className="flex-1 flex h-full overflow-hidden md:ml-14">
                            {/* Content Column Wrapper */}
                            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                                {/* TopBar - Visible on Tablet (md) and up, Hidden on Desktop (xl) */}
                                <div className="hidden md:block xl:hidden w-full z-30 shrink-0">
                                    <TopBar />
                                </div>

                                {/* Scrollable Content */}
                                <main className="flex-1 flex flex-col relative h-full overflow-y-auto no-scrollbar bg-[#0d0d15] px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8 pb-32 md:pb-28 xl:pb-8 pt-20 md:pt-4 xl:pt-8 text-white">
                                    <div className="animate-fade-in">
                                        {children}
                                    </div>
                                </main>
                            </div>

                            {/* Right Panel - Merged into main area, visible on xl+ */}
                            <RightPanel />
                        </div>
                    </div>

                    {/* Mobile Bottom Navigation - Only on mobile */}
                    <MobileNav />

                    {/* Player Bar - Responsive (Mobile Mini + Tablet Bar) */}
                    <PlayerBar />
                </Providers>
            </body>
        </html>
    );
}
