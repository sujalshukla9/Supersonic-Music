"use client";

import { Icon } from '@/components/Icon';
import { useRouter } from 'next/navigation';

export default function MyMusicPage() {
    const router = useRouter();

    return (
        <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-2 ring-1 ring-white/10">
                <Icon name="folder" size={40} className="text-[#00f0ff]" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Your Library is Empty</h2>
                <p className="text-gray-400 max-w-xs mx-auto text-sm leading-relaxed">
                    Songs you upload or download will appear here.
                </p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={() => router.push('/genres')}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium transition-all hover:scale-105 hover:shadow-lg"
                >
                    Explore Music
                </button>
                <button className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5 hover:border-[#00f0ff]/50">
                    Upload Music
                </button>
            </div>
        </div>
    );
}
