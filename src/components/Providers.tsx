"use client";

import { ReactNode } from "react";
import { SettingsProvider } from "@/context/SettingsContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { PlaylistProvider } from "@/context/PlaylistContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SettingsProvider>
            <PlayerProvider>
                <PlaylistProvider>
                    <FavoritesProvider>
                        {children}
                    </FavoritesProvider>
                </PlaylistProvider>
            </PlayerProvider>
        </SettingsProvider>
    );
}
