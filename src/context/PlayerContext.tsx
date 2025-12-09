"use client";

import { createContext, useContext, useState, useRef, ReactNode, useCallback, useEffect } from 'react';

interface Track {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration?: string;
}

interface RelatedTrack {
    videoId: string;
    title: string;
    thumbnail: string;
    channel: string;
    duration?: string;
}

interface PlayerContextType {
    currentTrack: Track | null;
    queue: Track[];
    recentlyPlayed: Track[];
    isPlaying: boolean;
    progress: number;
    duration: number;
    volume: number;
    isLoading: boolean;
    isShuffle: boolean;
    isLoop: boolean;
    isAutoPlay: boolean;
    playTrack: (track: Track) => void;
    addToQueue: (track: Track) => void;
    setQueue: (tracks: Track[]) => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    nextTrack: () => void;
    prevTrack: () => void;
    toggleShuffle: () => void;
    toggleLoop: () => void;
    toggleAutoPlay: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

const RECENTLY_PLAYED_KEY = 'supersonic-recently-played';
const AUTOPLAY_KEY = 'supersonic-autoplay';
const MAX_RECENT_TRACKS = 20;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [queue, setQueueState] = useState<Track[]>([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(0.7);
    const [isLoading, setIsLoading] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isLoop, setIsLoop] = useState(false);
    const [isAutoPlay, setIsAutoPlay] = useState(true); // Auto-play related songs by default
    const [isFetchingRelated, setIsFetchingRelated] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const handleNextTrackRef = useRef<() => void>(() => { });
    const fetchingRelatedRef = useRef(false); // Prevent duplicate fetches
    const queueRef = useRef<Track[]>([]); // Keep latest queue for callbacks

    // Keep queueRef in sync with queue state
    useEffect(() => {
        queueRef.current = queue;
    }, [queue]);

    // Load recently played from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(RECENTLY_PLAYED_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        setRecentlyPlayed(parsed);
                    }
                }
            } catch (error) {
                console.error('Failed to load recently played:', error);
            }
        }
    }, []);

    // Save recently played to localStorage when it changes
    useEffect(() => {
        if (typeof window !== 'undefined' && recentlyPlayed.length > 0) {
            try {
                localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(recentlyPlayed));
            } catch (error) {
                console.error('Failed to save recently played:', error);
            }
        }
    }, [recentlyPlayed]);

    // Add track to recently played
    const addToRecentlyPlayed = useCallback((track: Track) => {
        setRecentlyPlayed(prev => {
            // Remove if already exists
            const filtered = prev.filter(t => t.id !== track.id);
            // Add to beginning
            const updated = [track, ...filtered].slice(0, MAX_RECENT_TRACKS);
            return updated;
        });
    }, []);

    // Initialize audio element
    useEffect(() => {
        if (typeof window !== 'undefined' && !audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.volume = volume;

            audioRef.current.addEventListener('timeupdate', () => {
                if (audioRef.current) {
                    setProgress(audioRef.current.currentTime);
                }
            });

            audioRef.current.addEventListener('loadedmetadata', () => {
                if (audioRef.current) {
                    setDuration(audioRef.current.duration);
                }
            });

            audioRef.current.addEventListener('ended', () => {
                // Use the ref to always get the latest handleNextTrack
                handleNextTrackRef.current();
            });

            audioRef.current.addEventListener('play', () => setIsPlaying(true));
            audioRef.current.addEventListener('pause', () => setIsPlaying(false));
            audioRef.current.addEventListener('waiting', () => setIsLoading(true));
            audioRef.current.addEventListener('canplay', () => setIsLoading(false));
            audioRef.current.addEventListener('error', (e) => {
                const audio = e.target as HTMLAudioElement;
                const error = audio?.error;
                let errorMessage = 'Unknown audio error';

                if (error) {
                    switch (error.code) {
                        case MediaError.MEDIA_ERR_ABORTED:
                            errorMessage = 'Audio playback was aborted';
                            break;
                        case MediaError.MEDIA_ERR_NETWORK:
                            errorMessage = 'Network error while loading audio';
                            break;
                        case MediaError.MEDIA_ERR_DECODE:
                            errorMessage = 'Audio decoding error';
                            break;
                        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                            errorMessage = 'Audio format not supported or source unavailable. Make sure the backend server is running on port 5000.';
                            break;
                    }
                }

                console.error('Audio error:', errorMessage, error);
                setIsLoading(false);
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch related tracks from backend
    const fetchRelatedTracks = useCallback(async (videoId: string): Promise<Track[]> => {
        if (fetchingRelatedRef.current) return [];

        try {
            fetchingRelatedRef.current = true;
            setIsFetchingRelated(true);

            // Detect mood from title/artist of current track
            const currentTitle = currentTrack?.title?.toLowerCase() || '';
            const currentArtist = currentTrack?.artist?.toLowerCase() || '';
            const textToAnalyze = `${currentTitle} ${currentArtist}`;

            // Simple mood detection based on keywords
            let mode = 'default';
            if (/party|dance|club|remix|edm|bass|hype|pump/i.test(textToAnalyze)) {
                mode = 'party';
            } else if (/chill|lofi|relax|calm|peaceful|ambient|acoustic|soft/i.test(textToAnalyze)) {
                mode = 'chill';
            } else if (/love|romantic|heart|soul|ballad/i.test(textToAnalyze)) {
                mode = 'romantic';
            } else if (/workout|gym|energy|fast|intense/i.test(textToAnalyze)) {
                mode = 'workout';
            }

            console.log(`🎵 Fetching related tracks for "${currentTrack?.title}" with mode: ${mode}`);

            const response = await fetch(`${BACKEND_URL}/related?id=${videoId}&mode=${mode}`);

            if (!response.ok) {
                console.warn('Related endpoint failed, using fallback');
                return [];
            }

            const data = await response.json();

            if (data.related && data.related.length > 0) {
                const playedIds = new Set([...recentlyPlayed.map(t => t.id), videoId]);

                const relatedTracks: Track[] = data.related
                    .filter((r: RelatedTrack) => !playedIds.has(r.videoId))
                    .slice(0, 5)
                    .map((r: RelatedTrack) => ({
                        id: r.videoId,
                        title: r.title,
                        artist: r.channel,
                        thumbnail: r.thumbnail || `https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`,
                        duration: r.duration
                    }));

                console.log(`🎵 Found ${relatedTracks.length} related tracks`);
                return relatedTracks;
            }

            return [];
        } catch (error) {
            console.error('Failed to fetch related tracks:', error);
            return [];
        } finally {
            fetchingRelatedRef.current = false;
            setIsFetchingRelated(false);
        }
    }, [currentTrack, recentlyPlayed]);

    const handleNextTrack = useCallback(async () => {
        // Handle loop mode - replay current track
        if (isLoop && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            return;
        }

        // Use ref for latest queue value to avoid stale closure
        const currentQueue = queueRef.current;

        // If no queue, nothing to do
        if (currentQueue.length === 0) {
            console.log('🎵 No tracks in queue');
            return;
        }

        // Calculate next index
        let nextIndex: number;

        if (isShuffle) {
            // Random track from queue (avoid current if possible)
            if (currentQueue.length > 1) {
                const availableIndices = currentQueue.map((_, i) => i).filter(i => i !== currentIndex);
                nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            } else {
                nextIndex = 0;
            }
        } else {
            nextIndex = currentIndex + 1;
        }

        // Check if we've reached the end of the queue
        if (nextIndex >= currentQueue.length) {
            // Try to fetch related tracks if autoPlay is enabled
            if (isAutoPlay && currentTrack && !fetchingRelatedRef.current) {
                console.log('🎵 Queue exhausted, fetching related tracks...');
                setIsLoading(true);

                const relatedTracks = await fetchRelatedTracks(currentTrack.id);

                if (relatedTracks.length > 0) {
                    // Add related tracks to queue and play the first one
                    const newQueueLength = currentQueue.length;
                    setQueueState(prev => [...prev, ...relatedTracks]);
                    setCurrentIndex(newQueueLength); // Index of first new track
                    playTrackInternal(relatedTracks[0]);
                    return;
                } else {
                    console.log('🎵 No related tracks found, looping back');
                    setIsLoading(false);
                }
            }

            // Loop back to start of queue
            nextIndex = 0;
        }

        // Play the next track
        const nextTrackToPlay = currentQueue[nextIndex];
        if (nextTrackToPlay) {
            console.log(`🎵 Playing next track: ${nextTrackToPlay.title}`);
            setCurrentIndex(nextIndex);
            playTrackInternal(nextTrackToPlay);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIndex, isShuffle, isLoop, isAutoPlay, currentTrack, fetchRelatedTracks]);

    // Keep the ref updated with the latest handleNextTrack
    useEffect(() => {
        handleNextTrackRef.current = handleNextTrack;
    }, [handleNextTrack]);

    const playTrackInternal = async (track: Track) => {
        setIsLoading(true);
        setCurrentTrack(track);
        setProgress(0);
        setDuration(0);

        // Add to recently played
        addToRecentlyPlayed(track);

        try {
            const streamUrl = `http://localhost:5000/stream/${track.id}`;

            if (audioRef.current) {
                // Pause current playback first to prevent AbortError
                audioRef.current.pause();

                // Reset the audio element
                audioRef.current.currentTime = 0;
                audioRef.current.src = streamUrl;
                audioRef.current.volume = volume;

                // Load the new source
                audioRef.current.load();

                // Wait for the audio to be ready before playing
                await new Promise<void>((resolve, reject) => {
                    const audio = audioRef.current;
                    if (!audio) {
                        reject(new Error('Audio element not available'));
                        return;
                    }

                    const onCanPlay = () => {
                        audio.removeEventListener('canplay', onCanPlay);
                        audio.removeEventListener('error', onError);
                        resolve();
                    };

                    const onError = () => {
                        audio.removeEventListener('canplay', onCanPlay);
                        audio.removeEventListener('error', onError);
                        reject(new Error('Failed to load audio'));
                    };

                    audio.addEventListener('canplay', onCanPlay);
                    audio.addEventListener('error', onError);
                });

                // Now play - wrapped in try-catch for AbortError
                try {
                    await audioRef.current.play();
                } catch (playError) {
                    // Ignore AbortError - it's expected when rapidly switching tracks
                    if (playError instanceof Error && playError.name === 'AbortError') {
                        console.log('Play was interrupted - this is normal when switching tracks quickly');
                    } else {
                        throw playError;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to play track:', error);
            setIsLoading(false);
        }
    };

    const playTrack = useCallback((track: Track) => {
        // Use ref for latest queue value to avoid stale closure
        const currentQueue = queueRef.current;

        // Find track in current queue
        const existingIndex = currentQueue.findIndex(t => t.id === track.id);

        if (existingIndex !== -1) {
            // Track exists in queue, just update index
            setCurrentIndex(existingIndex);
        } else {
            // Track not in queue - add it and set as current
            const newIndex = currentQueue.length;
            setQueueState(prev => [...prev, track]);
            setCurrentIndex(newIndex);
        }

        playTrackInternal(track);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [volume, addToRecentlyPlayed]);

    const addToQueue = useCallback((track: Track) => {
        setQueueState(prev => [...prev, track]);
    }, []);

    const setQueue = useCallback((tracks: Track[]) => {
        setQueueState(tracks);
        // Reset current index when queue is set externally
        // The next playTrack call will set the correct index
    }, []);

    const togglePlay = useCallback(() => {
        if (!audioRef.current || !currentTrack) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch((error) => {
                // Ignore AbortError - it's expected when rapidly toggling
                if (error.name !== 'AbortError') {
                    console.error('Play error:', error);
                }
            });
        }
    }, [isPlaying, currentTrack]);

    const seek = useCallback((time: number) => {
        if (audioRef.current && isFinite(time)) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    }, []);

    const setVolume = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);
        if (audioRef.current) {
            audioRef.current.volume = clampedVolume;
        }
    }, []);

    const nextTrack = useCallback(() => {
        handleNextTrack();
    }, [handleNextTrack]);

    const prevTrack = useCallback(() => {
        if (queue.length === 0) return;

        // If more than 3 seconds in, restart current track
        if (progress > 3 && audioRef.current) {
            audioRef.current.currentTime = 0;
            return;
        }

        const prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
        setCurrentIndex(prevIndex);
        const prevTrackItem = queue[prevIndex];
        if (prevTrackItem) {
            playTrackInternal(prevTrackItem);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queue, currentIndex, progress]);

    const toggleShuffle = useCallback(() => {
        setIsShuffle(prev => !prev);
    }, []);

    const toggleLoop = useCallback(() => {
        setIsLoop(prev => !prev);
    }, []);

    const toggleAutoPlay = useCallback(() => {
        setIsAutoPlay(prev => {
            const newValue = !prev;
            // Persist to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem(AUTOPLAY_KEY, JSON.stringify(newValue));
            }
            return newValue;
        });
    }, []);

    // Load autoplay setting from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(AUTOPLAY_KEY);
            if (stored !== null) {
                setIsAutoPlay(JSON.parse(stored));
            }
        }
    }, []);

    return (
        <PlayerContext.Provider
            value={{
                currentTrack,
                queue,
                recentlyPlayed,
                isPlaying,
                progress,
                duration,
                volume,
                isLoading,
                isShuffle,
                isLoop,
                isAutoPlay,
                playTrack,
                addToQueue,
                setQueue,
                togglePlay,
                seek,
                setVolume,
                nextTrack,
                prevTrack,
                toggleShuffle,
                toggleLoop,
                toggleAutoPlay,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}
