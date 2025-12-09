"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, Play, Pause } from "lucide-react";

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

export default function HistoryPage() {
    const { recentlyPlayed, playTrack, setQueue, currentTrack, isPlaying, addToQueue } = usePlayer();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

    const handlePlayTrack = (track: Track, index: number) => {
        setQueue(recentlyPlayed);
        playTrack(track);
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

    const handleToggleFavorite = (track: Track, e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(track);
    };

    const handlePlayAll = () => {
        if (recentlyPlayed.length > 0) {
            setQueue(recentlyPlayed);
            playTrack(recentlyPlayed[0]);
        }
    };

    return (
        <div className="pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30"
                    >
                        <Clock className="w-10 h-10 md:w-14 md:h-14 text-white" />
                    </motion.div>
                    <div>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs md:text-sm text-gray-400 font-medium uppercase tracking-wider mb-1"
                        >
                            Listening History
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-4xl font-bold text-white"
                        >
                            Recently Played
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-400 text-sm mt-1"
                        >
                            {recentlyPlayed.length} tracks
                        </motion.p>
                    </div>
                </div>

                {/* Actions */}
                {recentlyPlayed.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-3 md:ml-auto"
                    >
                        <button
                            onClick={handlePlayAll}
                            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:scale-105 active:scale-95"
                        >
                            <Play className="w-5 h-5 fill-white" />
                            Play All
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Content */}
            {recentlyPlayed.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6">
                        <Clock className="w-12 h-12 text-cyan-400/50" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">No Listening History</h2>
                    <p className="text-gray-400 max-w-md">
                        Your recently played tracks will appear here. Start playing some music to build your history!
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-2">
                    {recentlyPlayed.map((track, index) => {
                        const isCurrentTrack = currentTrack?.id === track.id;
                        const isLiked = isFavorite(track.id);
                        const isHovered = hoveredTrack === track.id;

                        return (
                            <motion.div
                                key={`${track.id}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => handlePlayTrack(track, index)}
                                onMouseEnter={() => setHoveredTrack(track.id)}
                                onMouseLeave={() => setHoveredTrack(null)}
                                className={`
                                    group relative flex items-center gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer
                                    transition-all duration-300 border
                                    ${isCurrentTrack
                                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500/30"
                                        : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10"
                                    }
                                `}
                            >
                                {/* Track Number / Play Icon */}
                                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center shrink-0">
                                    <AnimatePresence mode="wait">
                                        {isCurrentTrack && isPlaying ? (
                                            <motion.div
                                                key="playing"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="flex items-center gap-[2px]"
                                            >
                                                {[0, 1, 2].map((i) => (
                                                    <motion.span
                                                        key={i}
                                                        className="w-[3px] bg-gradient-to-t from-cyan-400 to-blue-400 rounded-full"
                                                        animate={{
                                                            height: ["6px", "16px", "8px", "14px", "6px"],
                                                        }}
                                                        transition={{
                                                            duration: 0.8,
                                                            repeat: Infinity,
                                                            delay: i * 0.15,
                                                        }}
                                                    />
                                                ))}
                                            </motion.div>
                                        ) : isHovered ? (
                                            <motion.div
                                                key="play"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg"
                                            >
                                                <Icon name="play" size={14} fill className="text-white ml-0.5" />
                                            </motion.div>
                                        ) : (
                                            <motion.span
                                                key="number"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className={`text-sm font-medium ${isCurrentTrack ? 'text-cyan-400' : 'text-gray-500'}`}
                                            >
                                                {index + 1}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Thumbnail */}
                                <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden shrink-0 shadow-lg">
                                    <img
                                        src={getHighQualityThumbnail(track.thumbnail, track.id)}
                                        alt={track.title}
                                        className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            if (img.src.includes('maxresdefault')) {
                                                img.src = `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`;
                                            }
                                        }}
                                    />
                                    {isCurrentTrack && (
                                        <div className="absolute inset-0 bg-cyan-500/20" />
                                    )}
                                </div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-sm md:text-base truncate transition-colors ${isCurrentTrack ? 'text-cyan-400' : 'text-white'}`}>
                                        {track.title}
                                    </h3>
                                    <p className="text-gray-400 text-xs md:text-sm truncate">{track.artist}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {/* Favorite Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => handleToggleFavorite(track, e)}
                                        className={`
                                            w-9 h-9 rounded-full flex items-center justify-center transition-all
                                            ${isLiked
                                                ? 'bg-pink-500/20 text-pink-500'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-pink-400 opacity-0 group-hover:opacity-100'
                                            }
                                        `}
                                    >
                                        <Icon name="heart" size={16} fill={isLiked} />
                                    </motion.button>

                                    {/* Add to Playlist */}
                                    <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => handleAddToPlaylist(track, e)}
                                        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Icon name="plus" size={16} />
                                    </motion.button>

                                    {/* Add to Queue */}
                                    <motion.button
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => handleAddToQueue(track, e)}
                                        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-cyan-400 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Icon name="queue" size={16} />
                                    </motion.button>

                                    {/* Duration */}
                                    <span className="text-gray-500 text-xs md:text-sm font-medium min-w-[40px] text-right hidden sm:block">
                                        {track.duration || "3:20"}
                                    </span>
                                </div>

                                {/* Now Playing Indicator */}
                                {isCurrentTrack && (
                                    <motion.div
                                        layoutId="historyActiveIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

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
        </div>
    );
}
