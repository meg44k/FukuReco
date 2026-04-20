"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLIFF } from "@/providers/liff-providers";

export function useFavorites() {
  const { liff } = useLIFF();
  const [favorites, setFavorites] = useState<(number | string)[]>([]);
  const [loading, setLoading] = useState(true);
  const [lineId, setLineId] = useState<string | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ実行される初期化
    const debugId = process.env.NEXT_PUBLIC_DEBUG_LINE_ID || "GUEST_USER_ID";
    
    if (process.env.NODE_ENV !== 'production') {
      console.log("Using Debug/Guest LINE ID:", debugId);
    }
    
    // 同期的なsetStateを避けるためマイクロタスクで実行
    Promise.resolve().then(() => {
      setLineId(debugId);
    });
  }, []);

  useEffect(() => {
    // lineIdが未設定、またはLIFFが未準備なら何もしない
    if (!liff || !lineId) return;

    // すでに本物のLINE ID（デバッグ/ゲスト用以外）が設定されている場合はスキップ
    const isTemporaryId = lineId === "GUEST_USER_ID" || lineId === process.env.NEXT_PUBLIC_DEBUG_LINE_ID;
    if (!isTemporaryId) return;

    const getProfile = async () => {
      try {
        if (!liff.isLoggedIn()) {
          // ログインしていない場合は現在のID（ゲストID）を維持
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
  }, [liff, lineId]);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      if (!lineId) return;

      const supabase = createClient();
      const { data, error } = await supabase
        .from("favorites")
        .select("spot_id")
        .eq("user_id", lineId);

      if (!ignore) {
        if (error) {
          console.error("Error fetching favorites:", error);
        } else if (data) {
          setFavorites(data.map((f: { spot_id: number | string }) => f.spot_id));
        }
        setLoading(false);
      }
    };

    if (lineId) {
      fetchData();
    } else if (liff && !liff.isLoggedIn()) {
      // Use a microtask to avoid synchronous state update in effect body warning
      Promise.resolve().then(() => {
        if (!ignore) setLoading(false);
      });
    }

    return () => {
      ignore = true;
    };
  }, [lineId, liff]);

  const normalizeId = (id: number | string) => {
    return !isNaN(Number(id)) ? Number(id) : id;
  };

  const toggleFavorite = async (rawSpotId: number | string) => {
    const spotId = normalizeId(rawSpotId);
    if (!lineId) {
      console.warn("Cannot toggle favorite: User ID not found.");
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

  return { 
    favorites, 
    loading, 
    toggleFavorite, 
    isFavorite: (rawSpotId: number | string) => favorites.includes(normalizeId(rawSpotId)) 
  };
}
