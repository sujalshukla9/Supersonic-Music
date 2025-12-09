"use client";

import { useState } from "react";
import { Icon, IconName } from "./Icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlaylist } from "@/context/PlaylistContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, Transition } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Settings, Plus } from "lucide-react";

const sidebarVariants = {
    open: {
        width: "15rem",
    },
    closed: {
        width: "3.5rem",
    },
};

const contentVariants = {
    open: { display: "block", opacity: 1 },
    closed: { display: "block", opacity: 1 },
};

const variants = {
    open: {
        x: 0,
        opacity: 1,
        transition: {
            x: { stiffness: 1000, velocity: -100 },
        },
    },
    closed: {
        x: -20,
        opacity: 0,
        transition: {
            x: { stiffness: 100 },
        },
    },
};

const transitionProps: Transition = {
    type: "tween",
    ease: "easeOut",
    duration: 0.2,
};

const staggerVariants = {
    open: {
        transition: { staggerChildren: 0.03, delayChildren: 0.02 },
    },
};

export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const pathname = usePathname();
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

    const handleCreatePlaylist = () => {
        if (newPlaylistName.trim()) {
            createPlaylist(newPlaylistName);
            setNewPlaylistName('');
            setIsCreating(false);
        }
    };

    return (
        <motion.div
            className={cn(
                "sidebar fixed left-0 z-40 h-full shrink-0 border-r border-white/5 hidden md:block",
            )}
            initial={isCollapsed ? "closed" : "open"}
            animate={isCollapsed ? "closed" : "open"}
            variants={sidebarVariants}
            transition={transitionProps}
            onMouseEnter={() => setIsCollapsed(false)}
            onMouseLeave={() => setIsCollapsed(true)}
        >
            <motion.div
                className="relative z-40 flex text-gray-400 h-full shrink-0 flex-col bg-[#12121a] transition-all"
                variants={contentVariants}
            >
                <motion.ul variants={staggerVariants} className="flex h-full flex-col">
                    <div className="flex grow flex-col">
                        {/* Logo Header */}
                        <div className="flex h-[60px] w-full shrink-0 items-center border-b border-white/5 px-3.5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
                                    <Icon name="music" size={18} className="text-white" />
                                </div>
                                {!isCollapsed && (
                                    <motion.div variants={variants} className="flex flex-col">
                                        <span className="text-sm font-bold tracking-wide text-white">
                                            Supersonic
                                        </span>
                                        <span className="text-[10px] font-medium text-purple-400">
                                            Music
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex h-full w-full flex-col">
                            <div className="flex grow flex-col">
                                <ScrollArea className="h-16 grow p-2">
                                    <div className={cn("flex w-full flex-col gap-0.5")}>
                                        {/* Menu Section */}
                                        {!isCollapsed && (
                                            <motion.p
                                                variants={variants}
                                                className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2"
                                            >
                                                Menu
                                            </motion.p>
                                        )}
                                        {NavItems.map((item) => {
                                            const active = isActive(item.href);
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={cn(
                                                        "flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all hover:bg-white/5 hover:text-white group",
                                                        active && "bg-white/5 text-purple-400",
                                                    )}
                                                >
                                                    <Icon
                                                        name={item.icon}
                                                        size={18}
                                                        className={cn(
                                                            "shrink-0 transition-colors",
                                                            active ? "text-purple-400" : "group-hover:text-purple-400"
                                                        )}
                                                    />
                                                    <motion.li variants={variants} className="list-none">
                                                        {!isCollapsed && (
                                                            <p className="ml-3 text-sm font-medium whitespace-nowrap">{item.name}</p>
                                                        )}
                                                    </motion.li>
                                                    {active && !isCollapsed && (
                                                        <motion.div
                                                            layoutId="activeIndicator"
                                                            className="ml-auto w-1.5 h-1.5 bg-purple-400 rounded-full"
                                                        />
                                                    )}
                                                </Link>
                                            );
                                        })}

                                        <Separator className="my-3 bg-white/5" />

                                        {/* Library Section */}
                                        {!isCollapsed && (
                                            <motion.p
                                                variants={variants}
                                                className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2"
                                            >
                                                Library
                                            </motion.p>
                                        )}
                                        {LibraryItems.map((item) => {
                                            const active = isActive(item.href);
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className={cn(
                                                        "flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all hover:bg-white/5 hover:text-white group",
                                                        active && "bg-white/5 text-purple-400",
                                                    )}
                                                >
                                                    <Icon
                                                        name={item.icon}
                                                        size={18}
                                                        className={cn(
                                                            "shrink-0 transition-colors",
                                                            active ? "text-purple-400" : "group-hover:text-purple-400"
                                                        )}
                                                    />
                                                    <motion.li variants={variants} className="list-none">
                                                        {!isCollapsed && (
                                                            <p className="ml-3 text-sm font-medium whitespace-nowrap">{item.name}</p>
                                                        )}
                                                    </motion.li>
                                                    {active && !isCollapsed && (
                                                        <motion.div
                                                            layoutId="activeIndicatorLib"
                                                            className="ml-auto w-1.5 h-1.5 bg-purple-400 rounded-full"
                                                        />
                                                    )}
                                                </Link>
                                            );
                                        })}

                                        <Separator className="my-3 bg-white/5" />

                                        {/* Playlist Section */}
                                        {!isCollapsed && (
                                            <motion.div variants={variants} className="flex items-center justify-between mb-2 px-2">
                                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                                    Playlist
                                                </p>
                                                <button
                                                    onClick={() => setIsCreating(true)}
                                                    className="text-gray-600 hover:text-purple-400 transition-all hover:scale-110"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </motion.div>
                                        )}

                                        {/* Create Playlist Input */}
                                        {isCreating && !isCollapsed && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mb-2 px-1"
                                            >
                                                <input
                                                    type="text"
                                                    value={newPlaylistName}
                                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                                    placeholder="Playlist name..."
                                                    autoFocus
                                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleCreatePlaylist();
                                                        if (e.key === 'Escape') {
                                                            setIsCreating(false);
                                                            setNewPlaylistName('');
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (!newPlaylistName.trim()) {
                                                            setIsCreating(false);
                                                        }
                                                    }}
                                                />
                                            </motion.div>
                                        )}

                                        {/* Playlist Items */}
                                        {!isCollapsed && playlists.length === 0 && !isCreating && (
                                            <motion.div variants={variants} className="text-center py-4 px-2">
                                                <p className="text-gray-600 text-xs mb-2">No playlists yet</p>
                                                <button
                                                    onClick={() => setIsCreating(true)}
                                                    className="text-purple-400 text-xs font-medium hover:text-purple-300 transition-colors"
                                                >
                                                    + Create your first playlist
                                                </button>
                                            </motion.div>
                                        )}

                                        {playlists.map((playlist) => (
                                            <Link
                                                key={playlist.id}
                                                href={`/playlist/${playlist.id}`}
                                                className="flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all hover:bg-white/5 hover:text-white group"
                                            >
                                                <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${playlist.color} flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform`}>
                                                    <Icon name="music" size={12} className="text-white/80" />
                                                </div>
                                                <motion.li variants={variants} className="list-none flex-1 min-w-0 ml-3">
                                                    {!isCollapsed && (
                                                        <div>
                                                            <p className="text-sm font-medium truncate group-hover:text-purple-400 transition-colors">
                                                                {playlist.name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-500">{playlist.tracks.length} Tracks</p>
                                                        </div>
                                                    )}
                                                </motion.li>
                                            </Link>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Bottom Settings */}
                            <div className="flex flex-col p-2 border-t border-white/5">
                                <Link
                                    href="/settings"
                                    className={cn(
                                        "flex h-9 w-full flex-row items-center rounded-lg px-2.5 py-2 transition-all hover:bg-white/5 hover:text-white group",
                                        isActive("/settings") && "bg-white/5 text-purple-400"
                                    )}
                                >
                                    <Settings className={cn(
                                        "h-4 w-4 shrink-0 transition-colors",
                                        isActive("/settings") ? "text-purple-400" : "group-hover:text-purple-400"
                                    )} />
                                    <motion.li variants={variants} className="list-none">
                                        {!isCollapsed && (
                                            <p className="ml-3 text-sm font-medium">Settings</p>
                                        )}
                                    </motion.li>
                                    {isActive("/settings") && !isCollapsed && (
                                        <motion.div
                                            layoutId="activeIndicatorSettings"
                                            className="ml-auto w-1.5 h-1.5 bg-purple-400 rounded-full"
                                        />
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.ul>
            </motion.div>
        </motion.div>
    );
}
