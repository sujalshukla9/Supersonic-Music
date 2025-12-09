"use client";

import { useParams, useRouter } from "next/navigation";
import { usePlaylist } from "@/context/PlaylistContext";
import { usePlayer } from "@/context/PlayerContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Icon } from "@/components/Icon";
import { useState } from "react";

export default function PlaylistPage() {
    const params = useParams();
    const router = useRouter();
    const playlistId = params.id as string;
    const { getPlaylist, removeFromPlaylist, deletePlaylist } = usePlaylist();
    const { playTrack, setQueue, currentTrack, isPlaying } = usePlayer();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const playlist = getPlaylist(playlistId);

    if (!playlist) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <div className="w-20 h-20 rounded-full bg-purple-900/20 flex items-center justify-center mb-4">
                    <Icon name="music" size={40} className="text-purple-500/50" />
                </div>
                <h2 className="text-white font-bold text-xl mb-2">Playlist not found</h2>
                <p className="text-gray-500 text-sm mb-6">This playlist may have been deleted</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium text-sm hover:bg-purple-500 transition-colors"
                >
                    Go Home
                </button>
            </div>
        );
    }

    const handlePlayAll = () => {
        if (playlist.tracks.length > 0) {
            setQueue(playlist.tracks);
            playTrack(playlist.tracks[0]);
        }
    };

    const handlePlayTrack = (trackIndex: number) => {
        setQueue(playlist.tracks);
        playTrack(playlist.tracks[trackIndex]);
    };

    const handleRemoveTrack = (trackId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        removeFromPlaylist(playlistId, trackId);
    };

    const handleDeletePlaylist = () => {
        deletePlaylist(playlistId);
        router.push('/');
    };

    return (
        <div className="pb-10">
            {/* Header */}
            <div className="flex items-start space-x-6 mb-8">
                {/* Playlist Cover */}
                <div className={`w-48 h-48 rounded-3xl bg-gradient-to-br ${playlist.color} flex items-center justify-center shadow-xl flex-shrink-0`}>
                    <Icon name="music" size={64} className="text-white/60" />
                </div>

                {/* Playlist Info */}
                <div className="flex-1 pt-4">
                    <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">Playlist</span>
                    <h1 className="text-4xl font-bold text-white mt-1 mb-3">{playlist.name}</h1>
                    <p className="text-gray-400 text-sm mb-6">{playlist.tracks.length} tracks</p>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handlePlayAll}
                            disabled={playlist.tracks.length === 0}
                            className="bg-purple-600 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:bg-purple-500 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <Icon name="play" size={16} fill />
                            <span>Play All</span>
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-gray-400 hover:text-red-400 transition-colors p-3"
                            title="Delete Playlist"
                        >
                            <Icon name="plus" size={20} className="rotate-45" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Track List */}
            {playlist.tracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-900/20 flex items-center justify-center mb-4">
                        <Icon name="music" size={28} className="text-purple-500/50" />
                    </div>
                    <h3 className="text-white/60 font-medium text-lg mb-2">No tracks yet</h3>
                    <p className="text-gray-500 text-sm max-w-xs">
                        Add songs to this playlist from the trending section or search results
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {playlist.tracks.map((track, index) => {
                        const isCurrentTrack = currentTrack?.id === track.id;

                        return (
                            <div
                                key={track.id}
                                onClick={() => handlePlayTrack(index)}
                                className={`flex items-center p-3 rounded-2xl transition-all cursor-pointer group ${isCurrentTrack
                                    ? 'bg-purple-600/20 border border-purple-500/30'
                                    : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                {/* Track Number */}
                                <span className={`w-8 text-center text-sm font-medium ${isCurrentTrack ? 'text-purple-400' : 'text-gray-500'}`}>
                                    {isCurrentTrack && isPlaying ? (
                                        <div className="flex justify-center space-x-0.5">
                                            <span className="w-0.5 h-3 bg-purple-400 animate-pulse rounded-full"></span>
                                            <span className="w-0.5 h-4 bg-purple-400 animate-pulse rounded-full" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-0.5 h-2 bg-purple-400 animate-pulse rounded-full" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    ) : (
                                        index + 1
                                    )}
                                </span>

                                {/* Thumbnail */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden mx-4 flex-shrink-0">
                                    <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                                </div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-semibold text-sm truncate ${isCurrentTrack ? 'text-purple-400' : 'text-white'}`}>
                                        {track.title}
                                    </h4>
                                    <p className="text-gray-500 text-xs truncate">{track.artist}</p>
                                </div>

                                {/* Duration */}
                                <span className="text-gray-500 text-xs font-medium px-4">
                                    {track.duration || "3:20"}
                                </span>

                                {/* Favorite Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(track);
                                    }}
                                    className={`p-2 transition-colors ${isFavorite(track.id)
                                            ? 'text-pink-500'
                                            : 'text-gray-600 hover:text-pink-400 opacity-0 group-hover:opacity-100'
                                        }`}
                                    title={isFavorite(track.id) ? "Remove from Favorites" : "Add to Favorites"}
                                >
                                    <Icon name="heart" size={16} fill={isFavorite(track.id)} />
                                </button>

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => handleRemoveTrack(track.id, e)}
                                    className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                    title="Remove from playlist"
                                >
                                    <Icon name="plus" size={16} className="rotate-45" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <>
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={() => setShowDeleteConfirm(false)}
                    />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#1a1a24] rounded-2xl p-6 z-50 shadow-2xl border border-white/10">
                        <h3 className="text-white font-bold text-lg mb-2">Delete Playlist?</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Are you sure you want to delete "{playlist.name}"? This action cannot be undone.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 bg-white/10 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePlaylist}
                                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
