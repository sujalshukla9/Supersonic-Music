"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface SettingsState {
    theme: 'dark' | 'light' | 'system';
    audioQuality: 'low' | 'medium' | 'high' | 'lossless';
    autoPlay: boolean;
    crossfade: boolean;
    crossfadeDuration: number;
    normalizeVolume: boolean;
    showLyrics: boolean;
    notifications: boolean;
    downloadQuality: 'low' | 'medium' | 'high';
    offlineMode: boolean;
    accentColor: string;
}

interface SettingsContextType {
    settings: SettingsState;
    updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
    resetSettings: () => void;
    clearAllData: () => void;
    clearRecentlyPlayed: () => void;
    getEffectiveTheme: () => 'dark' | 'light';
}

const defaultSettings: SettingsState = {
    theme: 'dark',
    audioQuality: 'high',
    autoPlay: true,
    crossfade: true,
    crossfadeDuration: 5,
    normalizeVolume: false,
    showLyrics: true,
    notifications: true,
    downloadQuality: 'high',
    offlineMode: false,
    accentColor: '#8b5cf6',
};

const SETTINGS_KEY = 'supersonicSettings';

const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SettingsState>(defaultSettings);
    const [mounted, setMounted] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedSettings = localStorage.getItem(SETTINGS_KEY);
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings);
                    setSettings({ ...defaultSettings, ...parsed });
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            }
            setMounted(true);
        }
    }, []);

    // Apply theme when settings change
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        const effectiveTheme = getEffectiveThemeInternal(settings.theme);

        // Apply theme class
        if (effectiveTheme === 'light') {
            root.classList.remove('dark');
            root.classList.add('light');
        } else {
            root.classList.remove('light');
            root.classList.add('dark');
        }

        // Update meta theme color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#090910' : '#f5f5f5');
        }
    }, [settings.theme, mounted]);

    // Apply accent color when it changes
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        root.style.setProperty('--accent-color', settings.accentColor);

        // Create lighter and darker variants
        const hex = settings.accentColor.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        root.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
        root.style.setProperty('--accent-color-light', `rgba(${r}, ${g}, ${b}, 0.2)`);
        root.style.setProperty('--accent-color-dark', `rgba(${r}, ${g}, ${b}, 0.8)`);
    }, [settings.accentColor, mounted]);

    // Listen for system theme changes
    useEffect(() => {
        if (settings.theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            const root = document.documentElement;
            if (mediaQuery.matches) {
                root.classList.remove('light');
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
                root.classList.add('light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [settings.theme]);

    const getEffectiveThemeInternal = (theme: 'dark' | 'light' | 'system'): 'dark' | 'light' => {
        if (theme === 'system') {
            if (typeof window !== 'undefined') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return 'dark';
        }
        return theme;
    };

    const getEffectiveTheme = useCallback((): 'dark' | 'light' => {
        return getEffectiveThemeInternal(settings.theme);
    }, [settings.theme]);

    const updateSetting = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            if (typeof window !== 'undefined') {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            }
            return newSettings;
        });
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings);
        if (typeof window !== 'undefined') {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
        }
    }, []);

    const clearAllData = useCallback(() => {
        if (typeof window !== 'undefined') {
            // Clear all app-related localStorage
            localStorage.removeItem(SETTINGS_KEY);
            localStorage.removeItem('supersonic-recently-played');
            localStorage.removeItem('supersonic-favorites');
            localStorage.removeItem('supersonic-playlists');

            // Reset settings to default
            setSettings(defaultSettings);

            // Reload the page to reset all contexts
            window.location.reload();
        }
    }, []);

    const clearRecentlyPlayed = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('supersonic-recently-played');
            // Trigger a page reload to reset the PlayerContext
            window.location.reload();
        }
    }, []);

    return (
        <SettingsContext.Provider
            value={{
                settings,
                updateSetting,
                resetSettings,
                clearAllData,
                clearRecentlyPlayed,
                getEffectiveTheme,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
