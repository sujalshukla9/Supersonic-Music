"use client";

import React from "react";
import { Icon } from "./Icon";
import { usePlayer } from "@/context/PlayerContext";

type TrackProps = {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration?: string;
    onPlay?: (id: string) => void;
    showAddToPlaylist?: boolean;
    onAddToPlaylist?: (e: React.MouseEvent) => void;
};

const TrackCard: React.FC<TrackProps> = ({
    id,
    title,
    artist,
    thumbnail,
    duration,
    onPlay,
    showAddToPlaylist = true,
    onAddToPlaylist,
}) => {
    const { currentTrack, isPlaying, playTrack, addToQueue } = usePlayer();
    const isCurrentTrack = currentTrack?.id === id;

    const handlePlay = () => {
        if (onPlay) {
            onPlay(id);
        } else {
            playTrack({ id, title, artist, thumbnail, duration });
        }
    };

    const handleAddToQueue = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToQueue({ id, title, artist, thumbnail, duration });
    };

    return (
        <div
            onClick={handlePlay}
            className={`
        group relative flex items-center gap-4 p-3 rounded-xl cursor-pointer
        transition-all duration-300 ease-out
        ${isCurrentTrack
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 shadow-lg shadow-purple-500/10"
                    : "hover:bg-white/5 border border-transparent hover:border-white/10"
                }
      `}
        >
            {/* Track Number / Now Playing Indicator (optional) */}
            {isCurrentTrack && isPlaying && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full animate-pulse" />
            )}

            {/* Thumbnail */}
            <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Play Overlay */}
                <div
                    className={`
            absolute inset-0 flex items-center justify-center
            bg-black/50 backdrop-blur-sm transition-opacity duration-200
            ${isCurrentTrack && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
                >
                    {isCurrentTrack && isPlaying ? (
                        <div className="flex items-center justify-center gap-0.5">
                            <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_0ms]" />
                            <div className="w-1 h-4 bg-white rounded-full animate-[bounce_1s_infinite_100ms]" />
                            <div className="w-1 h-2 bg-white rounded-full animate-[bounce_1s_infinite_200ms]" />
                            <div className="w-1 h-3 bg-white rounded-full animate-[bounce_1s_infinite_150ms]" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                            <Icon name="play" size={18} fill className="text-black ml-0.5" />
                        </div>
                    )}
                </div>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0 pr-2">
                <h4
                    className={`
            font-semibold text-sm truncate transition-colors
            ${isCurrentTrack ? "text-green-400" : "text-white group-hover:text-white"}
          `}
                >
                    {title}
                </h4>
                <p className="text-gray-400 text-xs truncate mt-0.5">{artist}</p>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Add to Playlist */}
                {showAddToPlaylist && (
                    <button
                        onClick={(e) => onAddToPlaylist?.(e)}
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-all hover:scale-110"
                        title="Add to Playlist"
                    >
                        <Icon name="plus" size={14} />
                    </button>
                )}

                {/* Add to Queue */}
                <button
                    onClick={handleAddToQueue}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-all hover:scale-110"
                    title="Add to Queue"
                >
                    <Icon name="queue" size={14} />
                </button>
            </div>

            {/* Duration */}
            <span className="text-gray-500 text-xs font-medium min-w-[40px] text-right">
                {duration || "3:20"}
            </span>

            {/* More Options */}
            <button
                onClick={(e) => e.stopPropagation()}
                className="text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
            >
                <Icon name="more-vertical" size={16} />
            </button>
        </div>
    );
};

export default TrackCard;
