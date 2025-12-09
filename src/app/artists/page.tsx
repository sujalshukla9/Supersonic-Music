"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';
import { useRouter } from 'next/navigation';
import { getTopArtists, TopArtist, REGIONS, RegionCode } from '@/lib/youtube';

export default function ArtistsPage() {
    const router = useRouter();
    const [artists, setArtists] = useState<TopArtist[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<RegionCode>("IN");
    const [isLoading, setIsLoading] = useState(true);

    // Load artists when region changes
    useEffect(() => {
        const loadArtists = async () => {
            setIsLoading(true);
            try {
                const loadedArtists = await getTopArtists(selectedRegion);
                setArtists(loadedArtists);
            } catch (error) {
                console.error("Failed to load artists:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadArtists();
    }, [selectedRegion]);

    const handleArtistClick = (artist: TopArtist) => {
        router.push(`/search?q=${encodeURIComponent(artist.name + " songs")}`);
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Top Artists</h1>
                    <p className="text-gray-500 text-sm mt-1">Discover popular artists from around the world</p>
                </div>
            </div>

            {/* Region Selector */}
            <div className="flex gap-3 flex-wrap">
                {REGIONS.map((region) => (
                    <button
                        key={region.code}
                        onClick={() => setSelectedRegion(region.code)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${selectedRegion === region.code
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 scale-105"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                            }`}
                    >
                        <span className="text-lg">{region.flag}</span>
                        <span>{region.name}</span>
                    </button>
                ))}
            </div>

            {/* Artists Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center p-4 rounded-3xl animate-pulse">
                            <div className="w-32 h-32 rounded-full bg-white/5 mb-4" />
                            <div className="h-4 bg-white/5 rounded w-24 mb-2" />
                            <div className="h-3 bg-white/5 rounded w-16" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {artists.map((artist, i) => (
                        <div
                            key={artist.id}
                            onClick={() => handleArtistClick(artist)}
                            className="flex flex-col items-center group cursor-pointer p-4 rounded-3xl hover:bg-white/5 transition-all hover:scale-105"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            {/* Artist Avatar */}
                            <div className="relative mb-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-transparent group-hover:border-green-500 transition-all shadow-xl ring-1 ring-white/10 group-hover:shadow-green-500/20">
                                    <img
                                        src={artist.image}
                                        alt={artist.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=6b21a8&color=fff&size=300`;
                                        }}
                                    />
                                </div>

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg transform transition-all hover:scale-110">
                                        <Icon name="play" size={20} fill className="text-black ml-0.5" />
                                    </div>
                                </div>

                                {/* Verified Badge (for top artists) */}
                                {i < 3 && (
                                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#090910] shadow-lg">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Artist Info */}
                            <h3 className="text-white font-semibold group-hover:text-green-400 transition-colors text-center">
                                {artist.name}
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">{artist.subscribers} followers</p>
                            <p className="text-gray-600 text-xs mt-0.5">{artist.videoCount}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && artists.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                        <Icon name="music" size={36} className="text-purple-500/50" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">No artists found</h3>
                    <p className="text-gray-500 text-sm max-w-sm">
                        We couldn't find any artists for this region. Try selecting a different region above.
                    </p>
                </div>
            )}
        </div>
    );
}
