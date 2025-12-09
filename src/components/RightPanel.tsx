"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { usePlayer } from "@/context/PlayerContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AudioPlayer from "./AudioPlayer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, ChevronDown } from "lucide-react";

export default function RightPanel() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const { currentTrack } = usePlayer();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <aside className="
            w-[280px] md:w-[300px] lg:w-[320px] xl:w-[340px] 2xl:w-[360px]
            h-full hidden xl:flex flex-col 
            py-4 md:py-5 lg:py-6 
            px-3 md:px-4 lg:px-5 xl:px-6 
            bg-transparent border-l border-white/5 z-20 overflow-hidden 
            animate-fade-in-right
        ">

            {/* Header Section */}
            <div className="flex-shrink-0 space-y-4 lg:space-y-5 mb-4 lg:mb-6 animate-fade-in stagger-1">
                {/* Search/Bell/Profile Row */}
                <div className="flex items-center justify-between gap-3 lg:gap-4">
                    <button className="relative group hover:scale-110 transition-transform active:scale-95">
                        <Icon name="bell" size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[#090910] animate-pulse"></span>
                    </button>
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative group">
                            <Icon name="search" size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type here to search"
                                className="w-full bg-transparent border-none text-xs lg:text-sm text-white placeholder-gray-600 focus:outline-none pl-6 lg:pl-8 transition-all"
                            />
                        </div>
                    </form>

                    {/* Profile Dropdown */}
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 px-2 py-1 h-auto hover:bg-white/5 rounded-full transition-all group"
                            >
                                <Avatar className="rounded-full size-8 bg-gradient-to-br from-purple-500 to-purple-900 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all">
                                    <AvatarFallback className="bg-transparent text-white text-xs font-semibold">S</AvatarFallback>
                                </Avatar>
                                <ChevronDown className="h-3 w-3 text-gray-500 group-hover:text-white transition-colors" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10 min-w-[200px]">
                            <div className="flex flex-row items-center gap-3 p-3">
                                <Avatar className="size-10 bg-gradient-to-br from-purple-500 to-purple-900">
                                    <AvatarFallback className="bg-transparent text-white text-sm font-semibold">S</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-left">
                                    <span className="text-sm font-medium text-white">Supersonic</span>
                                    <span className="text-xs text-purple-400">Premium User</span>
                                </div>
                            </div>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem asChild className="flex items-center gap-2 text-gray-300 hover:text-white focus:bg-white/5 focus:text-white cursor-pointer py-2">
                                <Link href="/settings">
                                    <User className="h-4 w-4" /> Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="flex items-center gap-2 text-gray-300 hover:text-white focus:bg-white/5 focus:text-white cursor-pointer py-2">
                                <Link href="/settings">
                                    <Settings className="h-4 w-4" /> Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="flex items-center gap-2 text-red-400 hover:text-red-300 focus:bg-white/5 focus:text-red-300 cursor-pointer py-2">
                                <LogOut className="h-4 w-4" /> Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Music Player Card (Pinned Bottom) */}
            <div className="flex-shrink-0 mt-2 animate-fade-in stagger-2">
                {currentTrack ? (
                    <div className="w-full animate-scale-in">
                        <AudioPlayer
                            cover={currentTrack.thumbnail}
                            title={currentTrack.title}
                            artist={currentTrack.artist}
                        />
                    </div>
                ) : (
                    <div className="w-full aspect-[4/5] rounded-[20px] lg:rounded-[24px] xl:rounded-[30px] bg-gradient-to-br from-purple-900/10 to-transparent border border-white/5 flex items-center justify-center text-white/20 hover-glow transition-all">
                        <div className="text-center px-4">
                            <Icon name="music" size={32} className="mx-auto mb-2 opacity-50 animate-float" />
                            <p className="text-xs lg:text-sm font-medium">No track playing</p>
                            <p className="text-[10px] lg:text-xs text-gray-600 mt-1">Select a song to start</p>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}

