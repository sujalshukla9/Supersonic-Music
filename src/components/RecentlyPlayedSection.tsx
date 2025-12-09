"use client";

import { Icon } from "./Icon";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useState, useRef } from "react";
import AddToPlaylistModal from "./AddToPlaylistModal";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Clock, Play, Heart, Plus, ListMusic, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to get high quality thumbnail URL
const getHighQualityThumbnail = (thumbnail: string, videoId: string) => {
    if (thumbnail.includes('hqdefault') || thumbnail.includes('mqdefault') || thumbnail.includes('default')) {
        return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return thumbnail;
};

interface Track {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration?: string;
}

export default function RecentlyPlayedSection() {
    const { currentTrack, recentlyPlayed, playTrack, isPlaying, addToQueue, togglePlay, setQueue } = usePlayer();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleTrackClick = (track: Track) => {
        if (currentTrack?.id === track.id) {
            togglePlay();
        } else {
            // Set the recently played tracks as the queue
            const queueTracks = recentlyPlayed.slice(0, 10).map(t => ({
                id: t.id,
                title: t.title,
                artist: t.artist,
                thumbnail: t.thumbnail,
                duration: t.duration,
            }));
            setQueue(queueTracks);
            playTrack(track);
        }
    };

    const handleAddToPlaylist = (track: Track, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTrack(track);
        setShowPlaylistModal(true);
    };

    const handleAddToQueue = (track: Track, e: React.MouseEvent) => {
        e.stopPropagation();
        addToQueue(track);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (recentlyPlayed.length === 0) {
        return null;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 300,
                damping: 24
            }
        }
    };

    const PlayingIndicator = () => (
        <div className="flex items-end gap-[2px] h-3">
            {[0, 1, 2, 3].map((i) => (
                <motion.span
                    key={i}
                    className="w-[3px] bg-white rounded-t-full"
                    animate={{
                        height: [4, 12, 4],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                    }}
                    style={{ height: 4 }}
                />
            ))}
        </div>
    );

    return (
        <>
            <section className="mb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-white/5">
                            <Clock className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Recently Played</h2>
                            <p className="text-gray-400 text-xs font-medium">{recentlyPlayed.length} tracks</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => scroll('left')}
                            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => scroll('right')}
                            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Horizontal Scrollable Cards */}
                <div className="relative group/container">
                    <motion.div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto pb-8 pt-2 no-scrollbar scroll-smooth px-1 pr-24"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {recentlyPlayed.slice(0, 10).map((track, index) => {
                            const isCurrentTrack = currentTrack?.id === track.id;
                            const isTrackPlaying = isCurrentTrack && isPlaying;
                            const isLiked = isFavorite(track.id);
                            const isHovered = hoveredTrack === track.id;

                            return (
                                <motion.div
                                    key={`${track.id}-${index}`}
                                    variants={itemVariants}
                                    className="relative flex-shrink-0"
                                    onMouseEnter={() => setHoveredTrack(track.id)}
                                    onMouseLeave={() => setHoveredTrack(null)}
                                >
                                    <motion.div
                                        onClick={() => handleTrackClick(track)}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className={`
                                            relative w-[160px] md:w-[180px]
                                            rounded-2xl overflow-hidden cursor-pointer
                                            bg-[#12121a] border transition-all duration-300
                                            ${isCurrentTrack
                                                ? "border-purple-500/50 shadow-[0_8px_30px_rgba(168,85,247,0.2)]"
                                                : "border-white/5 shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-white/10"
                                            }
                                        `}
                                    >
                                        {/* Album Art Container */}
                                        <div className="relative aspect-square overflow-hidden bg-purple-900/20">
                                            <img
                                                src={getHighQualityThumbnail(track.thumbnail, track.id)}
                                                alt={track.title}
                                                className={`w-full h-full object-cover transition-all duration-300 ${isHovered || isCurrentTrack ? 'scale-110' : 'scale-100'
                                                    } ${isHovered || (isCurrentTrack && !isTrackPlaying) ? 'brightness-[0.6]' : 'brightness-100'
                                                    }`}
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    if (img.src.includes('maxresdefault')) {
                                                        img.src = `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;
                                                    } else {
                                                        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(track.title)}&background=8b5cf6&color=fff&size=180`;
                                                    }
                                                }}
                                            />

                                            {/* Now Playing Badge */}
                                            {isTrackPlaying && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                                    <div className="bg-black/50 backdrop-blur-md p-3 rounded-full">
                                                        <PlayingIndicator />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Play/Pause Overlay */}
                                            <AnimatePresence>
                                                {(isHovered || (isCurrentTrack && !isTrackPlaying)) && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 flex items-center justify-center z-10"
                                                    >
                                                        <motion.div
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl shadow-purple-500/20"
                                                        >
                                                            {isCurrentTrack && isPlaying ? (
                                                                <Pause className="w-5 h-5 text-black fill-black" />
                                                            ) : (
                                                                <Play className="w-5 h-5 text-black fill-black ml-1" />
                                                            )}
                                                        </motion.div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Action Buttons */}
                                            <AnimatePresence>
                                                {isHovered && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute top-2 right-2 flex flex-col gap-2 z-20"
                                                    >
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => { e.stopPropagation(); toggleFavorite(track); }}
                                                            className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors shadow-lg ${isLiked ? 'bg-pink-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
                                                        >
                                                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={(e) => handleAddToPlaylist(track, e)}
                                                            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors shadow-lg"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Track Info */}
                                        <div className="p-4 bg-gradient-to-b from-[#12121a] to-[#0a0a0f]">
                                            <h4 className={`font-semibold text-sm line-clamp-1 mb-1 ${isCurrentTrack ? 'text-purple-400' : 'text-white'}`}>
                                                {track.title}
                                            </h4>
                                            <p className="text-gray-400 text-xs line-clamp-1">
                                                {track.artist}
                                            </p>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}

                        {/* View All Card */}
                        <Link href="/history" className="relative flex-shrink-0">
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-[160px] md:w-[180px] h-full min-h-[220px] rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-500/10 hover:border-purple-500/20 transition-colors gap-4 group"
                            >
                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                    <ListMusic className="w-6 h-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                </div>
                                <p className="text-gray-400 text-sm font-medium group-hover:text-purple-400 transition-colors">View History</p>
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* Fade edges - subtle gradient */}
                    <div className="absolute right-0 top-0 bottom-8 w-16 bg-gradient-to-l from-[#090910]/90 to-transparent pointer-events-none" />
                </div>
            </section>

            {/* Add to Playlist Modal */}
            {selectedTrack && (
                <AddToPlaylistModal
                    track={selectedTrack}
                    isOpen={showPlaylistModal}
                    onClose={() => {
                        setShowPlaylistModal(false);
                        setSelectedTrack(null);
                    }}
                />
            )}
        </>
    );
}
