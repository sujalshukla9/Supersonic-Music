"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMusic, BoxMusicTrack } from "@/lib/youtube";
import { Icon } from "@/components/Icon";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import AddToPlaylistModal from "@/components/AddToPlaylistModal";

function SearchContent() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';
    const [results, setResults] = useState<BoxMusicTrack[]>([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, setQueue, currentTrack, isPlaying, addToQueue } = usePlayer();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [selectedTrack, setSelectedTrack] = useState<BoxMusicTrack | null>(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    useEffect(() => {
        async function fetchResults() {
            setLoading(true);
            const data = await searchMusic(q);
            setResults(data);
            setLoading(false);
        }
        if (q) {
            fetchResults();
        }
    }, [q]);

    const handlePlayTrack = (track: BoxMusicTrack, index: number) => {
        const queueTracks = results.map(t => ({
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

    const handleAddToPlaylist = (track: BoxMusicTrack, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedTrack(track);
        setShowPlaylistModal(true);
    };

    return (
        <>
            <div className="space-y-8 pb-10">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                        Results for <span className="text-green-400">"{q}"</span>
                    </h2>
                    {!loading && results.length > 0 && (
                        <p className="text-gray-500 text-sm mt-1">{results.length} tracks found</p>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-400">Searching...</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Icon name="search" size={32} className="text-gray-500" />
                        </div>
                        <h3 className="text-white font-semibold mb-2">No results found</h3>
                        <p className="text-gray-500 text-sm max-w-xs">
                            Try searching for a different song, artist, or album
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-1">
                        {results.map((track, index) => {
                            const isCurrentTrack = currentTrack?.id === track.id;
                            const isLiked = isFavorite(track.id);

                            return (
                                <div
                                    key={track.id}
                                    onClick={() => handlePlayTrack(track, index)}
                                    className={`
                                        group relative flex items-center gap-4 p-3 rounded-xl cursor-pointer
                                        transition-all duration-300 ease-out animate-fade-in
                                        ${isCurrentTrack
                                            ? "bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30"
                                            : "hover:bg-white/5 border border-transparent hover:border-white/10"
                                        }
                                    `}
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    {/* Now Playing Indicator */}
                                    {isCurrentTrack && isPlaying && (
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full animate-pulse" />
                                    )}

                                    {/* Thumbnail */}
                                    <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow">
                                        <img
                                            src={track.thumbnail}
                                            alt={track.title}
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
                                                    <div className="w-1 h-3 bg-green-400 rounded-full animate-[bounce_1s_infinite_0ms]" />
                                                    <div className="w-1 h-4 bg-green-400 rounded-full animate-[bounce_1s_infinite_100ms]" />
                                                    <div className="w-1 h-2 bg-green-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
                                                    <div className="w-1 h-3 bg-green-400 rounded-full animate-[bounce_1s_infinite_150ms]" />
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
                                            {track.title}
                                        </h4>
                                        <p className="text-gray-400 text-xs truncate mt-0.5">
                                            {track.artist}
                                        </p>
                                    </div>

                                    {/* Right Side Actions */}
                                    <div className="flex items-center gap-2">
                                        {/* Favorite Button */}
                                        <button
                                            onClick={(e) => handleToggleFavorite(track, e)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${isLiked
                                                    ? 'text-pink-500 bg-pink-500/10'
                                                    : 'text-gray-400 bg-white/10 hover:bg-white/20 hover:text-pink-400 opacity-0 group-hover:opacity-100'
                                                }`}
                                            title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
                                        >
                                            <Icon name="heart" size={14} fill={isLiked} />
                                        </button>

                                        {/* Add to Playlist */}
                                        <button
                                            onClick={(e) => handleAddToPlaylist(track, e)}
                                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                                            title="Add to Playlist"
                                        >
                                            <Icon name="plus" size={14} />
                                        </button>

                                        {/* Add to Queue */}
                                        <button
                                            onClick={(e) => handleAddToQueue(track, e)}
                                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 hover:text-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
                                            title="Add to Queue"
                                        >
                                            <Icon name="queue" size={14} />
                                        </button>
                                    </div>

                                    {/* Duration */}
                                    <span className="text-gray-500 text-xs font-medium min-w-[40px] text-right">
                                        {track.duration || "3:20"}
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
                        })}
                    </div>
                )}
            </div>

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

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="text-white">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
