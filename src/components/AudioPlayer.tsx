"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Shuffle,
    Repeat,
    ListPlus,
    Heart,
    VolumeX,
    Volume1,
    Volume2,
    Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useSettings } from "@/context/SettingsContext";
import AddToPlaylistModal from "./AddToPlaylistModal";

const formatTime = (seconds: number = 0) => {
    if (!isFinite(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Helper to get high quality thumbnail URL
const getHighQualityThumbnail = (thumbnail: string, videoId: string) => {
    if (thumbnail.includes('hqdefault') || thumbnail.includes('mqdefault') || thumbnail.includes('default')) {
        return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return thumbnail;
};

const AudioPlayer = ({
    cover,
    title,
    artist,
}: {
    src?: string;
    cover?: string;
    title?: string;
    artist?: string;
}) => {
    const {
        isPlaying,
        progress,
        duration,
        isShuffle,
        isLoop,
        isAutoPlay,
        togglePlay,
        seek,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleLoop,
        toggleAutoPlay,
        currentTrack,
        isLoading,
        volume,
        setVolume,
    } = usePlayer();

    const { settings } = useSettings();
    const { isFavorite, toggleFavorite } = useFavorites();
    const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;

    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [isHoveringProgress, setIsHoveringProgress] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Get quality label and bitrate
    const getQualityInfo = () => {
        switch (settings.audioQuality) {
            case 'low': return { label: 'LOW', bitrate: '96 kbps' };
            case 'medium': return { label: 'MED', bitrate: '160 kbps' };
            case 'high': return { label: 'HIGH', bitrate: '320 kbps' };
            case 'lossless': return { label: 'FLAC', bitrate: 'Lossless' };
            default: return { label: 'HIGH', bitrate: '320 kbps' };
        }
    };
    const qualityInfo = getQualityInfo();

    const handleToggleFavorite = () => {
        if (currentTrack) {
            toggleFavorite(currentTrack);
        }
    };

    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

    const handleSeek = (value: number) => {
        if (duration > 0) {
            const time = (value / 100) * duration;
            if (isFinite(time)) {
                seek(time);
            }
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        handleSeek((x / rect.width) * 100);
    };

    const handleProgressTouch = (e: React.TouchEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left;
        handleSeek((x / rect.width) * 100);
    };

    if (!currentTrack) return null;

    // Spring animation config for smooth, bouncy animations
    const springConfig = {
        type: "spring" as const,
        stiffness: 400,
        damping: 30,
    };

    // Smooth transition config
    const smoothTransition = {
        duration: 0.4,
        ease: "easeOut" as const,
    };

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTrack.id}
                    className={cn(
                        "relative flex flex-col mx-auto overflow-hidden",
                        "rounded-2xl sm:rounded-[24px] md:rounded-[28px] lg:rounded-[32px]",
                        "bg-gradient-to-b from-[#3b1d6e] via-[#2a1055] to-[#150825]",
                        "shadow-[0_20px_60px_rgba(88,28,135,0.3),0_8px_20px_rgba(0,0,0,0.5)]",
                        "p-2.5 sm:p-3 md:p-3.5 lg:p-4",
                        "w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] lg:max-w-none",
                        "border border-purple-500/10"
                    )}
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -30 }}
                    transition={springConfig}
                    layout
                >
                    {/* Album Art */}
                    <motion.div
                        className={cn(
                            "w-full aspect-square overflow-hidden relative group flex-shrink-0",
                            "rounded-xl sm:rounded-2xl md:rounded-[18px] lg:rounded-[24px]",
                            "shadow-[0_10px_30px_rgba(88,28,135,0.4)] border border-purple-500/20",
                            "mb-2.5 sm:mb-3 lg:mb-4"
                        )}
                        whileHover={{ scale: 1.02 }}
                        transition={smoothTransition}
                    >
                        <AnimatePresence mode="wait">
                            {cover ? (
                                <motion.img
                                    key={cover}
                                    src={currentTrack ? getHighQualityThumbnail(cover, currentTrack.id) : cover}
                                    alt="cover"
                                    className="w-full h-full object-cover"
                                    initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        if (img.src.includes('maxresdefault') && currentTrack) {
                                            img.src = `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`;
                                        }
                                    }}
                                />
                            ) : (
                                <motion.div
                                    className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <Icon name="music" size={36} className="text-white/20" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Gradient Overlay */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.4 }}
                        />

                        {/* Loading Overlay */}
                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.div
                                        className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-purple-400 border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Playing Animation Overlay */}
                        <AnimatePresence>
                            {isPlaying && !isLoading && (
                                <motion.div
                                    className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 flex items-end gap-[2px] sm:gap-[3px]"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {[0, 1, 2, 3].map((i) => (
                                        <motion.span
                                            key={i}
                                            className="w-[2px] sm:w-[3px] bg-gradient-to-t from-purple-400 to-fuchsia-400 rounded-full"
                                            animate={{
                                                height: ["6px", "16px", "10px", "14px", "6px"],
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                                delay: i * 0.1,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Add to Playlist Button on Album Art */}
                        <motion.button
                            onClick={() => setShowPlaylistModal(true)}
                            className={cn(
                                "absolute top-2 sm:top-3 right-2 sm:right-3",
                                "w-7 h-7 sm:w-8 sm:h-8",
                                "bg-black/40 backdrop-blur-sm rounded-full",
                                "flex items-center justify-center",
                                "text-white/70 hover:text-white hover:bg-purple-600",
                                "opacity-0 group-hover:opacity-100 transition-opacity"
                            )}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            title="Add to Playlist"
                        >
                            <ListPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </motion.button>
                    </motion.div>

                    {/* Content */}
                    <div className="flex flex-col space-y-1.5 sm:space-y-2 lg:space-y-3 w-full">

                        {/* Meta */}
                        <motion.div
                            className="text-center space-y-0.5 px-0.5 sm:px-1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, ...smoothTransition }}
                        >
                            <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg leading-tight truncate w-full">
                                {title || currentTrack.title || "Unknown Track"}
                            </h3>
                            <p className="text-white/50 text-[9px] sm:text-[10px] lg:text-xs font-medium truncate w-full">
                                {artist || currentTrack.artist || "Unknown Artist"}
                            </p>
                        </motion.div>

                        {/* Streaming Quality Badge */}
                        <motion.div
                            className="flex items-center justify-center w-full"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, ...smoothTransition }}
                        >
                            <div className={cn(
                                "flex items-center gap-1.5 px-2 py-0.5 rounded-full",
                                "bg-white/5 border border-white/10",
                                "text-[8px] sm:text-[9px] font-medium",
                                settings.audioQuality === 'lossless'
                                    ? "text-purple-400 border-purple-500/30 bg-purple-500/10"
                                    : settings.audioQuality === 'high'
                                        ? "text-green-400 border-green-500/20 bg-green-500/5"
                                        : "text-white/50"
                            )}>
                                <span className="flex items-center gap-1">
                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="6" cy="18" r="3" />
                                        <circle cx="18" cy="16" r="3" />
                                    </svg>
                                    <span className="font-bold tracking-wide">{qualityInfo.label}</span>
                                </span>
                                <span className="text-white/30">•</span>
                                <span className="text-white/40">{qualityInfo.bitrate}</span>
                            </div>
                        </motion.div>

                        {/* Progress */}
                        <motion.div
                            className="space-y-0.5 sm:space-y-1 w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.25, ...smoothTransition }}
                        >
                            <div className="flex items-center justify-between text-[8px] sm:text-[9px] lg:text-[10px] text-white/50 font-medium px-0.5 sm:px-1 w-full">
                                <span className="tabular-nums min-w-[28px] sm:min-w-[32px]">{formatTime(progress)}</span>
                                <div
                                    className="flex-1 mx-1.5 sm:mx-2 lg:mx-3 h-6 sm:h-8 flex items-center touch-none"
                                    onMouseEnter={() => setIsHoveringProgress(true)}
                                    onMouseLeave={() => { setIsHoveringProgress(false); setIsDragging(false); }}
                                    onMouseDown={() => setIsDragging(true)}
                                    onMouseUp={() => setIsDragging(false)}
                                >
                                    {/* Progress Bar */}
                                    <div
                                        className={cn(
                                            "w-full h-1 sm:h-1.5 bg-white/10 rounded-full cursor-pointer relative group overflow-visible",
                                            (isHoveringProgress || isDragging) && "h-1.5 sm:h-2"
                                        )}
                                        onClick={handleProgressClick}
                                        onTouchMove={handleProgressTouch}
                                        style={{ transition: "height 0.2s ease" }}
                                    >
                                        {/* Progress Fill with smooth transition */}
                                        <motion.div
                                            className={cn(
                                                "h-full rounded-full relative overflow-hidden",
                                                "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400"
                                            )}
                                            style={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 0.1, ease: "linear" }}
                                        >
                                            {/* Shimmer effect */}
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                                animate={{ x: ["-100%", "100%"] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                        </motion.div>

                                        {/* Seek Thumb */}
                                        <motion.div
                                            className={cn(
                                                "absolute top-1/2 -translate-y-1/2",
                                                "w-2.5 h-2.5 sm:w-3 sm:h-3",
                                                "bg-white rounded-full",
                                                "shadow-[0_0_12px_rgba(168,85,247,0.8)]"
                                            )}
                                            style={{ left: `calc(${progressPercent}% - 5px)` }}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: (isHoveringProgress || isDragging) ? 1 : 0,
                                                opacity: (isHoveringProgress || isDragging) ? 1 : 0
                                            }}
                                            transition={{ duration: 0.15, type: "spring", stiffness: 500 }}
                                        />
                                    </div>
                                </div>
                                <span className="tabular-nums min-w-[28px] sm:min-w-[32px] text-right">{formatTime(duration)}</span>
                            </div>
                        </motion.div>

                        {/* Controls */}
                        <motion.div
                            className="flex items-center justify-between px-0 sm:px-1 lg:px-2 w-full"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, ...smoothTransition }}
                        >
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleLoop}
                                    className={cn(
                                        "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8",
                                        "hover:bg-transparent transition-all duration-300",
                                        isLoop ? "text-purple-400" : "text-white/40 hover:text-white"
                                    )}
                                    title="Repeat"
                                >
                                    <Repeat className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                                </Button>
                            </motion.div>

                            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                                <motion.div
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.85 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={prevTrack}
                                        className="text-white hover:text-white hover:bg-transparent transition-all w-7 h-7 sm:w-8 sm:h-8"
                                        title="Previous"
                                    >
                                        <SkipBack className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 fill-white" />
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                >
                                    <Button
                                        onClick={togglePlay}
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "bg-white text-purple-700 hover:bg-white/95",
                                            "w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12",
                                            "rounded-full p-0",
                                            "shadow-[0_0_25px_rgba(168,85,247,0.5)]",
                                            "flex items-center justify-center",
                                            "transition-shadow duration-300",
                                            isPlaying && "shadow-[0_0_35px_rgba(168,85,247,0.7)]"
                                        )}
                                        title={isPlaying ? "Pause" : "Play"}
                                    >
                                        <AnimatePresence mode="wait">
                                            {isLoading ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0, rotate: 0 }}
                                                    animate={{ opacity: 1, rotate: 360 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3, rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                                                    className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-purple-600 border-t-transparent rounded-full"
                                                />
                                            ) : isPlaying ? (
                                                <motion.div
                                                    key="pause"
                                                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                                    transition={{ duration: 0.25, type: "spring", stiffness: 500 }}
                                                >
                                                    <Pause className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="play"
                                                    initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                    exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                                    transition={{ duration: 0.25, type: "spring", stiffness: 500 }}
                                                >
                                                    <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current ml-0.5" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.15 }}
                                    whileTap={{ scale: 0.85 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={nextTrack}
                                        className="text-white hover:text-white hover:bg-transparent transition-all w-7 h-7 sm:w-8 sm:h-8"
                                        title="Next"
                                    >
                                        <SkipForward className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 fill-white" />
                                    </Button>
                                </motion.div>
                            </div>

                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleShuffle}
                                    className={cn(
                                        "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8",
                                        "hover:bg-transparent transition-all duration-300",
                                        isShuffle ? "text-purple-400" : "text-white/40 hover:text-white"
                                    )}
                                    title="Shuffle"
                                >
                                    <Shuffle className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                                </Button>
                            </motion.div>

                            {/* AutoPlay Toggle */}
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleAutoPlay}
                                    className={cn(
                                        "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8",
                                        "hover:bg-transparent transition-all duration-300",
                                        isAutoPlay ? "text-green-400" : "text-white/40 hover:text-white"
                                    )}
                                    title={isAutoPlay ? "AutoPlay On - Related songs will play automatically" : "AutoPlay Off"}
                                >
                                    <Radio className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Volume Control */}
                        <motion.div
                            className="flex items-center gap-2 px-0.5 sm:px-1 w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, ...smoothTransition }}
                        >
                            <button
                                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                                className="text-white/40 hover:text-white transition-colors"
                            >
                                {volume === 0 ? (
                                    <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                ) : volume < 0.5 ? (
                                    <Volume1 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                ) : (
                                    <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                )}
                            </button>
                            <div
                                className="flex-1 h-6 flex items-center cursor-pointer group touch-none"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const percent = (e.clientX - rect.left) / rect.width;
                                    setVolume(Math.max(0, Math.min(1, percent)));
                                }}
                            >
                                <div className="w-full h-1 bg-white/10 rounded-full relative overflow-visible">
                                    <div
                                        className="absolute left-0 top-0 bottom-0 bg-white/40 group-hover:bg-purple-400 rounded-full transition-colors"
                                        style={{ width: `${volume * 100}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg transition-opacity scale-0 group-hover:scale-100" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Action Buttons */}
                        <motion.div
                            className="flex items-center gap-1.5 sm:gap-2 w-full"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45, ...smoothTransition }}
                        >
                            <motion.button
                                onClick={handleToggleFavorite}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2",
                                    "py-1.5 sm:py-2",
                                    "text-[9px] sm:text-[10px] lg:text-xs font-medium",
                                    "rounded-lg sm:rounded-xl transition-all duration-300",
                                    isLiked
                                        ? "text-pink-500 bg-pink-500/15"
                                        : "text-white/50 hover:text-pink-400 hover:bg-white/5"
                                )}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <Heart className={cn(
                                    "h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 transition-all duration-300",
                                    isLiked && "fill-current scale-110"
                                )} />
                                <span className="hidden sm:inline">{isLiked ? "Liked" : "Like"}</span>
                            </motion.button>
                            <motion.button
                                onClick={() => setShowPlaylistModal(true)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1 sm:gap-1.5 lg:gap-2",
                                    "py-1.5 sm:py-2",
                                    "text-white/50 hover:text-white",
                                    "text-[9px] sm:text-[10px] lg:text-xs font-medium",
                                    "hover:bg-white/5 rounded-lg sm:rounded-xl transition-all duration-300"
                                )}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <ListPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4" />
                                <span className="hidden sm:inline">Add to Playlist</span>
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Add to Playlist Modal */}
            <AddToPlaylistModal
                track={currentTrack}
                isOpen={showPlaylistModal}
                onClose={() => setShowPlaylistModal(false)}
            />
        </>
    );
};

export default AudioPlayer;
