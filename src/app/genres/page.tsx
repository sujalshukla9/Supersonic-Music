"use client";

import { Icon } from '@/components/Icon';
import { useRouter } from 'next/navigation';

const Genres = [
    { name: "Electronic", gradient: "from-purple-600 to-indigo-600", query: "electronic music" },
    { name: "Pop", gradient: "from-pink-500 to-rose-500", query: "pop music hits" },
    { name: "Rock", gradient: "from-red-600 to-orange-600", query: "rock music" },
    { name: "Hip Hop", gradient: "from-blue-600 to-cyan-500", query: "hip hop music" },
    { name: "Jazz", gradient: "from-yellow-500 to-amber-600", query: "jazz music" },
    { name: "Classical", gradient: "from-emerald-500 to-teal-600", query: "classical music" },
    { name: "Indie", gradient: "from-fuchsia-600 to-pink-500", query: "indie music" },
    { name: "Alternative", gradient: "from-gray-600 to-gray-800", query: "alternative rock" },
    { name: "R&B", gradient: "from-violet-600 to-purple-700", query: "r&b music" },
    { name: "Country", gradient: "from-amber-500 to-orange-600", query: "country music" },
    { name: "Bollywood", gradient: "from-pink-600 to-red-500", query: "bollywood songs" },
    { name: "Punjabi", gradient: "from-orange-500 to-yellow-500", query: "punjabi songs" },
];

export default function GenresPage() {
    const router = useRouter();

    const handleGenreClick = (query: string) => {
        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-wide">Genres</h1>
                <p className="text-gray-500 text-sm mt-1">Browse music by genre</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Genres.map((genre) => (
                    <div
                        key={genre.name}
                        onClick={() => handleGenreClick(genre.query)}
                        className={`h-40 rounded-3xl bg-gradient-to-br ${genre.gradient} p-6 relative overflow-hidden group cursor-pointer shadow-lg hover:scale-105 transition-transform hover:shadow-2xl active:scale-100`}
                    >
                        <h3 className="text-2xl font-bold text-white relative z-10">{genre.name}</h3>
                        <p className="text-white/60 text-xs mt-1 relative z-10">Explore {genre.name}</p>
                        <div className="absolute -bottom-4 -right-4 text-white/10 group-hover:text-white/20 transition-colors rotate-12 scale-150">
                            <Icon name="genres" size={80} />
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-3xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}
