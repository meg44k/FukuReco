'use client';

import styles from "./MapComponent.module.css"
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from '@react-google-maps/api'
import { LocateFixed } from "lucide-react";
import { IconButton } from "@mui/material";
import { SpotCard } from "@/components/atoms/spotCard/SpotCard";
import { SearchTextField } from "@/components/atoms/searchTextField/SearchTextField";
import { MenuButton } from "@/components/atoms/menuButton/MenuButton";
import { MenuDrawer } from "@/components/organisms/menuDrawer/MenuDrawer";
import { TagSearchButtons } from "@/components/organisms/tagSearchButtons/TagSearchButtons";
import { MapSpotData, MinimalSpotData, HAKATA_STATION } from "@/types/map";
import { panMapToSpot } from "@/lib/map/mapUtils";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

// マップ表示時の初期中心（天神付近）
const initCenter = {
  lat: 33.5902,
  lng: 130.4017,
};

type Props = {
  initialSpots: MinimalSpotData[]; // 初期表示は最小限のデータ配列を受け取る
  keyword?: string; // 検索キーワード（URL等から）
  options?: string; // 検索タグ（URL等から）
}

export const MapComponent = ({ initialSpots, keyword, options: searchOptions }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hasInitializedFromUrl = useRef(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  // state管理
  const [selectedSpot, setSelectedSpot] = useState<null | MapSpotData>(null);  // 選択中の詳細データ
  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentPos, setCurrentPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const [activeKeyword, setActiveKeyword] = useState<string | undefined>(keyword); // 現在の検索キーワード
  const [isMenuOpen, setIsMenuOpen] = useState(false); // メニューの開閉状態
  const [isSearchFocused, setIsSearchFocused] = useState(false); // 検索バーのフォーカス状態

  // カード表示用リスト
  const [displayCards, setDisplayCards] = useState<MapSpotData[]>([]);
  const cardListRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isScrollingByCode = useRef<boolean>(false); // プログラムによるスクロール中かどうかのフラグ
  const lastSelectedSource = useRef<'map' | 'scroll'>('map'); // 選択元の判定用フラグ

  // 選択中のスポットが変わったらURLのクエリパラメータを更新する
  useEffect(() => {
    if (!hasInitializedFromUrl.current) return;

    // window.location.searchを使用して無限ループを防ぐ
    const params = new URLSearchParams(window.location.search);
    const currentId = params.get('selectedId');
    const newId = selectedSpot?.id.toString() || null;

    if (newId) {
      if (currentId !== newId) {
        params.set('selectedId', newId);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    } else {
      if (currentId) {
        params.delete('selectedId');
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }
  }, [selectedSpot?.id, pathname, router]);

  // 位置情報を取得する
  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCurrentPos(pos);
        setLocationStatus('allowed');
      },
      (error) => {
        console.warn("位置情報取得失敗、デフォルト（博多駅）を使用します", error);
        setCurrentPos(HAKATA_STATION);
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  // 現在地（またはデフォルト）が確定したらAPIから5件取得する
  useEffect(() => {
    if (locationStatus === 'loading' || !currentPos) return;

    const fetchTop5 = async () => {
      const url = new URL(window.location.origin + '/api/search');
      if (activeKeyword) url.searchParams.append('keyword', activeKeyword);
      if (searchOptions) url.searchParams.append('options', searchOptions);
      
      // 現在地情報を渡すことでサーバー側で5件に絞り込む
      url.searchParams.append('lat', currentPos.lat.toString());
      url.searchParams.append('lng', currentPos.lng.toString());

      try {
        const res = await fetch(url.toString());
        if (res.ok) {
          const data: MapSpotData[] = await res.json();
          
          if (!hasInitializedFromUrl.current) {
            hasInitializedFromUrl.current = true;
            const initialSelectedId = searchParams.get('selectedId');
            if (initialSelectedId) {
              const targetSpot = data.find(s => s.id.toString() === initialSelectedId);
              if (targetSpot) {
                setDisplayCards(data);
                lastSelectedSource.current = 'map';
                setSelectedSpot(targetSpot);
                return;
              } else {
                try {
                  const detailRes = await fetch(`/api/spotcard?id=${initialSelectedId}`);
                  if (detailRes.ok) {
                    const detailData: MapSpotData = await detailRes.json();
                    setDisplayCards([detailData]);
                    lastSelectedSource.current = 'map';
                    setSelectedSpot(detailData);
                    return;
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }

          setDisplayCards(data);
          
          // 最初の1件を選択状態にする
          if (data.length > 0) {
            lastSelectedSource.current = 'map';
            setSelectedSpot(data[0]);
          } else {
            setSelectedSpot(null);
          }
        }
      } catch (error) {
        console.error("検索API呼び出しエラー:", error);
      }
    };

    fetchTop5();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationStatus, currentPos, activeKeyword, searchOptions]);

  // スクロール中のカードを検知し、マップを連動させる
  const handleScroll = () => {
    if (isScrollingByCode.current || !cardListRef.current || displayCards.length <= 1) return;
    
    const container = cardListRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestSpotId: number | null = null;
    let minDistance = Infinity;

    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        const elCenter = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenter - elCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestSpotId = Number(id);
        }
      }
    });

    if (closestSpotId !== null) {
      setSelectedSpot((prev) => {
        if (prev?.id !== closestSpotId) {
          const nextSpot = displayCards.find(s => s.id === closestSpotId);
          if (nextSpot) {
            lastSelectedSource.current = 'scroll';
            return nextSpot;
          }
        }
        return prev;
      });
    }
  };

  // selectedSpot が変わったら（ピンタップ等）、該当のカードまでスクロールする
  useEffect(() => {
    if (!selectedSpot || !cardRefs.current[selectedSpot.id] || !cardListRef.current) return;

    if (lastSelectedSource.current === 'scroll') return;

    const el = cardRefs.current[selectedSpot.id];
    if (el) {
      isScrollingByCode.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setTimeout(() => {
        isScrollingByCode.current = false;
      }, 500); 
    }
  }, [selectedSpot]);

  useEffect(() => {
    if (!selectedSpot || !mapRef.current) return;
    panMapToSpot(mapRef.current, selectedSpot.position);
  }, [selectedSpot]);

  const handleBackToCurrent = () => {
    if (mapRef.current && currentPos) {
      mapRef.current.panTo(currentPos);
      mapRef.current.setZoom(15);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className={styles.mapPage}>
      <div className={styles.topBar}>
        <SearchTextField 
          onSearch={(val) => setActiveKeyword(val)} 
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)} // ボタンクリックを可能にするためディレイを設ける
          label="行きたい場所を検索" 
        />
        <MenuButton onClick={() => setIsMenuOpen(true)} />
      </div>

      <div className={`${styles.tagSearchContainer} ${isSearchFocused ? styles.tagSearchVisible : styles.tagSearchHidden}`}>
        <TagSearchButtons />
      </div>

      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initCenter}
        zoom={14}
        options={{
          mapId: "2180f9c8f0d419cfa3681583",
          disableDefaultUI: true,
        }}
        onLoad={(map) => {
          mapRef.current = map;
          if (selectedSpot) {
            panMapToSpot(map, selectedSpot.position);
          }
        }}
        onClick={() => {
          setSelectedSpot(null);
          setDisplayCards([]);
        }}
      >
        {locationStatus === 'allowed' && currentPos && (
          <Marker
            position={currentPos}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#4285F4",
              fillOpacity: 1,
              scale: 8,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />
        )}

        {initialSpots.map((spot) => (
          <Marker
            key={spot.id}
            position={spot.position}
            zIndex={selectedSpot?.id === spot.id ? 1000 : 1}
            onClick={async () => {
              // ピン選択時はその詳細を別途取得するロジックが必要（以前の実装を流用可能）
              const alreadyFetched = displayCards.find(s => s.id === spot.id);
              if (alreadyFetched) {
                setSelectedSpot(alreadyFetched);
                return;
              }
              // APIから詳細を取得
              try {
                const response = await fetch(`/api/spotcard?id=${spot.id}`);
                if (response.ok) {
                  const detailData: MapSpotData = await response.json();
                  setDisplayCards([detailData]); // リストを上書きして選択状態にする
                  setSelectedSpot(detailData);
                }
              } catch (e) { console.error(e); }
            }}
            icon={{
              url: spot.pinKind,
              scaledSize: new google.maps.Size(
                selectedSpot?.id === spot.id ? 80 : 50,
                selectedSpot?.id === spot.id ? 80 : 50
              ),
            }}
          />
        ))}

        <div className={selectedSpot ? styles.cardWrapper : `${styles.cardWrapper} ${styles.cardHidden}`}>
          {selectedSpot && (
            <div
              className={styles.cardListContainer}
              ref={cardListRef}
              onScroll={handleScroll}
            >
              {/* 最初と最後のカードも中央に来るようにスペーサーを配置 */}
              <div className={styles.spacer} />
              {displayCards.map((spot) => (
                <div 
                  key={spot.id} 
                  className={styles.cardItem}
                  data-spot-id={spot.id}
                  ref={(el) => {
                    cardRefs.current[spot.id] = el;
                  }}
                >
                  <SpotCard
                    spotKind={spot.spotKind}
                    spotName={spot.spotName}
                    isOpen={spot.isOpen}
                    imageSrc={spot.imageSrc}
                    spotTags={spot.spotTags}
                    detailURL={spot.detailURL}
                    price1={spot.price1}
                    price2={spot.price2}
                    updatedAt={spot.updatedAt}
                    onCloseClick={() => {
                      setSelectedSpot(null);
                      setDisplayCards([]);
                    }}
                  />
                </div>
              ))}
              <div className={styles.spacer} />
            </div>
          )}
        </div>

        {!selectedSpot && locationStatus === 'allowed' && currentPos && (
          <div className={styles.backToCurrentBtn}>
            <IconButton onClick={handleBackToCurrent}>
              <LocateFixed />
            </IconButton>
          </div>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;
