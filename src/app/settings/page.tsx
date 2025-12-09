"use client";

import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";
import {
    Settings,
    Volume2,
    Moon,
    Sun,
    Bell,
    Download,
    Palette,
    Music,
    Smartphone,
    Info,
    ChevronRight,
    Check,
    Trash2,
    RotateCcw,
    Database,
    HardDrive,
    AlertTriangle,
    X
} from "lucide-react";

const accentColors = [
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Yellow', value: '#eab308' },
];

export default function SettingsPage() {
    const { settings, updateSetting, resetSettings, clearAllData, clearRecentlyPlayed } = useSettings();
    const [saved, setSaved] = useState(false);
    const [showClearDataModal, setShowClearDataModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [storageUsed, setStorageUsed] = useState<string>('Calculating...');

    // Calculate storage usage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                let total = 0;
                for (const key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        total += localStorage.getItem(key)?.length || 0;
                    }
                }
                const kb = (total / 1024).toFixed(2);
                setStorageUsed(`${kb} KB`);
            } catch {
                setStorageUsed('Unable to calculate');
            }
        }
    }, []);

    // Show saved indicator when settings change
    const handleUpdateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
        updateSetting(key, value);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleClearRecentlyPlayed = () => {
        clearRecentlyPlayed();
    };

    const handleClearAllData = () => {
        clearAllData();
    };

    const handleResetSettings = () => {
        resetSettings();
        setShowResetModal(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300"
                    style={{ backgroundColor: `${settings.accentColor}30`, color: settings.accentColor }}
                >
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-gray-400 text-sm">Customize your music experience</p>
                </div>
                {saved && (
                    <div className="ml-auto flex items-center gap-2 text-green-400 text-sm animate-fade-in">
                        <Check className="w-4 h-4" />
                        Saved
                    </div>
                )}
            </div>

            {/* Settings Sections */}
            <div className="space-y-6">

                {/* Appearance Section */}
                <section className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-5">
                        <Palette className="w-5 h-5" style={{ color: settings.accentColor }} />
                        <h2 className="text-lg font-semibold text-white">Appearance</h2>
                    </div>

                    {/* Theme */}
                    <div className="mb-5">
                        <label className="text-sm text-gray-400 mb-3 block">Theme</label>
                        <div className="flex gap-3">
                            {(['dark', 'light', 'system'] as const).map((theme) => (
                                <button
                                    key={theme}
                                    onClick={() => handleUpdateSetting('theme', theme)}
                                    className={`flex-1 py-3 px-4 rounded-xl border transition-all ${settings.theme === theme
                                            ? 'border-opacity-100 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                    style={settings.theme === theme ? {
                                        backgroundColor: `${settings.accentColor}20`,
                                        borderColor: settings.accentColor,
                                        color: settings.accentColor
                                    } : {}}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {theme === 'dark' && <Moon className="w-4 h-4" />}
                                        {theme === 'light' && <Sun className="w-4 h-4" />}
                                        {theme === 'system' && <Smartphone className="w-4 h-4" />}
                                        <span className="capitalize text-sm font-medium">{theme}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accent Color */}
                    <div>
                        <label className="text-sm text-gray-400 mb-3 block">Accent Color</label>
                        <div className="flex gap-3 flex-wrap">
                            {accentColors.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => handleUpdateSetting('accentColor', color.value)}
                                    className={`w-10 h-10 rounded-full transition-all relative hover:scale-110 ${settings.accentColor === color.value
                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#12121a] scale-110'
                                            : ''
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                    {settings.accentColor === color.value && (
                                        <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-lg" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Audio Section */}
                <section className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-5">
                        <Volume2 className="w-5 h-5" style={{ color: settings.accentColor }} />
                        <h2 className="text-lg font-semibold text-white">Audio</h2>
                    </div>

                    {/* Audio Quality */}
                    <div className="mb-5">
                        <label className="text-sm text-gray-400 mb-3 block">Streaming Quality</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(['low', 'medium', 'high', 'lossless'] as const).map((quality) => (
                                <button
                                    key={quality}
                                    onClick={() => handleUpdateSetting('audioQuality', quality)}
                                    className={`py-2.5 px-3 rounded-xl border transition-all text-center ${settings.audioQuality === quality
                                            ? 'border-opacity-100'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                    style={settings.audioQuality === quality ? {
                                        backgroundColor: `${settings.accentColor}20`,
                                        borderColor: settings.accentColor,
                                        color: settings.accentColor
                                    } : {}}
                                >
                                    <span className="capitalize text-sm font-medium">{quality}</span>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        {quality === 'low' && '96 kbps'}
                                        {quality === 'medium' && '160 kbps'}
                                        {quality === 'high' && '320 kbps'}
                                        {quality === 'lossless' && 'FLAC'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggle Settings */}
                    <div className="space-y-4">
                        <ToggleSetting
                            label="Auto-play"
                            description="Automatically play similar songs when your music ends"
                            enabled={settings.autoPlay}
                            onChange={(value) => handleUpdateSetting('autoPlay', value)}
                            accentColor={settings.accentColor}
                        />
                        <ToggleSetting
                            label="Crossfade"
                            description="Smooth transition between tracks"
                            enabled={settings.crossfade}
                            onChange={(value) => handleUpdateSetting('crossfade', value)}
                            accentColor={settings.accentColor}
                        />
                        {settings.crossfade && (
                            <div className="pl-4 border-l-2" style={{ borderColor: `${settings.accentColor}50` }}>
                                <label className="text-sm text-gray-400 mb-2 block">
                                    Crossfade Duration: {settings.crossfadeDuration}s
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={settings.crossfadeDuration}
                                    onChange={(e) => handleUpdateSetting('crossfadeDuration', parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    style={{ accentColor: settings.accentColor }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>1s</span>
                                    <span>12s</span>
                                </div>
                            </div>
                        )}
                        <ToggleSetting
                            label="Normalize Volume"
                            description="Keep volume levels consistent across all tracks"
                            enabled={settings.normalizeVolume}
                            onChange={(value) => handleUpdateSetting('normalizeVolume', value)}
                            accentColor={settings.accentColor}
                        />
                    </div>
                </section>

                {/* Playback Section */}
                <section className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-5">
                        <Music className="w-5 h-5" style={{ color: settings.accentColor }} />
                        <h2 className="text-lg font-semibold text-white">Playback</h2>
                    </div>

                    <div className="space-y-4">
                        <ToggleSetting
                            label="Show Lyrics"
                            description="Display lyrics when available during playback"
                            enabled={settings.showLyrics}
                            onChange={(value) => handleUpdateSetting('showLyrics', value)}
                            accentColor={settings.accentColor}
                        />
                    </div>
                </section>

                {/* Downloads Section */}
                <section className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-5">
                        <Download className="w-5 h-5" style={{ color: settings.accentColor }} />
                        <h2 className="text-lg font-semibold text-white">Downloads</h2>
                    </div>

                    {/* Download Quality */}
                    <div className="mb-5">
                        <label className="text-sm text-gray-400 mb-3 block">Download Quality</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['low', 'medium', 'high'] as const).map((quality) => (
                                <button
                                    key={quality}
                                    onClick={() => handleUpdateSetting('downloadQuality', quality)}
                                    className={`py-2.5 px-3 rounded-xl border transition-all text-center ${settings.downloadQuality === quality
                                            ? 'border-opacity-100'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                        }`}
                                    style={settings.downloadQuality === quality ? {
                                        backgroundColor: `${settings.accentColor}20`,
                                        borderColor: settings.accentColor,
                                        color: settings.accentColor
                                    } : {}}
                                >
                                    <span className="capitalize text-sm font-medium">{quality}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <ToggleSetting
                        label="Offline Mode"
                        description="Only play downloaded music (saves data)"
                        enabled={settings.offlineMode}
                        onChange={(value) => handleUpdateSetting('offlineMode', value)}
                        accentColor={settings.accentColor}
                    />
                </section>

                {/* Notifications Section */}
                <section className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-5">
                        <Bell className="w-5 h-5" style={{ color: settings.accentColor }} />
                        <h2 className="text-lg font-semibold text-white">Notifications</h2>
                    </div>

                    <ToggleSetting
                        label="Push Notifications"
                        description="Receive updates about new releases and features"
                        enabled={settings.notifications}
                        onChange={(value) => handleUpdateSetting('notifications', value)}
                        accentColor={settings.accentColor}
                    />
                </section>

                {/* Data Management Section */}
                <section className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-5">
                        <Database className="w-5 h-5" style={{ color: settings.accentColor }} />
                        <h2 className="text-lg font-semibold text-white">Data Management</h2>
                    </div>

                    <div className="space-y-3">
                        {/* Storage Info */}
                        <div className="flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <HardDrive className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-300">Storage Used</span>
                            </div>
                            <span className="text-sm text-white font-medium">{storageUsed}</span>
                        </div>

                        {/* Clear Recently Played */}
                        <button
                            onClick={handleClearRecentlyPlayed}
                            className="w-full flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-orange-400 transition-colors" />
                                <span className="text-sm text-gray-300">Clear Recently Played</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        </button>

                        {/* Reset Settings */}
                        <button
                            onClick={() => setShowResetModal(true)}
                            className="w-full flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                                <span className="text-sm text-gray-300">Reset Settings to Default</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        </button>

                        {/* Clear All Data */}
                        <button
                            onClick={() => setShowClearDataModal(true)}
                            className="w-full flex items-center justify-between py-3 px-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all group border border-red-500/20"
                        >
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span className="text-sm text-red-400">Clear All App Data</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-red-400" />
                        </button>
                    </div>
                </section>

                {/* About Section */}
                <section className="bg-white/5 rounded-2xl p-5 border border-white/5">
                    <div className="flex items-center gap-3 mb-5">
                        <Info className="w-5 h-5" style={{ color: settings.accentColor }} />
                        <h2 className="text-lg font-semibold text-white">About</h2>
                    </div>

                    <div className="space-y-3">
                        <InfoRow label="Version" value="1.0.0" />
                        <InfoRow label="Build" value="2024.12.09" />
                        <button className="w-full flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                            <span className="text-sm text-gray-300">Terms of Service</span>
                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        </button>
                        <button className="w-full flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                            <span className="text-sm text-gray-300">Privacy Policy</span>
                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        </button>
                        <button className="w-full flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group">
                            <span className="text-sm text-gray-300">Open Source Licenses</span>
                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                        </button>
                    </div>
                </section>

            </div>

            {/* Reset Settings Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a24] rounded-2xl p-6 max-w-sm w-full border border-white/10 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <RotateCcw className="w-5 h-5 text-yellow-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Reset Settings?</h3>
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-6">
                            This will reset all settings to their default values. Your playlists, favorites, and listening history will be preserved.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetSettings}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-yellow-500 text-black font-medium hover:bg-yellow-400 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear All Data Modal */}
            {showClearDataModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1a1a24] rounded-2xl p-6 max-w-sm w-full border border-red-500/20 animate-scale-in">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Clear All Data?</h3>
                            <button
                                onClick={() => setShowClearDataModal(false)}
                                className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                            This will permanently delete:
                        </p>
                        <ul className="text-red-300 text-sm mb-6 space-y-1">
                            <li>• All your playlists</li>
                            <li>• Your favorites</li>
                            <li>• Listening history</li>
                            <li>• All settings</li>
                        </ul>
                        <p className="text-gray-500 text-xs mb-4">
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowClearDataModal(false)}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearAllData}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-400 transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Toggle Setting Component
function ToggleSetting({
    label,
    description,
    enabled,
    onChange,
    accentColor
}: {
    label: string;
    description: string;
    enabled: boolean;
    onChange: (value: boolean) => void;
    accentColor: string;
}) {
    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex-1 mr-4">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                className={`relative w-12 h-6 rounded-full transition-all ${enabled ? '' : 'bg-white/20'
                    }`}
                style={enabled ? { backgroundColor: accentColor } : {}}
            >
                <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${enabled ? 'left-7' : 'left-1'
                        }`}
                />
            </button>
        </div>
    );
}

// Info Row Component
function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-2 px-4 bg-white/5 rounded-xl">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm text-white font-medium">{value}</span>
        </div>
    );
}
