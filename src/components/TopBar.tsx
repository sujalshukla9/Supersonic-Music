"use client";
import { Icon } from './Icon';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function TopBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <header className="flex items-center justify-between px-8 py-5 sticky top-0 z-30 bg-gradient-to-b from-[#050511] to-transparent pointer-events-none">
            {/* Search Bar - pointer-events-auto to re-enable interaction */}
            <div className="flex-1 max-w-xl relative group pointer-events-auto">
                <form onSubmit={handleSearch} className="relative w-full">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Icon name="search" className="text-gray-500 group-focus-within:text-[#00f0ff] transition-colors duration-300" size={18} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search tracks, artists, albums..."
                        className="w-full bg-[#1e1e2f]/40 border border-white/5 rounded-full py-3 pl-12 pr-6 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/50 focus:bg-[#1e1e2f]/80 transition-all backdrop-blur-md shadow-lg"
                    />
                </form>
            </div>

            {/* User Profile */}
            <div className="ml-6 flex items-center space-x-4 pointer-events-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] p-[2px] cursor-pointer hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(157,0,255,0.3)]">
                    <div className="w-full h-full rounded-full bg-[#050511] flex items-center justify-center overflow-hidden">
                        {/* Using a colorful gradient placeholder instead of external image to avoid broken links */}
                        <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                    </div>
                </div>
            </div>
        </header>
    );
}
