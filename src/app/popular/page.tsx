import { getTrendingMusic } from '@/lib/youtube';
import TrendingTracks from '@/components/TrendingTracks';

export const dynamic = 'force-dynamic';

export default async function PopularPage() {
    const trending = await getTrendingMusic();

    return (
        <div className="space-y-6 pb-12">
            <h1 className="text-3xl font-bold text-white tracking-wide">Popular</h1>
            <TrendingTracks tracks={trending} />
        </div>
    );
}
