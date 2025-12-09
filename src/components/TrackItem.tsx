"use client";

import { Icon } from './Icon';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites } from '@/context/FavoritesContext';

interface TrackItemProps {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration?: string;
}

export default function TrackItem({ id, title, artist, thumbnail, duration }: TrackItemProps) {
    const { playTrack, addToQueue, currentTrack, isPlaying } = usePlayer();
    const { isFavorite, toggleFavorite } = useFavorites();
    const isCurrentTrack = currentTrack?.id === id;
    const isLiked = isFavorite(id);

    const handlePlay = () => {
        playTrack({ id, title, artist, thumbnail, duration });
    };

    const handleAddToQueue = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToQueue({ id, title, artist, thumbnail, duration });
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite({ id, title, artist, thumbnail, duration });
    };

    return (
        <div
            onClick={handlePlay}
            className={`flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/10 ${isCurrentTrack ? 'bg-white/5 border-green-500/30' : ''}`}
        >
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden relative shadow-md flex-shrink-0 bg-gray-800">
                    <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isCurrentTrack && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        {isCurrentTrack && isPlaying ? (
                            <div className="flex items-center space-x-0.5">
                                <div className="w-0.5 h-3 bg-green-400 animate-pulse"></div>
                                <div className="w-0.5 h-4 bg-green-400 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-0.5 h-2 bg-green-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        ) : (
                            <Icon name="play" size={16} fill className="text-white" />
                        )}
                    </div>
                </div>
                <div className="min-w-0">
                    <h4 className={`font-medium text-sm transition-colors truncate pr-4 ${isCurrentTrack ? 'text-green-400' : 'text-white group-hover:text-green-400'}`}>
                        {title}
                    </h4>
                    <p className="text-gray-500 text-xs truncate">{artist}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4 pr-2">
                <span className="text-gray-500 text-xs font-mono">{duration || "3:00"}</span>
                <button
                    onClick={handleAddToQueue}
                    className="text-gray-500 hover:text-white hover:scale-110 transform transition-all opacity-0 group-hover:opacity-100"
                    title="Add to queue"
                >
                    <Icon name="queue" size={14} />
                </button>
                <button
                    onClick={handleToggleFavorite}
                    className={`hover:scale-110 transform transition-all ${isLiked
                            ? 'text-pink-500'
                            : 'text-gray-500 hover:text-pink-400 opacity-0 group-hover:opacity-100'
                        }`}
                    title={isLiked ? "Remove from Favorites" : "Add to Favorites"}
                >
                    <Icon name="heart" size={16} fill={isLiked} />
                </button>
            </div>
        </div>
    );
}
