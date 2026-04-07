"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLIFF } from "@/providers/liff-providers";

export function useFavorites() {
  const { liff } = useLIFF();
  const [favorites, setFavorites] = useState<(number | string)[]>([]);
  const [loading, setLoading] = useState(true);
  const [lineId, setLineId] = useState<string | null>(null);

  useEffect(() => {
    // Debug mode: Use static ID if provided in .env.local
    const debugId = process.env.NEXT_PUBLIC_DEBUG_LINE_ID;
    if (debugId) {
      console.log("Using Debug LINE ID:", debugId);
      setLineId(debugId);
      setLoading(false);
      return;
    }

    if (!liff) return;

    const getProfile = async () => {
      try {
        if (!liff.isLoggedIn()) {
          // liff.login(); // Don't force login here, let the page handle it if needed
          setLoading(false);
          return;
        }
        const profile = await liff.getProfile();
        setLineId(profile.userId);
      } catch (error) {
        console.error("Error getting LIFF profile:", error);
        setLoading(false);
      }
    };

    getProfile();
  }, [liff]);

  const fetchFavorites = useCallback(async () => {
    if (!lineId) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("favorites")
      .select("spot_id")
      .eq("user_id", lineId);

    if (error) {
      console.error("Error fetching favorites:", error);
    } else {
      setFavorites(data.map((f: any) => f.spot_id));
    }
    setLoading(false);
  }, [lineId]);

  useEffect(() => {
    if (lineId) {
      fetchFavorites();
    } else if (liff && !liff.isLoggedIn()) {
        setLoading(false);
    }
  }, [lineId, fetchFavorites, liff]);

  const toggleFavorite = async (spotId: number | string) => {
    if (!lineId) {
      if (liff && !liff.isLoggedIn()) {
        liff.login();
      }
      return;
    }

    const supabase = createClient();
    const isFavoriteSpot = favorites.includes(spotId);

    if (isFavoriteSpot) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", lineId)
        .eq("spot_id", spotId);

      if (error) {
        console.error("Error removing favorite:", error);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== spotId));
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert([{ user_id: lineId, spot_id: spotId }]);

      if (error) {
        console.error("Error adding favorite:", error);
      } else {
        setFavorites((prev) => [...prev, spotId]);
      }
    }
  };

  return { favorites, loading, toggleFavorite, isFavorite: (spotId: number | string) => favorites.includes(spotId) };
}
