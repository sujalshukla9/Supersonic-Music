"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface Track {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration?: string;
}

interface Playlist {
    id: string;
    name: string;
    color: string;
    tracks: Track[];
    createdAt: number;
}

interface PlaylistContextType {
    playlists: Playlist[];
    createPlaylist: (name: string, color?: string) => Playlist;
    deletePlaylist: (playlistId: string) => void;
    addToPlaylist: (playlistId: string, track: Track) => void;
    removeFromPlaylist: (playlistId: string, trackId: string) => void;
    getPlaylist: (playlistId: string) => Playlist | undefined;
    isTrackInPlaylist: (playlistId: string, trackId: string) => boolean;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

const PLAYLISTS_KEY = 'supersonic-playlists';

// Available gradient colors for playlists

const PLAYLIST_COLORS = [
    'from-purple-500 to-indigo-600',
    'from-pink-500 to-rose-500',
    'from-violet-600 to-purple-700',
    'from-blue-600 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-cyan-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
];

export function usePlaylist() {
    const context = useContext(PlaylistContext);
    if (!context) {
        throw new Error('usePlaylist must be used within a PlaylistProvider');
    }
    return context;
}

export function PlaylistProvider({ children }: { children: ReactNode }) {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load playlists from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(PLAYLISTS_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        setPlaylists(parsed);
                    }
                }
            } catch (error) {
                console.error('Failed to load playlists:', error);
            }
            setIsLoaded(true);
        }
    }, []);

    // Save playlists to localStorage when they change
    useEffect(() => {
        if (typeof window !== 'undefined' && isLoaded) {
            try {
                localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
            } catch (error) {
                console.error('Failed to save playlists:', error);
            }
        }
    }, [playlists, isLoaded]);

    const createPlaylist = useCallback((name: string, color?: string): Playlist => {
        const newPlaylist: Playlist = {
            id: `playlist-${Date.now()}`,
            name: name.trim() || 'New Playlist',
            color: color || PLAYLIST_COLORS[playlists.length % PLAYLIST_COLORS.length],
            tracks: [],
            createdAt: Date.now(),
        };
        setPlaylists(prev => [...prev, newPlaylist]);
        return newPlaylist;
    }, [playlists.length]);

    const deletePlaylist = useCallback((playlistId: string) => {
        setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    }, []);

    const addToPlaylist = useCallback((playlistId: string, track: Track) => {
        setPlaylists(prev => prev.map(playlist => {
            if (playlist.id === playlistId) {
                // Check if track already exists
                if (playlist.tracks.some(t => t.id === track.id)) {
                    return playlist;
                }
                return {
                    ...playlist,
                    tracks: [...playlist.tracks, track],
                };
            }
            return playlist;
        }));
    }, []);

    const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
        setPlaylists(prev => prev.map(playlist => {
            if (playlist.id === playlistId) {
                return {
                    ...playlist,
                    tracks: playlist.tracks.filter(t => t.id !== trackId),
                };
            }
            return playlist;
        }));
    }, []);

    const getPlaylist = useCallback((playlistId: string): Playlist | undefined => {
        return playlists.find(p => p.id === playlistId);
    }, [playlists]);

    const isTrackInPlaylist = useCallback((playlistId: string, trackId: string): boolean => {
        const playlist = playlists.find(p => p.id === playlistId);
        return playlist ? playlist.tracks.some(t => t.id === trackId) : false;
    }, [playlists]);

    return (
        <PlaylistContext.Provider
            value={{
                playlists,
                createPlaylist,
                deletePlaylist,
                addToPlaylist,
                removeFromPlaylist,
                getPlaylist,
                isTrackInPlaylist,
            }}
        >
            {children}
        </PlaylistContext.Provider>
    );
}
