"use client";

import { useState } from 'react';
import { Icon } from './Icon';
import { usePlaylist } from '@/context/PlaylistContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Track {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration?: string;
}

interface AddToPlaylistModalProps {
    track: Track;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddToPlaylistModal({ track, isOpen, onClose }: AddToPlaylistModalProps) {
    const { playlists, addToPlaylist, createPlaylist, isTrackInPlaylist } = usePlaylist();
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [addedTo, setAddedTo] = useState<string | null>(null);

    const handleAddToPlaylist = (playlistId: string) => {
        addToPlaylist(playlistId, track);
        setAddedTo(playlistId);
        setTimeout(() => {
            setAddedTo(null);
            onClose();
        }, 800);
    };

    const handleCreatePlaylist = () => {
        if (newPlaylistName.trim()) {
            const newPlaylist = createPlaylist(newPlaylistName);
            addToPlaylist(newPlaylist.id, track);
            setNewPlaylistName('');
            setIsCreating(false);
            setAddedTo(newPlaylist.id);
            setTimeout(() => {
                setAddedTo(null);
                onClose();
            }, 800);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#1a1a24] rounded-3xl p-6 z-50 shadow-2xl border border-white/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-white font-bold text-xl">Add to Playlist</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors p-1"
                            >
                                <Icon name="plus" size={20} className="rotate-45" />
                            </button>
                        </div>

                        {/* Track Preview */}
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl mb-6">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold text-sm truncate">{track.title}</h4>
                                <p className="text-gray-500 text-xs truncate">{track.artist}</p>
                            </div>
                        </div>

                        {/* Create New Playlist */}
                        {isCreating ? (
                            <div className="mb-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        placeholder="Playlist name..."
                                        autoFocus
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleCreatePlaylist();
                                            if (e.key === 'Escape') setIsCreating(false);
                                        }}
                                    />
                                    <button
                                        onClick={handleCreatePlaylist}
                                        className="bg-purple-600 text-white px-4 py-3 rounded-xl font-medium text-sm hover:bg-purple-500 transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-purple-500/50 transition-all mb-4"
                            >
                                <Icon name="plus" size={18} />
                                <span className="text-sm font-medium">Create New Playlist</span>
                            </button>
                        )}

                        {/* Playlist List */}
                        <div className="space-y-2 max-h-[250px] overflow-y-auto no-scrollbar">
                            {playlists.map((playlist) => {
                                const isInPlaylist = isTrackInPlaylist(playlist.id, track.id);
                                const justAdded = addedTo === playlist.id;

                                return (
                                    <button
                                        key={playlist.id}
                                        onClick={() => !isInPlaylist && handleAddToPlaylist(playlist.id)}
                                        disabled={isInPlaylist}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${isInPlaylist
                                                ? 'bg-purple-600/20 cursor-default'
                                                : 'hover:bg-white/5 cursor-pointer'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${playlist.color} flex items-center justify-center flex-shrink-0`}>
                                            <Icon name="music" size={16} className="text-white/80" />
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <h4 className="text-white font-medium text-sm truncate">{playlist.name}</h4>
                                            <p className="text-gray-500 text-xs">{playlist.tracks.length} tracks</p>
                                        </div>
                                        {isInPlaylist && (
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${justAdded ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {justAdded ? 'Added!' : 'Added'}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
