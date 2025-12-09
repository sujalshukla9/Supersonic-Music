"use client";

import React, { useState } from "react";
import { Icon } from "./Icon";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import { useSettings } from "@/context/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Repeat, Shuffle, Heart, ListPlus, VolumeX, Volume1, Volume2, MoreHorizontal, Radio } from "lucide-react";
import AddToPlaylistModal from "./AddToPlaylistModal";

function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const PlayerBar: React.FC = () => {
    const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const {
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        isLoading,
        isShuffle,
        isLoop,
        isAutoPlay,
        togglePlay,
        seek,
        setVolume,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleLoop,
        toggleAutoPlay,
    } = usePlayer();

    const { settings } = useSettings();
    const { isFavorite, toggleFavorite } = useFavorites();
    const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;

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

    const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const percent = (clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        if (isFinite(newTime)) {
            seek(newTime);
        }
    };

    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const percent = (clientX - rect.left) / rect.width;
        setVolume(Math.max(0, Math.min(1, percent)));
    };

    // Don't render on mobile - mobile nav handles that
    return (
        <>
            {/* Desktop/Tablet Player Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-20 md:h-24 z-50 hidden md:block xl:hidden animate-slide-up">
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-[#0a0a12]/95 to-[#0a0a12]/80 backdrop-blur-xl border-t border-white/5" />

                {/* Content */}
                <div className="relative h-full flex items-center px-4 md:px-6 gap-3 md:gap-4">
                    {/* Track Info - Left Side */}
                    <div className="flex items-center gap-3 md:gap-4 w-[200px] md:w-[280px] min-w-[150px] md:min-w-[200px]">
                        {/* Album Art */}
                        <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shadow-xl group cursor-pointer flex-shrink-0">
                            {currentTrack?.thumbnail ? (
                                <img
                                    src={currentTrack.thumbnail}
                                    alt={currentTrack.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center">
                                    <Icon name="playlist" size={20} className="text-white/60" />
                                </div>
                            )}

                            {/* Loading Overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                                    <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {/* Now Playing Animation */}
                            {isPlaying && !isLoading && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-0.5">
                                        <div className="w-0.5 h-3 bg-green-400 rounded-full animate-[bounce_1s_infinite]" />
                                        <div className="w-0.5 h-4 bg-green-400 rounded-full animate-[bounce_1s_infinite_100ms]" />
                                        <div className="w-0.5 h-2 bg-green-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="min-w-0 flex-1">
                            <h4 className="text-white font-semibold text-xs md:text-sm truncate hover:underline cursor-pointer transition-colors">
                                {currentTrack?.title || "No track playing"}
                            </h4>
                            <p className="text-gray-400 text-[10px] md:text-xs truncate hover:text-white cursor-pointer transition-colors mt-0.5">
                                {currentTrack?.artist || "Select a song to play"}
                            </p>
                        </div>

                        {/* Like Button - Hidden on smaller tablets */}
                        {currentTrack && (
                            <button className="w-7 h-7 md:w-8 md:h-8 hidden lg:flex items-center justify-center text-gray-400 hover:text-green-400 transition-all hover:scale-110 active:scale-95">
                                <Icon name="heart" size={16} />
                            </button>
                        )}
                    </div>

                    {/* Center Controls */}
                    <div className="flex-1 max-w-xl lg:max-w-2xl mx-auto flex flex-col items-center">
                        {/* Control Buttons */}
                        <div className="flex items-center gap-3 md:gap-5 mb-1.5 md:mb-2">
                            {/* Shuffle - Hidden on tablets */}
                            <button
                                onClick={toggleShuffle}
                                className={`w-7 h-7 md:w-8 md:h-8 hidden lg:flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${isShuffle
                                    ? "text-green-400"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                                title="Shuffle"
                            >
                                <Icon name="shuffle" size={14} />
                            </button>

                            {/* Previous */}
                            <button
                                onClick={prevTrack}
                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-300 hover:text-white transition-all hover:scale-110 active:scale-95"
                                title="Previous"
                            >
                                <Icon name="prev" size={18} />
                            </button>

                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                disabled={!currentTrack}
                                className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                title={isPlaying ? "Pause" : "Play"}
                            >
                                {isLoading ? (
                                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : isPlaying ? (
                                    <Icon name="pause" size={16} fill className="text-black" />
                                ) : (
                                    <Icon name="play" size={16} fill className="text-black ml-0.5" />
                                )}
                            </button>

                            {/* Next */}
                            <button
                                onClick={nextTrack}
                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-300 hover:text-white transition-all hover:scale-110 active:scale-95"
                                title="Next"
                            >
                                <Icon name="next" size={18} />
                            </button>

                            {/* Loop - Hidden on tablets */}
                            <button
                                onClick={toggleLoop}
                                className={`w-7 h-7 md:w-8 md:h-8 hidden lg:flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 ${isLoop
                                    ? "text-green-400"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                                title="Repeat"
                            >
                                <Icon name="loop" size={14} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full flex items-center gap-2 md:gap-3 text-[10px] md:text-[11px] text-gray-400 font-medium">
                            <span className="w-8 md:w-10 text-right">{formatTime(progress)}</span>
                            <div
                                className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer group relative"
                                onClick={handleSeek}
                            >
                                {/* Progress Fill */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 bg-white group-hover:bg-green-400 rounded-full transition-colors"
                                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                />
                                {/* Seek Thumb */}
                                <div
                                    className="absolute top-1/2 w-2.5 h-2.5 md:w-3 md:h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg transition-opacity"
                                    style={{
                                        left: `${Math.min(progressPercent, 100)}%`,
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            </div>
                            <span className="w-8 md:w-10">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Right Controls - Hidden on tablets */}
                    <div className="hidden lg:flex items-center gap-3 md:gap-4 w-[200px] md:w-[280px] min-w-[150px] md:min-w-[200px] justify-end">
                        {/* Queue */}
                        <button
                            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                            title="Queue"
                        >
                            <Icon name="queue" size={16} />
                        </button>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 group">
                            <button
                                onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                                className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors"
                                title={volume > 0 ? "Mute" : "Unmute"}
                            >
                                <Icon name="volume" size={16} />
                            </button>
                            <div
                                className="w-20 md:w-24 h-1 bg-white/20 rounded-full cursor-pointer group relative overflow-hidden"
                                onClick={handleVolumeChange}
                            >
                                <div
                                    className="absolute left-0 top-0 bottom-0 bg-gray-400 group-hover:bg-green-400 rounded-full transition-colors"
                                    style={{ width: `${volume * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Fullscreen */}
                        <button
                            className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:scale-110 active:scale-95"
                            title="Fullscreen"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Mini Player - Floating at bottom */}
            {currentTrack && (
                <>
                    <div
                        className="fixed bottom-4 left-4 right-4 h-16 z-40 md:hidden animate-slide-up"
                        onClick={() => setIsMobilePlayerOpen(true)}
                    >
                        <div className="relative h-full bg-[#1a1a24]/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer">
                            {/* Progress bar at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                                <div
                                    className="h-full bg-green-500 transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            <div className="flex items-center h-full px-3 gap-3">
                                {/* Album Art */}
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    <img
                                        src={currentTrack.thumbnail}
                                        alt={currentTrack.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {isPlaying && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="flex items-center gap-0.5">
                                                <div className="w-0.5 h-2 bg-green-400 rounded-full animate-[bounce_1s_infinite]" />
                                                <div className="w-0.5 h-3 bg-green-400 rounded-full animate-[bounce_1s_infinite_100ms]" />
                                                <div className="w-0.5 h-1.5 bg-green-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white text-xs font-semibold truncate">
                                        {currentTrack.title}
                                    </h4>
                                    <p className="text-gray-400 text-[10px] truncate">
                                        {currentTrack.artist}
                                    </p>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={handleToggleFavorite}
                                        className={`w-8 h-8 flex items-center justify-center active:scale-90 transition-all ${isLiked ? 'text-pink-500' : 'text-white/50'
                                            }`}
                                    >
                                        <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                                    </button>
                                    <button
                                        onClick={prevTrack}
                                        className="w-8 h-8 flex items-center justify-center text-white/70 active:scale-90"
                                    >
                                        <Icon name="prev" size={16} />
                                    </button>
                                    <button
                                        onClick={togglePlay}
                                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90"
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                        ) : isPlaying ? (
                                            <Icon name="pause" size={16} fill className="text-purple-700" />
                                        ) : (
                                            <Icon name="play" size={16} fill className="text-purple-700 ml-0.5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={nextTrack}
                                        className="w-8 h-8 flex items-center justify-center text-white/70 active:scale-90"
                                    >
                                        <Icon name="next" size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Full Screen Player Overlay */}
                    <AnimatePresence>
                        {isMobilePlayerOpen && (
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed inset-0 z-[100] bg-gradient-to-b from-[#1a1025] via-[#12121a] to-[#0a0a10] flex flex-col md:hidden"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-4 pt-12">
                                    <button
                                        onClick={() => setIsMobilePlayerOpen(false)}
                                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 active:scale-95 transition-transform"
                                    >
                                        <ChevronDown size={24} />
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Now Playing</span>
                                        {/* Quality Badge */}
                                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full mt-1 text-[9px] font-medium ${settings.audioQuality === 'lossless'
                                            ? "text-purple-400 bg-purple-500/10 border border-purple-500/30"
                                            : settings.audioQuality === 'high'
                                                ? "text-green-400 bg-green-500/10 border border-green-500/20"
                                                : "text-white/50 bg-white/5 border border-white/10"
                                            }`}>
                                            <span>{qualityInfo.label}</span>
                                            <span className="text-white/30">•</span>
                                            <span className="text-white/40">{qualityInfo.bitrate}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPlaylistModal(true)}
                                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 active:scale-95 transition-transform"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 flex flex-col items-center px-6 gap-6 overflow-y-auto pb-8">
                                    {/* Album Art */}
                                    <motion.div
                                        className="w-full max-w-[320px] aspect-square rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(88,28,135,0.3)] border border-white/10 relative mt-4"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                                    >
                                        <img
                                            src={currentTrack.thumbnail.replace('hqdefault', 'maxresdefault')}
                                            alt={currentTrack.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                if (img.src.includes('maxresdefault')) {
                                                    img.src = currentTrack.thumbnail;
                                                }
                                            }}
                                        />
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                        {/* Loading Overlay */}
                                        {isLoading && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                <div className="w-10 h-10 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}

                                        {/* Playing Animation */}
                                        {isPlaying && !isLoading && (
                                            <div className="absolute bottom-4 left-4 flex items-end gap-[3px]">
                                                {[0, 1, 2, 3].map((i) => (
                                                    <motion.span
                                                        key={i}
                                                        className="w-[3px] bg-gradient-to-t from-purple-400 to-fuchsia-400 rounded-full"
                                                        animate={{ height: ["8px", "20px", "12px", "18px", "8px"] }}
                                                        transition={{
                                                            duration: 0.8,
                                                            repeat: Infinity,
                                                            delay: i * 0.1,
                                                            ease: "easeInOut",
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Title Info */}
                                    <motion.div
                                        className="w-full text-center space-y-1 px-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h2 className="text-xl font-bold text-white truncate">
                                            {currentTrack.title}
                                        </h2>
                                        <p className="text-sm text-white/50 font-medium truncate">
                                            {currentTrack.artist}
                                        </p>
                                    </motion.div>

                                    {/* Progress Bar */}
                                    <motion.div
                                        className="w-full space-y-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <div
                                            className="relative h-2 bg-white/10 rounded-full cursor-pointer touch-none"
                                            onClick={handleSeek}
                                            onTouchMove={handleSeek}
                                        >
                                            {/* Progress Fill */}
                                            <div
                                                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 rounded-full"
                                                style={{ width: `${Math.min(progressPercent, 100)}%` }}
                                            />
                                            {/* Thumb */}
                                            <div
                                                className="absolute top-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                                                style={{
                                                    left: `${Math.min(progressPercent, 100)}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[11px] text-white/40 font-medium tabular-nums">
                                            <span>{formatTime(progress)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </motion.div>

                                    {/* Main Controls */}
                                    <motion.div
                                        className="flex items-center justify-between w-full max-w-[320px] py-2"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <button
                                            onClick={toggleShuffle}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${isShuffle ? 'text-purple-400 bg-purple-400/10' : 'text-white/40'
                                                }`}
                                        >
                                            <Shuffle size={20} />
                                        </button>
                                        <button
                                            onClick={prevTrack}
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                                        >
                                            <Icon name="prev" size={28} />
                                        </button>
                                        <button
                                            onClick={togglePlay}
                                            className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-90 transition-all ${isPlaying ? 'shadow-[0_0_40px_rgba(168,85,247,0.6)]' : ''
                                                }`}
                                        >
                                            {isLoading ? (
                                                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                            ) : isPlaying ? (
                                                <Icon name="pause" size={24} fill className="text-purple-700" />
                                            ) : (
                                                <Icon name="play" size={24} fill className="text-purple-700 ml-1" />
                                            )}
                                        </button>
                                        <button
                                            onClick={nextTrack}
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                                        >
                                            <Icon name="next" size={28} />
                                        </button>
                                        <button
                                            onClick={toggleLoop}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${isLoop ? 'text-purple-400 bg-purple-400/10' : 'text-white/40'
                                                }`}
                                        >
                                            <Repeat size={20} />
                                        </button>
                                    </motion.div>

                                    {/* AutoPlay Control */}
                                    <motion.div
                                        className="w-full flex items-center justify-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.32 }}
                                    >
                                        <button
                                            onClick={toggleAutoPlay}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 ${isAutoPlay
                                                    ? 'text-green-400 bg-green-400/10 border border-green-400/30'
                                                    : 'text-white/40 bg-white/5 border border-white/10'
                                                }`}
                                        >
                                            <Radio size={16} />
                                            <span className="text-xs font-medium">
                                                {isAutoPlay ? 'AutoPlay On' : 'AutoPlay Off'}
                                            </span>
                                        </button>
                                    </motion.div>

                                    {/* Volume Control */}
                                    <motion.div
                                        className="w-full flex items-center gap-3 px-2"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <button
                                            onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                                            className="w-8 h-8 flex items-center justify-center text-white/50 active:scale-90"
                                        >
                                            {volume === 0 ? (
                                                <VolumeX size={18} />
                                            ) : volume < 0.5 ? (
                                                <Volume1 size={18} />
                                            ) : (
                                                <Volume2 size={18} />
                                            )}
                                        </button>
                                        <div
                                            className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer relative"
                                            onClick={handleVolumeChange}
                                            onTouchMove={handleVolumeChange}
                                        >
                                            <div
                                                className="h-full bg-white/50 rounded-full transition-all"
                                                style={{ width: `${volume * 100}%` }}
                                            />
                                            <div
                                                className="absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-md"
                                                style={{
                                                    left: `${volume * 100}%`,
                                                    transform: 'translate(-50%, -50%)'
                                                }}
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Action Buttons */}
                                    <motion.div
                                        className="w-full flex items-center gap-3 mt-auto pt-4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <button
                                            onClick={handleToggleFavorite}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all active:scale-95 ${isLiked
                                                ? 'text-pink-500 bg-pink-500/15 border border-pink-500/20'
                                                : 'text-white/50 bg-white/5 border border-white/10 active:bg-white/10'
                                                }`}
                                        >
                                            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                                            <span className="text-sm font-medium">{isLiked ? 'Liked' : 'Like'}</span>
                                        </button>
                                        <button
                                            onClick={() => setShowPlaylistModal(true)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white/50 bg-white/5 border border-white/10 transition-all active:scale-95 active:bg-white/10"
                                        >
                                            <ListPlus size={18} />
                                            <span className="text-sm font-medium">Add to Playlist</span>
                                        </button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Add to Playlist Modal */}
                    {currentTrack && (
                        <AddToPlaylistModal
                            track={currentTrack}
                            isOpen={showPlaylistModal}
                            onClose={() => setShowPlaylistModal(false)}
                        />
                    )}
                </>
            )}
        </>
    );
};

export default PlayerBar;
