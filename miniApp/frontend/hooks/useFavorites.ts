"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLIFF } from "@/providers/liff-providers";

// 定数定義
const GUEST_ID = "GUEST_USER_ID";
const ROLE_MEMBER = "member";

export function useFavorites() {
  const { liff } = useLIFF();
  const [favorites, setFavorites] = useState<(number | string)[]>([]);
  const [loading, setLoading] = useState(true);
  const [lineId, setLineId] = useState<string | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ実行される初期化
    const debugId = process.env.NEXT_PUBLIC_DEBUG_LINE_ID || GUEST_ID;
    
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
    const isTemporaryId = lineId === GUEST_ID || lineId === process.env.NEXT_PUBLIC_DEBUG_LINE_ID;
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

  // ユーザーIDが確定したタイミングで、DBにユーザーを登録する（存在しない場合のみ）
  useEffect(() => {
    if (!lineId) return;

    const ensureUserExists = async () => {
      const supabase = createClient();
      
      // upsert を ignoreDuplicates: true で使用することで、
      // 「存在しない場合のみ作成し、存在する場合は何もしない」というアトミックな操作が可能になります。
      // これにより、レースコンディションとデータ上書きの両方を防げます。
      const { error } = await supabase
        .from("users")
        .upsert(
          [{ 
            id: lineId, 
            name: lineId === GUEST_ID ? "GUEST" : "LINE User",
            role: ROLE_MEMBER 
          }], 
          { 
            onConflict: 'id',
            ignoreDuplicates: true 
          }
        );

      if (error) {
        console.error("Error ensuring user exists (atomic upsert) detailed:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
      } else {
        console.log("User existence verified/ensured for:", lineId);
      }
    };

    ensureUserExists();
  }, [lineId]);

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

    console.log("Toggle favorite starting...", { lineId, spotId });
    const supabase = createClient();
    const isFavoriteSpot = favorites.includes(spotId);

    try {
      if (isFavoriteSpot) {
        console.log("Removing favorite...");
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", lineId)
          .eq("spot_id", spotId);

        if (error) {
          console.error("Error removing favorite detailed:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
        } else {
          setFavorites((prev) => prev.filter((id) => id !== spotId));
        }
      } else {
        console.log("Adding favorite...");
        const { error } = await supabase
          .from("favorites")
          .insert([{ user_id: lineId, spot_id: spotId }]);

        if (error) {
          console.error("Error adding favorite detailed:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
        } else {
          console.log("Successfully added favorite");
          setFavorites((prev) => [...prev, spotId]);
        }
      }
    } catch (err) {
      console.error("Catastrophic error in toggleFavorite:", err);
    }
  };

  return { 
    favorites, 
    loading, 
    toggleFavorite, 
    isFavorite: (rawSpotId: number | string) => favorites.includes(normalizeId(rawSpotId)) 
  };
}
