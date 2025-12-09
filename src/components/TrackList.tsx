"use client";

import React, { useState } from "react";
import TrackCard from "./TrackCard";
import AddToPlaylistModal from "./AddToPlaylistModal";
import { usePlayer } from "@/context/PlayerContext";
import { BoxMusicTrack } from "@/lib/youtube";

type TrackListProps = {
    tracks: BoxMusicTrack[];
    onPlay?: (id: string) => void;
    showHeader?: boolean;
    title?: string;
};

const TrackList: React.FC<TrackListProps> = ({
    tracks,
    onPlay,
    showHeader = false,
    title = "Tracks",
}) => {
    const { setQueue, playTrack } = usePlayer();
    const [selectedTrack, setSelectedTrack] = useState<BoxMusicTrack | null>(null);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);

    const handlePlayTrack = (track: BoxMusicTrack, index: number) => {
        // Set the queue to all tracks starting from clicked one
        const queueTracks = tracks.map((t) => ({
            id: t.id,
            title: t.title,
            artist: t.artist,
            thumbnail: t.thumbnail,
            duration: t.duration,
        }));
        setQueue(queueTracks);

        // Play the selected track
        playTrack({
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

    if (tracks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <svg
                        className="w-8 h-8 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                    </svg>
                </div>
                <p className="text-gray-400 text-sm">No tracks available</p>
                <p className="text-gray-600 text-xs mt-1">Start by searching for music</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col space-y-1">
                {showHeader && (
                    <div className="flex items-center justify-between mb-4 px-3">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <span className="text-gray-500 text-xs">{tracks.length} songs</span>
                    </div>
                )}

                {/* Track List */}
                {tracks.map((track, index) => (
                    <div
                        key={track.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms` }}
                    >
                        <TrackCard
                            id={track.id}
                            title={track.title}
                            artist={track.artist}
                            thumbnail={track.thumbnail}
                            duration={track.duration}
                            onPlay={() => handlePlayTrack(track, index)}
                            showAddToPlaylist={true}
                            onAddToPlaylist={(e) => handleAddToPlaylist(track, e)}
                        />
                    </div>
                ))}
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
};

export default TrackList;
