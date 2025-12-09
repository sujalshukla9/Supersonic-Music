"use client";

import { Icon } from '@/components/Icon';
import { useFavorites } from '@/context/FavoritesContext';
import { usePlayer } from '@/context/PlayerContext';
import Link from 'next/link';

export default function FavoritesPage() {
    const { favorites, removeFromFavorites } = useFavorites();
    const { playTrack, setQueue, currentTrack, isPlaying } = usePlayer();

    const handlePlayAll = () => {
        if (favorites.length > 0) {
            setQueue(favorites);
            playTrack(favorites[0]);
        }
    };

    const handlePlayTrack = (index: number) => {
        setQueue(favorites);
        playTrack(favorites[index]);
    };

    if (favorites.length === 0) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-2 ring-1 ring-white/10">
                    <Icon name="heart" size={40} className="text-[#a855f7]" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">No Favorites Yet</h2>
                    <p className="text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
                        Start listening and like songs with the <Icon name="heart" size={12} className="inline mx-1 text-[#a855f7]" /> icon to save them here.
                    </p>
                </div>
                <Link
                    href="/"
                    className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5 hover:border-[#a855f7]/50"
                >
                    Explore Music
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-start space-x-6 mb-8">
                {/* Playlist Cover */}
                <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-xl flex-shrink-0">
                    <Icon name="heart" size={64} className="text-white/80" />
                </div>

                {/* Playlist Info */}
                <div className="flex-1 pt-4">
                    <span className="text-pink-400 text-xs font-semibold uppercase tracking-wider">Playlist</span>
                    <h1 className="text-4xl font-bold text-white mt-1 mb-3">Liked Songs</h1>
                    <p className="text-gray-400 text-sm mb-6">{favorites.length} tracks</p>

                    <button
                        onClick={handlePlayAll}
                        className="bg-green-500 text-black px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-green-400 hover:scale-105 transition-all flex items-center space-x-2"
                    >
                        <Icon name="play" size={16} fill />
                        <span>Play All</span>
                    </button>
                </div>
            </div>

            {/* Track List */}
            <div className="space-y-1">
                {favorites.map((track, index) => {
                    const isCurrentTrack = currentTrack?.id === track.id;

                    return (
                        <div
                            key={track.id}
                            onClick={() => handlePlayTrack(index)}
                            className={`
                                group relative flex items-center gap-4 p-3 rounded-xl cursor-pointer
                                transition-all duration-300 ease-out
                                ${isCurrentTrack
                                    ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30"
                                    : "hover:bg-white/5 border border-transparent hover:border-white/10"
                                }
                            `}
                        >
                            {/* Track Number */}
                            <span className={`w-6 text-center text-sm font-medium ${isCurrentTrack ? 'text-green-400' : 'text-gray-500'}`}>
                                {isCurrentTrack && isPlaying ? (
                                    <div className="flex justify-center space-x-0.5">
                                        <span className="w-0.5 h-3 bg-green-400 animate-pulse rounded-full"></span>
                                        <span className="w-0.5 h-4 bg-green-400 animate-pulse rounded-full" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-0.5 h-2 bg-green-400 animate-pulse rounded-full" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                ) : (
                                    index + 1
                                )}
                            </span>

                            {/* Thumbnail */}
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                                <img
                                    src={track.thumbnail}
                                    alt={track.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div
                                    className={`
                                        absolute inset-0 flex items-center justify-center
                                        bg-black/50 transition-opacity duration-200
                                        ${isCurrentTrack && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                                    `}
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                                        <Icon name="play" size={14} fill className="text-black ml-0.5" />
                                    </div>
                                </div>
                            </div>

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-semibold text-sm truncate ${isCurrentTrack ? 'text-green-400' : 'text-white'}`}>
                                    {track.title}
                                </h4>
                                <p className="text-gray-500 text-xs truncate">{track.artist}</p>
                            </div>

                            {/* Duration */}
                            <span className="text-gray-500 text-xs font-medium px-4">
                                {track.duration || "3:20"}
                            </span>

                            {/* Remove Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromFavorites(track.id);
                                }}
                                className="text-pink-500 hover:text-pink-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                title="Remove from favorites"
                            >
                                <Icon name="heart" size={16} fill />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
