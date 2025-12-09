"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface Track {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration?: string;
}

interface FavoritesContextType {
    favorites: Track[];
    addToFavorites: (track: Track) => void;
    removeFromFavorites: (trackId: string) => void;
    isFavorite: (trackId: string) => boolean;
    toggleFavorite: (track: Track) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const FAVORITES_KEY = 'supersonic-favorites';

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<Track[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(FAVORITES_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        setFavorites(parsed);
                    }
                }
            } catch (error) {
                console.error('Failed to load favorites:', error);
            }
            setIsLoaded(true);
        }
    }, []);

    // Save favorites to localStorage when they change
    useEffect(() => {
        if (typeof window !== 'undefined' && isLoaded) {
            try {
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
            } catch (error) {
                console.error('Failed to save favorites:', error);
            }
        }
    }, [favorites, isLoaded]);

    const addToFavorites = useCallback((track: Track) => {
        setFavorites(prev => {
            if (prev.some(t => t.id === track.id)) {
                return prev;
            }
            return [track, ...prev];
        });
    }, []);

    const removeFromFavorites = useCallback((trackId: string) => {
        setFavorites(prev => prev.filter(t => t.id !== trackId));
    }, []);

    const isFavorite = useCallback((trackId: string): boolean => {
        return favorites.some(t => t.id === trackId);
    }, [favorites]);

    const toggleFavorite = useCallback((track: Track) => {
        if (favorites.some(t => t.id === track.id)) {
            removeFromFavorites(track.id);
        } else {
            addToFavorites(track);
        }
    }, [favorites, addToFavorites, removeFromFavorites]);

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addToFavorites,
                removeFromFavorites,
                isFavorite,
                toggleFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}
