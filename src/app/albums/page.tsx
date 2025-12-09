"use client";

import { Icon } from '@/components/Icon';
import { useRouter } from 'next/navigation';

const Albums = [
    { title: "After Hours", artist: "The Weeknd", color: "from-red-900 to-black" },
    { title: "Midnights", artist: "Taylor Swift", color: "from-blue-900 to-slate-900" },
    { title: "Equals", artist: "Ed Sheeran", color: "from-red-500 to-orange-500" },
    { title: "Justice", artist: "Justin Bieber", color: "from-green-500 to-teal-600" },
    { title: "Future Nostalgia", artist: "Dua Lipa", color: "from-purple-600 to-pink-600" },
    { title: "Planet Her", artist: "Doja Cat", color: "from-pink-500 to-rose-400" },
    { title: "Sour", artist: "Olivia Rodrigo", color: "from-violet-600 to-purple-800" },
    { title: "Happier Than Ever", artist: "Billie Eilish", color: "from-yellow-600 to-amber-700" },
    { title: "Divide", artist: "Ed Sheeran", color: "from-cyan-500 to-blue-600" },
    { title: "Purpose", artist: "Justin Bieber", color: "from-gray-700 to-gray-900" },
    { title: "Starboy", artist: "The Weeknd", color: "from-red-600 to-yellow-500" },
    { title: "30", artist: "Adele", color: "from-white/80 to-gray-400" },
];

export default function AlbumsPage() {
    const router = useRouter();

    const handleAlbumClick = (album: { title: string; artist: string }) => {
        router.push(`/search?q=${encodeURIComponent(`${album.title} ${album.artist}`)}`);
    };

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white">Albums</h1>
                <p className="text-gray-500 text-sm mt-1">Popular albums from top artists</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {Albums.map((album, i) => (
                    <div
                        key={i}
                        onClick={() => handleAlbumClick(album)}
                        className="group cursor-pointer"
                    >
                        <div className={`aspect-square rounded-[24px] bg-gradient-to-br ${album.color} mb-4 shadow-lg relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-300 ring-1 ring-white/10`}>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                    <Icon name="play" size={20} fill />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <Icon name="music" size={24} className="text-white/50 mb-2" />
                            </div>
                        </div>
                        <h3 className="text-white font-bold truncate group-hover:text-green-400 transition-colors">{album.title}</h3>
                        <p className="text-sm text-gray-500 truncate">{album.artist}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
