const API_KEY = 'AIzaSyD19rb22YPwhrDDv4-FqBY5DQRUPfs24fE';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface BoxMusicTrack {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration?: string;
}

// Fallback mock data - Real Indian trending songs with actual YouTube IDs
const MOCK_TRENDING: BoxMusicTrack[] = [
    { id: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/maxresdefault.jpg", duration: "4:28" },
    { id: "pJnXlVD0g60", title: "Tere Vaaste", artist: "Varun Jain & Sachin-Jigar", thumbnail: "https://i.ytimg.com/vi/pJnXlVD0g60/maxresdefault.jpg", duration: "4:15" },
    { id: "Ks1-lO7xk4I", title: "Tera Ban Jaunga", artist: "Akhil Sachdeva & Tulsi Kumar", thumbnail: "https://i.ytimg.com/vi/Ks1-lO7xk4I/maxresdefault.jpg", duration: "3:56" },
    { id: "tc2VgmomZ1M", title: "Maan Meri Jaan", artist: "King", thumbnail: "https://i.ytimg.com/vi/tc2VgmomZ1M/maxresdefault.jpg", duration: "3:18" },
    { id: "5Eqb_-j3FDA", title: "Pasoori", artist: "Ali Sethi & Shae Gill", thumbnail: "https://i.ytimg.com/vi/5Eqb_-j3FDA/maxresdefault.jpg", duration: "4:10" },
    { id: "vX2cDW5BHHM", title: "Excuses", artist: "AP Dhillon & Gurinder Gill", thumbnail: "https://i.ytimg.com/vi/vX2cDW5BHHM/maxresdefault.jpg", duration: "3:32" },
    { id: "nRVCd0WbBqY", title: "Apna Bana Le", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/nRVCd0WbBqY/maxresdefault.jpg", duration: "5:16" },
    { id: "IJq0yyWug1k", title: "Tum Hi Ho", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/IJq0yyWug1k/maxresdefault.jpg", duration: "4:22" },
    { id: "gvyUuxdRaSU", title: "Raataan Lambiyan", artist: "Jubin Nautiyal & Asees Kaur", thumbnail: "https://i.ytimg.com/vi/gvyUuxdRaSU/maxresdefault.jpg", duration: "3:50" },
    { id: "O5cI14iHcdo", title: "Chaleya", artist: "Arijit Singh & Shilpa Rao", thumbnail: "https://i.ytimg.com/vi/O5cI14iHcdo/maxresdefault.jpg", duration: "3:45" },
];

// Mock search data with real Indian songs
const MOCK_SEARCH: BoxMusicTrack[] = [
    { id: "r9fzYcbgIlY", title: "O Sajna", artist: "Badshah & Aastha Gill", thumbnail: "https://i.ytimg.com/vi/r9fzYcbgIlY/maxresdefault.jpg", duration: "3:28" },
    { id: "OvPXSoUdB6g", title: "Satranga", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/OvPXSoUdB6g/maxresdefault.jpg", duration: "4:12" },
    { id: "Q_5IQ9lbqHw", title: "Phir Aur Kya Chahiye", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/Q_5IQ9lbqHw/maxresdefault.jpg", duration: "4:35" },
    { id: "coSVBQlk5VM", title: "Brown Munde", artist: "AP Dhillon", thumbnail: "https://i.ytimg.com/vi/coSVBQlk5VM/maxresdefault.jpg", duration: "3:21" },
    { id: "VYrPN4CLWQA", title: "Kahani Suno 2.0", artist: "Kaifi Khalil", thumbnail: "https://i.ytimg.com/vi/VYrPN4CLWQA/maxresdefault.jpg", duration: "4:52" },
];

export async function getTrendingMusic(): Promise<BoxMusicTrack[]> {
    try {
        const res = await fetch(
            `${BASE_URL}/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&regionCode=IN&maxResults=10&key=${API_KEY}`,
            { cache: 'no-store' }
        );

        if (!res.ok) {
            console.warn("YouTube API unavailable, using mock data. Enable YouTube Data API v3 in Google Cloud Console.");
            return MOCK_TRENDING;
        }

        const data = await res.json();
        return data.items.map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.standard?.url || `https://i.ytimg.com/vi/${item.id}/maxresdefault.jpg`,
            duration: formatDuration(item.contentDetails.duration),
        }));
    } catch (error) {
        console.warn("Failed to fetch trending music, using mock data", error);
        return MOCK_TRENDING;
    }
}

export async function searchMusic(query: string): Promise<BoxMusicTrack[]> {
    try {
        const res = await fetch(
            `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&regionCode=IN&maxResults=15&key=${API_KEY}`
        );

        if (!res.ok) {
            console.warn("YouTube Search API unavailable, using mock data.");
            return MOCK_SEARCH.filter((t: BoxMusicTrack) =>
                t.title.toLowerCase().includes(query.toLowerCase()) ||
                t.artist.toLowerCase().includes(query.toLowerCase())
            );
        }

        const data = await res.json();
        return data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            artist: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.standard?.url || `https://i.ytimg.com/vi/${item.id.videoId}/maxresdefault.jpg`,
            duration: "3:00",
        }));
    } catch (error) {
        console.warn("Failed to search music, using mock data", error);
        return MOCK_SEARCH;
    }
}

function formatDuration(isoDuration: string): string {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "0:00";

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    let result = "";
    if (hours > 0) {
        result += hours + ":";
        result += minutes.toString().padStart(2, '0') + ":";
    } else {
        result += minutes + ":";
    }
    result += seconds.toString().padStart(2, '0');
    return result;
}

// Top Artist interface and data
export interface TopArtist {
    id: string;
    name: string;
    image: string;
    subscribers: string;
    videoCount: string;
}

// Region-based popular music artists - Using reliable image sources
const ARTISTS_BY_REGION: Record<string, TopArtist[]> = {
    IN: [
        { id: "UC0itlnQrC_Ly-JWGL0nN8iQ", name: "Arijit Singh", image: "https://i.pravatar.cc/150?img=33", subscribers: "12M", videoCount: "122M Plays" },
        { id: "UCsWXy7e5hRQ0vSGPiO4MYvg", name: "T-Series", image: "https://i.pravatar.cc/150?img=60", subscribers: "260M", videoCount: "500M Plays" },
        { id: "UCq-Fj5jknLsUf-MWSy4_brA", name: "Pritam", image: "https://i.pravatar.cc/150?img=12", subscribers: "5M", videoCount: "89M Plays" },
        { id: "UC2QTy9QoNJBrl8rHFMWBxug", name: "Jubin Nautiyal", image: "https://i.pravatar.cc/150?img=53", subscribers: "8M", videoCount: "95M Plays" },
        { id: "UCpGOBnKRN8Dh-KtdFe-IfQw", name: "Neha Kakkar", image: "https://i.pravatar.cc/150?img=47", subscribers: "70M", videoCount: "200M Plays" },
        { id: "UC1zuotHBQJPAkSSe78RqkLA", name: "Badshah", image: "https://i.pravatar.cc/150?img=68", subscribers: "15M", videoCount: "180M Plays" },
    ],
    US: [
        { id: "UCByOQJWvGG5-2s2OqH_QDRw", name: "Drake", image: "https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558e0d77a5", subscribers: "75M", videoCount: "15B Plays" },
        { id: "UC0WP5P-ufpRfjbNrmOWwLBQ", name: "Taylor Swift", image: "https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcdccb0e676", subscribers: "55M", videoCount: "12B Plays" },
        { id: "UCIwFjwMjI0y7PDBVEO9-bkQ", name: "The Weeknd", image: "https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb", subscribers: "35M", videoCount: "8B Plays" },
        { id: "UCcgqSM4YEo5vVQpqwN-MaNg", name: "Post Malone", image: "https://i.scdn.co/image/ab6761610000e5ebe17c0aa1714a03d62b5ce4e0", subscribers: "28M", videoCount: "6B Plays" },
        { id: "UC2pmfLm7iq6Ov1UwYrWYkZA", name: "Billie Eilish", image: "https://i.scdn.co/image/ab6761610000e5ebd8b9980db67272cb4d2c3daf", subscribers: "45M", videoCount: "9B Plays" },
        { id: "UCnxQ8o9RpqxGF2oLHcCn_Ng", name: "Ariana Grande", image: "https://i.scdn.co/image/ab6761610000e5ebcdce7620dc940db079bf4952", subscribers: "55M", videoCount: "11B Plays" },
    ],
    KR: [
        { id: "UC3IZKseVpdzPSBaWxBxundA", name: "BTS", image: "https://i.scdn.co/image/ab6761610000e5ebd642648235ebf3460d2d1f6a", subscribers: "75M", videoCount: "20B Plays" },
        { id: "UCEf_Bc-KVd7onSeifS3py9g", name: "BLACKPINK", image: "https://i.scdn.co/image/ab6761610000e5ebc9690bc711d04b3d4fd4b87c", subscribers: "90M", videoCount: "15B Plays" },
        { id: "UCJ0ZkHYdHXwKnRzCWEhVfMg", name: "Stray Kids", image: "https://i.scdn.co/image/ab6761610000e5eb9f3537e1d5d26348f0e51e5b", subscribers: "18M", videoCount: "3B Plays" },
        { id: "UChSX1FVgv9NnYD0gLAv0r_Q", name: "NewJeans", image: "https://i.scdn.co/image/ab6761610000e5eb5da361915b1fa48895d4f23f", subscribers: "15M", videoCount: "2B Plays" },
        { id: "UCMsnDhx-YGzPfHHUcHLZMmw", name: "TWICE", image: "https://i.scdn.co/image/ab6761610000e5eb5df0fae0fb872f7579c45c47", subscribers: "14M", videoCount: "5B Plays" },
        { id: "UCFlE0UpIqfAVLJbEV2QOe0g", name: "IVE", image: "https://i.scdn.co/image/ab6761610000e5eb51c698e866ca63f77c5d4d33", subscribers: "8M", videoCount: "1B Plays" },
    ],
    GB: [
        { id: "UC0C-w0YjGpqDXGB8IHb662A", name: "Ed Sheeran", image: "https://i.scdn.co/image/ab6761610000e5eb3bcef85e105dfc42399ef0ba", subscribers: "55M", videoCount: "18B Plays" },
        { id: "UCDAn1SLHvK3_XUvYoMVBYcg", name: "Dua Lipa", image: "https://i.scdn.co/image/ab6761610000e5eb12a3f842af4e71d86b06f9dd", subscribers: "25M", videoCount: "8B Plays" },
        { id: "UCft1MCWgeS0SNQcBJqBrpSw", name: "Adele", image: "https://i.scdn.co/image/ab6761610000e5eb68f6e5892075d7f22615bd17", subscribers: "30M", videoCount: "10B Plays" },
        { id: "UCDAn1SLHvK3_XUvYoMVBYcg", name: "Harry Styles", image: "https://i.scdn.co/image/ab6761610000e5eb4d66f2cfc25056c05ef34abc", subscribers: "20M", videoCount: "5B Plays" },
        { id: "UCq0thDreJNGDPQBsTnSjSiQ", name: "Coldplay", image: "https://i.scdn.co/image/ab6761610000e5eb989ed05e1f0570cc4726c2d3", subscribers: "25M", videoCount: "12B Plays" },
        { id: "UCbplM9ELJBJcLLNFXBV2IhQ", name: "Sam Smith", image: "https://i.scdn.co/image/ab6761610000e5eb2735436dce5c1bd898fbbed5", subscribers: "15M", videoCount: "6B Plays" },
    ],
    LATAM: [
        { id: "UCedvOgsKFzcK3hA5tBPhVrd", name: "Bad Bunny", image: "https://i.scdn.co/image/ab6761610000e5eb9ad50e478a469c41e4106a00", subscribers: "45M", videoCount: "25B Plays" },
        { id: "UCLmL469XE_TGvBD0-RvPz7g", name: "J Balvin", image: "https://i.scdn.co/image/ab6761610000e5eb6d1d31f84dbbb1a8f4ef2da7", subscribers: "35M", videoCount: "15B Plays" },
        { id: "UCq6R4Yje_R9nR1k0eKoQHLA", name: "Shakira", image: "https://i.scdn.co/image/ab6761610000e5eb59f9214848ecf552ed84ab3f", subscribers: "40M", videoCount: "18B Plays" },
        { id: "UCTmLZLYLz3M1OXxbzXnKvzA", name: "Daddy Yankee", image: "https://i.scdn.co/image/ab6761610000e5eb90e4a37c81d95e52e3d126f8", subscribers: "30M", videoCount: "12B Plays" },
        { id: "UC_LMY3EcG1Vc6hyU5G0knZA", name: "Karol G", image: "https://i.scdn.co/image/ab6761610000e5eb5f1a778e2ed55edbbf2a4c08", subscribers: "25M", videoCount: "10B Plays" },
        { id: "UC5LYyL_MnCMWc_mZ9FKKe3g", name: "Ozuna", image: "https://i.scdn.co/image/ab6761610000e5eb1a3b7e8ccc1eb91f7a993cd8", subscribers: "28M", videoCount: "14B Plays" },
    ],
};

export type RegionCode = 'IN' | 'US' | 'KR' | 'GB' | 'LATAM';

export const REGIONS = [
    { code: 'IN' as RegionCode, name: 'India', flag: '🇮🇳' },
    { code: 'US' as RegionCode, name: 'USA', flag: '🇺🇸' },
    { code: 'KR' as RegionCode, name: 'Korea', flag: '🇰🇷' },
    { code: 'GB' as RegionCode, name: 'UK', flag: '🇬🇧' },
    { code: 'LATAM' as RegionCode, name: 'Latin', flag: '🌎' },
];

export async function getTopArtists(regionCode: RegionCode = 'IN'): Promise<TopArtist[]> {
    // Return curated artists based on region
    // This provides immediate results without API latency
    const artists = ARTISTS_BY_REGION[regionCode];
    if (artists) {
        return artists;
    }
    return ARTISTS_BY_REGION.IN; // Default to India
}

function formatSubscribers(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) return Math.floor(num / 1000000) + 'M';
    if (num >= 1000) return Math.floor(num / 1000) + 'K';
    return count;
}

function formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000000) return Math.floor(num / 1000000000) + 'B';
    if (num >= 1000000) return Math.floor(num / 1000000) + 'M';
    if (num >= 1000) return Math.floor(num / 1000) + 'K';
    return count;
}

