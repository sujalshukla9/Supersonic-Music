"use client";

import { Icon, IconName } from "./Icon";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, Search, User, Settings, LogOut, ChevronDown, Plus } from "lucide-react";
import { usePlaylist } from "@/context/PlaylistContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MobileNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { playlists, createPlaylist } = usePlaylist();
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    const NavItems: { name: string; icon: IconName; href: string }[] = [
        { name: "Explore", icon: "home", href: "/" },
        { name: "Genres", icon: "genres", href: "/genres" },
        { name: "Albums", icon: "albums", href: "/albums" },
        { name: "Artist", icon: "artists", href: "/artists" },
    ];

    const LibraryItems: { name: string; icon: IconName; href: string }[] = [
        { name: "Favourites", icon: "heart", href: "/favorites" },
        { name: "History", icon: "history", href: "/history" },
        { name: "Popular", icon: "trending", href: "/popular" },
        { name: "My Music", icon: "folder", href: "/my-music" },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            // Optional: Close menu if open, though search is in navbar
        }
    };

    const handleCreatePlaylist = () => {
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName);
            setNewPlaylistName('');
            setIsCreating(false);
        }
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 md:hidden h-16 bg-[#0a0a12]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-3 gap-3 safe-area-inset-top">
                {/* Left: Hamburger & Logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="p-2 text-gray-400 hover:text-white active:scale-95 transition-all"
                    >
                        <Menu size={20} />
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Icon name="music" size={14} className="text-white" />
                        </div>
                    </Link>
                </div>

                {/* Center: Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-[200px] sm:max-w-xs relative group">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                        <Search size={14} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-white/5 border border-white/5 rounded-full py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
                    />
                </form>

                {/* Right: Profile Dropdown */}
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-full p-0 flex-shrink-0"
                        >
                            <Avatar className="size-8 bg-gradient-to-br from-purple-500 to-purple-900 ring-1 ring-purple-500/20">
                                <AvatarFallback className="bg-transparent text-white text-[10px] font-semibold">S</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1a1a2e] border-white/10 w-48 z-[60]">
                        <div className="flex items-center gap-2 p-2">
                            <Avatar className="size-8 bg-gradient-to-br from-purple-500 to-purple-900">
                                <AvatarFallback className="bg-transparent text-white text-xs">S</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-white">Supersonic</span>
                                <span className="text-[10px] text-purple-400">Premium</span>
                            </div>
                        </div>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer text-xs"><User className="mr-2 h-3 w-3" /> Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer text-xs"><Settings className="mr-2 h-3 w-3" /> Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="text-red-400 focus:text-red-300 cursor-pointer text-xs">
                            <LogOut className="mr-2 h-3 w-3" /> Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </nav>

            {/* Side Drawer (Hamburger Menu) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 bottom-0 left-0 z-[70] w-[280px] bg-[#12121a] border-r border-white/10 flex flex-col md:hidden"
                        >
                            {/* Drawer Header */}
                            <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                        <Icon name="music" size={14} className="text-white" />
                                    </div>
                                    <span className="font-bold text-white text-sm">Supersonic</span>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-full"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <ScrollArea className="flex-1 py-4">
                                <div className="px-3 space-y-6">
                                    {/* Main Menu */}
                                    <div>
                                        <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
                                        <div className="space-y-0.5">
                                            {NavItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                                        isActive(item.href) ? "bg-white/5 text-purple-400 font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <Icon name={item.icon} size={18} />
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="bg-white/5" />

                                    {/* Library */}
                                    <div>
                                        <p className="px-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Library</p>
                                        <div className="space-y-0.5">
                                            {LibraryItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                                        isActive(item.href) ? "bg-white/5 text-purple-400 font-medium" : "text-gray-400 hover:text-white hover:bg-white/5"
                                                    )}
                                                >
                                                    <Icon name={item.icon} size={18} />
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator className="bg-white/5" />

                                    {/* Playlists */}
                                    <div>
                                        <div className="flex items-center justify-between px-3 mb-2">
                                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Playlists</p>
                                            <button onClick={() => setIsCreating(true)} className="text-gray-400 hover:text-purple-400">
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {isCreating && (
                                            <div className="px-2 mb-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    placeholder="Name..."
                                                    value={newPlaylistName}
                                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleCreatePlaylist();
                                                        if (e.key === 'Escape') setIsCreating(false);
                                                    }}
                                                    onBlur={() => !newPlaylistName && setIsCreating(false)}
                                                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-0.5">
                                            {playlists.map((playlist) => (
                                                <Link
                                                    key={playlist.id}
                                                    href={`/playlist/${playlist.id}`}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors group"
                                                >
                                                    <div className={`w-5 h-5 rounded bg-gradient-to-br ${playlist.color} flex items-center justify-center`}>
                                                        <Icon name="music" size={10} className="text-white/80" />
                                                    </div>
                                                    <span className="truncate flex-1">{playlist.name}</span>
                                                    <span className="text-[9px] text-gray-600">{playlist.tracks.length}</span>
                                                </Link>
                                            ))}
                                            {playlists.length === 0 && !isCreating && (
                                                <button onClick={() => setIsCreating(true)} className="w-full text-left px-3 py-2 text-xs text-purple-400/80 hover:text-purple-400">
                                                    + Create Playlist
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
