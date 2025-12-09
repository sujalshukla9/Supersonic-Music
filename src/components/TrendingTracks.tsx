"use client";

import { useState } from 'react';
import { Icon } from './Icon';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites } from '@/context/FavoritesContext';
import { BoxMusicTrack } from '@/lib/youtube';
import AddToPlaylistModal from './AddToPlaylistModal';
import { motion, AnimatePresence } from 'framer-motion';

// Helper to get high quality thumbnail URL
const getHighQualityThumbnail = (thumbnail: string, videoId: string) => {
    // Try to use maxresdefault for best quality
    if (thumbnail.includes('hqdefault') || thumbnail.includes('mqdefault') || thumbnail.includes('default')) {
        return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return thumbnail;
};

// Container animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        }
    }
};

// Individual card animation variants
const cardVariants = {
    hidden: {
        opacity: 0,
        y: 30,
        scale: 0.9,
        rotateX: -10
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        transition: {
            type: "spring" as const,
            stiffness: 120,
            damping: 15,
            mass: 0.8
        }
    }
};

interface TrendingTracksProps {
    tracks: BoxMusicTrack[];
}

export default function TrendingTracks({ tracks }: TrendingTracksProps) {
    const { playTrack, setQueue, currentTrack, isPlaying, addToQueue } = usePlayer();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [selectedTrack, setSelectedTrack] = useState<BoxMusicTrack | null>(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

    const handlePlayTrack = (track: BoxMusicTrack, index: number) => {
        const queueTracks = tracks.map(t => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            thumbnail: t.thumbnail,
            duration: t.duration,
        }));
        setQueue(queueTracks);
        playTrack({
            id: track.id,
            title: track.title,
            artist: track.artist,
            thumbnail: track.thumbnail,
            duration: track.duration,
        });
    };

    const handleAddToPlaylist = (track: BoxMusicTrack, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTrack(track);
        setShowPlaylistModal(true);
    };

    const handleAddToQueue = (track: BoxMusicTrack, e: React.MouseEvent) => {
        e.stopPropagation();
        addToQueue({
            id: track.id,
            title: track.title,
            artist: track.artist,
            thumbnail: track.thumbnail,
            duration: track.duration,
        });
    };

    const handleToggleFavorite = (track: BoxMusicTrack, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite({
            id: track.id,
            title: track.title,
            artist: track.artist,
            thumbnail: track.thumbnail,
            duration: track.duration,
        });
    };

    if (tracks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" as const }}
                    >
                        <Icon name="music" size={28} className="text-purple-400" />
                    </motion.div>
                </div>
                <p className="text-gray-400 text-sm">Loading trending tracks...</p>
            </div>
        );
    }

    return (
        <>
            {/* Grid Layout for Trending Tracks */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5"
            >
                {tracks.slice(0, 10).map((track, index) => {
                    const isCurrentTrack = currentTrack?.id === track.id;
                    const isLiked = isFavorite(track.id);
                    const isHovered = hoveredTrack === track.id;
                    const isTrackPlaying = isCurrentTrack && isPlaying;

                    return (
                        <motion.div
                            key={track.id}
                            variants={cardVariants}
                            whileHover={{
                                scale: 1.03,
                                y: -6,
                                rotateY: 3,
                                rotateX: -3,
                                transition: { duration: 0.3, ease: "easeOut" as const }
                            }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePlayTrack(track, index)}
                            onMouseEnter={() => setHoveredTrack(track.id)}
                            onMouseLeave={() => setHoveredTrack(null)}
                            className={`
                                group relative flex flex-col rounded-xl md:rounded-2xl overflow-hidden cursor-pointer
                                bg-gradient-to-b from-white/[0.08] to-transparent
                                border transition-all duration-300 ease-out
                                hover:shadow-2xl hover:shadow-purple-500/15
                                p-2.5 md:p-3
                                ${isCurrentTrack
                                    ? "border-purple-500/50 shadow-lg shadow-purple-500/25"
                                    : "border-white/[0.06] hover:border-white/[0.15]"
                                }
                            `}
                            style={{ perspective: "1000px" }}
                        >
                            {/* Pulsing glow effect for current track */}
                            {isCurrentTrack && (
                                <motion.div
                                    className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-purple-500/30 blur-xl -z-10"
                                    animate={{
                                        opacity: [0.4, 0.7, 0.4],
                                        scale: [1, 1.03, 1],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut" as const
                                    }}
                                />
                            )}

                            {/* Rank Badge with animation */}
                            <motion.div
                                className={`
                                    absolute top-4 left-4 z-20 w-6 h-6 md:w-7 md:h-7 rounded-full
                                    flex items-center justify-center text-[10px] md:text-xs font-bold
                                    backdrop-blur-md shadow-lg
                                    ${index < 3
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/40'
                                        : 'bg-black/60 text-white/80'
                                    }
                                `}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{
                                    scale: 1,
                                    rotate: 0,
                                    y: index < 3 ? [0, -3, 0] : 0
                                }}
                                transition={{
                                    scale: { type: "spring", stiffness: 200, damping: 15, delay: index * 0.05 + 0.2 },
                                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" as const, delay: index * 0.2 }
                                }}
                                whileHover={{
                                    scale: 1.15,
                                    rotate: 5
                                }}
                            >
                                {index < 3 && (
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-orange-400"
                                        animate={{
                                            opacity: [0.5, 0.8, 0.5],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut" as const
                                        }}
                                        style={{ filter: "blur(4px)", zIndex: -1 }}
                                    />
                                )}
                                {index + 1}
                            </motion.div>

                            {/* Thumbnail Container */}
                            <div className="relative aspect-square w-full rounded-lg md:rounded-xl overflow-hidden mb-2.5 md:mb-3 shadow-lg">
                                {/* Shimmer effect on hover */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ x: "-100%", opacity: 0 }}
                                            animate={{ x: "200%", opacity: 0.25 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.7, ease: "easeInOut" as const }}
                                            className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
                                        />
                                    )}
                                </AnimatePresence>

                                <motion.img
                                    src={getHighQualityThumbnail(track.thumbnail, track.id)}
                                    alt={track.title}
                                    className="w-full h-full object-cover"
                                    animate={{
                                        scale: isHovered || isCurrentTrack ? 1.12 : 1,
                                        filter: isHovered || isCurrentTrack ? "brightness(0.65)" : "brightness(1)"
                                    }}
                                    transition={{ duration: 0.4, ease: "easeOut" as const }}
                                    onError={(e) => {
                                        // Fallback to hqdefault if maxresdefault doesn't exist
                                        (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;
                                    }}
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />

                                {/* Play Button Overlay with ripple effect */}
                                <AnimatePresence>
                                    {(isHovered || isCurrentTrack) && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            {isTrackPlaying ? (
                                                <div className="flex items-center gap-[2px] h-3">
                                                    {[0, 1, 2, 3, 4].map((i) => (
                                                        <motion.span
                                                            key={i}
                                                            className="w-[3px] bg-gradient-to-t from-purple-400 to-pink-400 rounded-full"
                                                            animate={{
                                                                height: ["3px", "12px", "6px", "10px", "3px"],
                                                                opacity: [0.7, 1, 0.7]
                                                            }}
                                                            transition={{
                                                                duration: 0.5 + Math.random() * 0.2,
                                                                repeat: Infinity,
                                                                delay: i * 0.1,
                                                                ease: "easeInOut" as const
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Ripple rings */}
                                                    <motion.div
                                                        className="absolute w-16 h-16 rounded-full border-2 border-purple-400/30"
                                                        animate={{ scale: [0.8, 1.4], opacity: [0.6, 0] }}
                                                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" as const }}
                                                    />
                                                    <motion.div
                                                        className="absolute w-16 h-16 rounded-full border-2 border-pink-400/30"
                                                        animate={{ scale: [0.8, 1.6], opacity: [0.5, 0] }}
                                                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" as const, delay: 0.25 }}
                                                    />

                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -45 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        exit={{ scale: 0, rotate: 45 }}
                                                        transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                                                        whileHover={{ scale: 1.15 }}
                                                        whileTap={{ scale: 0.85 }}
                                                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/50"
                                                    >
                                                        <Icon name="play" size={20} fill className="text-white ml-1" />
                                                    </motion.div>
                                                </>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Buttons with staggered animation */}
                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute bottom-2 right-2 flex gap-1.5"
                                        >
                                            {[
                                                { icon: "heart" as const, filled: isLiked, color: isLiked ? 'bg-pink-500/90' : 'bg-black/50', hoverColor: 'hover:bg-pink-500/80', action: (e: React.MouseEvent) => handleToggleFavorite(track, e) },
                                                { icon: "plus" as const, filled: false, color: 'bg-black/50', hoverColor: 'hover:bg-purple-500/80', action: (e: React.MouseEvent) => handleAddToPlaylist(track, e) },
                                            ].map((btn, i) => (
                                                <motion.button
                                                    key={btn.icon}
                                                    initial={{ opacity: 0, y: 10, scale: 0.5 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.5 }}
                                                    transition={{ delay: i * 0.05, type: "spring" as const, stiffness: 400 }}
                                                    whileHover={{ scale: 1.2, rotate: 8 }}
                                                    whileTap={{ scale: 0.8 }}
                                                    onClick={btn.action}
                                                    className={`
                                                        w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center
                                                        transition-colors shadow-lg
                                                        ${btn.color} ${btn.hoverColor}
                                                        ${btn.filled ? 'text-white' : 'text-white/80 hover:text-white'}
                                                    `}
                                                >
                                                    <Icon name={btn.icon} size={14} fill={btn.filled} />
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Duration Badge */}
                                <motion.div
                                    className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 + 0.3 }}
                                >
                                    <span className="text-white/90 text-[10px] font-medium">
                                        {track.duration || "3:20"}
                                    </span>
                                </motion.div>
                            </div>

                            {/* Track Info with slide-up on hover */}
                            <motion.div
                                className="flex-1 min-w-0 px-0.5"
                                animate={{
                                    y: isHovered ? -2 : 0
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.h4
                                    className={`
                                        font-semibold text-xs md:text-sm leading-tight line-clamp-2 mb-1 transition-colors
                                        ${isCurrentTrack ? "text-purple-400" : "text-white"}
                                    `}
                                    animate={{
                                        textShadow: isCurrentTrack ? "0 0 12px rgba(168,85,247,0.5)" : "none"
                                    }}
                                >
                                    {track.title}
                                </motion.h4>
                                <p className="text-gray-400 text-[10px] md:text-xs truncate">
                                    {track.artist}
                                </p>
                            </motion.div>

                            {/* Animated Now Playing Indicator */}
                            {isTrackPlaying && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 0.4, ease: "easeOut" as const }}
                                    className="absolute bottom-0 left-0 h-0.5 overflow-hidden rounded-full"
                                >
                                    <motion.div
                                        className="w-full h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
                                        animate={{
                                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                        }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            ease: "linear" as const
                                        }}
                                        style={{ backgroundSize: "200% 100%" }}
                                    />
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>


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

