"use client";
import { Icon } from './Icon';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites } from '@/context/FavoritesContext';

function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MusicPlayer() {
    const {
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        isLoading,
        isShuffle,
        isLoop,
        togglePlay,
        seek,
        setVolume,
        nextTrack,
        prevTrack,
        toggleShuffle,
        toggleLoop,
    } = usePlayer();

    const { isFavorite, toggleFavorite } = useFavorites();
    const isLiked = currentTrack ? isFavorite(currentTrack.id) : false;

    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const newTime = percent * duration;
        if (isFinite(newTime)) {
            seek(newTime);
        }
    };

    const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        setVolume(Math.max(0, Math.min(1, percent)));
    };

    const handleToggleFavorite = () => {
        if (currentTrack) {
            toggleFavorite(currentTrack);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 h-24 glass-panel border-t border-white/5 z-50 flex items-center px-8 justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] bg-[#050511]/80">
            {/* Track Info */}
            <div className="flex items-center space-x-4 w-[280px]">
                <div className="w-14 h-14 rounded-lg overflow-hidden shadow-lg relative group cursor-pointer bg-gray-800 flex-shrink-0">
                    {currentTrack?.thumbnail ? (
                        <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                            <Icon name="playlist" size={24} className="text-white/50" />
                        </div>
                    )}
                    {isLoading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="text-white font-bold text-sm tracking-wide hover:text-[#00f0ff] cursor-pointer transition-colors truncate">
                        {currentTrack?.title || "No track playing"}
                    </h4>
                    <p className="text-gray-500 text-xs mt-1 hover:text-white cursor-pointer transition-colors truncate">
                        {currentTrack?.artist || "Select a song to play"}
                    </p>
                </div>
                {currentTrack && (
                    <button
                        onClick={handleToggleFavorite}
                        className={`transition-colors ml-2 flex-shrink-0 hover:scale-110 ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'
                            }`}
                        title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
                    >
                        <Icon name="heart" size={18} fill={isLiked} />
                    </button>
                )}
            </div>

            {/* Controls & Progress */}
            <div className="flex flex-col items-center flex-1 max-w-xl mx-4">
                <div className="flex items-center space-x-6 mb-3">
                    <button
                        onClick={toggleShuffle}
                        className={`transition-all hover:scale-110 ${isShuffle ? 'text-[#00f0ff]' : 'text-gray-500 hover:text-white'}`}
                        title="Shuffle"
                    >
                        <Icon name="shuffle" size={16} />
                    </button>
                    <button
                        onClick={prevTrack}
                        className="text-gray-300 hover:text-[#00f0ff] transition-colors hover:scale-110"
                        title="Previous"
                    >
                        <Icon name="prev" size={22} />
                    </button>
                    <button
                        onClick={togglePlay}
                        disabled={!currentTrack}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : isPlaying ? (
                            <Icon name="pause" size={22} fill />
                        ) : (
                            <Icon name="play" size={22} fill className="translate-x-0.5" />
                        )}
                    </button>
                    <button
                        onClick={nextTrack}
                        className="text-gray-300 hover:text-[#00f0ff] transition-colors hover:scale-110"
                        title="Next"
                    >
                        <Icon name="next" size={22} />
                    </button>
                    <button
                        onClick={toggleLoop}
                        className={`transition-all hover:scale-110 ${isLoop ? 'text-[#00f0ff]' : 'text-gray-500 hover:text-white'}`}
                        title="Loop"
                    >
                        <Icon name="loop" size={16} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full flex items-center space-x-3 text-[10px] text-gray-500 font-medium font-mono">
                    <span className="w-10 text-right">{formatTime(progress)}</span>
                    <div
                        className="flex-1 h-1.5 bg-white/10 rounded-full relative cursor-pointer group"
                        onClick={handleSeek}
                    >
                        {/* Progress */}
                        <div
                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#00f0ff] to-[#9d00ff] rounded-full transition-all duration-100 group-hover:shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                        {/* Seek Thumb */}
                        <div
                            className="absolute top-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-opacity pointer-events-none"
                            style={{
                                left: `${Math.min(progressPercent, 100)}%`,
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    </div>
                    <span className="w-10">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume & Extras */}
            <div className="flex items-center justify-end space-x-5 w-[280px]">
                <button
                    className="text-gray-500 hover:text-white hover:scale-110 transition-all"
                    title="Queue"
                >
                    <Icon name="queue" size={18} />
                </button>

                {/* Volume Control */}
                <div className="flex items-center space-x-3 w-28 group">
                    <button
                        onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                        className="text-gray-500 group-hover:text-white transition-colors"
                        title={volume > 0 ? "Mute" : "Unmute"}
                    >
                        <Icon name="volume" size={18} />
                    </button>
                    <div
                        className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden relative group"
                        onClick={handleVolumeChange}
                    >
                        <div
                            className="absolute inset-y-0 left-0 bg-gray-500 group-hover:bg-[#00f0ff] transition-colors rounded-full"
                            style={{ width: `${volume * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
