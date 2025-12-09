import { getTrendingMusic } from '@/lib/youtube';
import TrendingTracks from '@/components/TrendingTracks';
import RecentlyPlayedSection from '@/components/RecentlyPlayedSection';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const trending = await getTrendingMusic();

  return (
    <div className="space-y-6 md:space-y-8 lg:space-y-10 pb-10">

      {/* Header */}
      <header className="flex items-center justify-between mb-2 animate-fade-in-down">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Home</h1>
      </header>

      {/* Hero Banner - Responsive */}
      <section className="w-full min-h-[200px] md:min-h-[280px] lg:h-[320px] rounded-2xl md:rounded-[32px] lg:rounded-[40px] bg-gradient-to-r from-[#c084fc] to-[#d946ef] relative overflow-hidden flex items-center px-5 py-6 md:px-8 md:py-8 lg:px-12 lg:py-10 shadow-xl animate-fade-in-up hover-lift">

        {/* Background Decoration - Animated */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute right-10 top-10 w-32 md:w-48 lg:w-64 h-32 md:h-48 lg:h-64 bg-white/10 blur-[40px] md:blur-[60px] rounded-full animate-float"></div>
          <div className="absolute left-10 bottom-10 w-24 md:w-32 lg:w-40 h-24 md:h-32 lg:h-40 bg-purple-900/10 blur-[30px] md:blur-[40px] rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 w-full max-w-xl space-y-3 md:space-y-4 lg:space-y-5">
          <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-white/80 animate-fade-in stagger-1">Supersonic Music</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-[1.1] tracking-tight animate-fade-in stagger-2">
            Listen to <br className="hidden sm:block" /> trending songs <br className="hidden md:block" /> all the time
          </h2>
          <p className="text-white/90 text-[11px] md:text-xs max-w-[200px] md:max-w-xs leading-relaxed font-medium animate-fade-in stagger-3">
            With Supersonic Music, you can get premium music for free anywhere and at any time.
          </p>
          <div className="pt-1 md:pt-2 animate-fade-in stagger-4">
            <Link
              href="/genres"
              className="inline-block bg-white text-purple-600 px-5 py-2 md:px-8 md:py-3 rounded-full font-bold text-xs md:text-sm shadow-lg hover:scale-105 active:scale-95 transition-all hover:bg-white/90 hover:shadow-xl"
            >
              Explore Now
            </Link>
          </div>
        </div>

        {/* Hero Image - Hidden on small mobile */}
        <div className="absolute right-0 bottom-0 top-0 w-[35%] md:w-[40%] lg:w-[45%] h-full hidden sm:block">
          <img
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80"
            className="absolute right-0 bottom-0 h-[115%] w-auto object-cover object-center"
            style={{ maskImage: 'linear-gradient(to left, black 60%, transparent 100%)' }}
            alt="Listening to music"
          />
        </div>
      </section>

      {/* Recently Played Section */}
      <div>
        <RecentlyPlayedSection />
      </div>

      {/* Trending Section */}
      <section className="animate-fade-in stagger-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-bold text-white">Trending in India</h2>
          <Link
            href="/popular"
            className="text-gray-500 hover:text-white transition-colors text-xs font-bold active:scale-95"
          >
            See More
          </Link>
        </div>
        <div className="rounded-2xl md:rounded-[32px] lg:rounded-[40px]">
          <TrendingTracks tracks={trending} />
        </div>
      </section>

    </div>
  );
}
