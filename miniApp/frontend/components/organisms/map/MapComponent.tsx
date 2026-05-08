'use client';

import styles from "./MapComponent.module.css"
import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from '@react-google-maps/api'
import { LocateFixed } from "lucide-react";
import { IconButton } from "@mui/material";
import { SpotCard } from "@/components/atoms/spotCard/SpotCard";
import { SpotCardSkeleton } from "@/components/atoms/spotCard/SpotCardSkeleton";
import { SearchTextField } from "@/components/atoms/searchTextField/SearchTextField";
import { MenuButton } from "@/components/atoms/menuButton/MenuButton";
import { MenuDrawer } from "@/components/organisms/menuDrawer/MenuDrawer";
import { TagSearchButtons } from "@/components/organisms/tagSearchButtons/TagSearchButtons";
import { MapSpotData, MinimalSpotData, HAKATA_STATION } from "@/types/map";
import { panMapToSpot } from "@/lib/map/mapUtils";
import { useFavorites } from "@/hooks/useFavorites";
import Supercluster from 'supercluster';

const containerStyle = {
  width: "100%",
  height: "100vh",
};

// --- 定数定義 ---
const ZOOM_THRESHOLD = 15;
const MAX_ZOOM = 20; // Google Maps の一般的な最大ズーム
const CLUSTER_EXPANSION_ZOOM_INCREMENT = 2; // クラスター展開時の追加ズームレベル
const NORMAL_PIN_SIZE = { width: 37, height: 45 };
const SELECTED_PIN_SIZE = { width: 58.5, height: 72 };

// ピンごとのメタデータ（色と種別）
const PIN_METADATA: Record<string, { color: string, spotKind: "shop" | "spot" }> = {
  "/FoodPin.svg":   { color: "#EF633D", spotKind: "shop" },
  "/CameraPin.svg": { color: "#EF9651", spotKind: "spot" },
  "/ChairPin.svg":  { color: "#3F7D58", spotKind: "spot" },
  "/GiftPin.svg":   { color: "#F4B400", spotKind: "shop" },
};

// マップ表示時の初期中心（天神付近）
const initCenter = {
  lat: 33.5902,
  lng: 130.4017,
};

type Props = {
  initialSpots: MinimalSpotData[]; // 初期表示は最小限েরデータ配列を受け取る
  keyword?: string; // 検索キーワード（URL等から）
  options?: string; // 検索タグ（URL等から）
}

export const MapComponent = ({ initialSpots, keyword, options: searchOptions }: Props) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hasInitializedFromUrl = useRef(false);

  const { isFavorite, toggleFavorite } = useFavorites();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  if (loadError) {
    console.error("Google Maps API load error:", loadError);
  }

  // state管理
  const [selectedSpot, setSelectedSpot] = useState<null | MapSpotData>(null);  // 選択中の詳細データ
  const [isCardLoading, setIsCardLoading] = useState(false); // カードのロード状態
  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentPos, setCurrentPos] = useState<google.maps.LatLngLiteral | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const [activeKeyword, setActiveKeyword] = useState<string | undefined>(keyword); // 現在の検索キーワード
  const [isMenuOpen, setIsMenuOpen] = useState(false); // メニューの開閉状態
  const [isSearchFocused, setIsSearchFocused] = useState(false); // 検索バーのフォーカス状態
  const [isLandscape, setIsLandscape] = useState(false); // 横画面状態

  // タグ検索の履歴管理（戻るボタン対応）
  const handleSearchFocus = () => {
    if (!isSearchFocused) {
      window.history.pushState({ searchOpen: true }, '');
      setIsSearchFocused(true);
    }
  };

  const handleSearchClose = () => {
    if (isSearchFocused) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      if (window.history.state?.searchOpen) {
        window.history.back();
      } else {
        setIsSearchFocused(false);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setIsSearchFocused(false);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // クラスター用state
  const [zoom, setZoom] = useState(14);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  // カード表示用リスト
  const [displayCards, setDisplayCards] = useState<MapSpotData[]>([]);
  const cardListRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isScrollingByCode = useRef<boolean>(false); // プログラムによるスクロール中かどうかのフラグ
  const lastSelectedSource = useRef<'map' | 'scroll'>('map'); // 選択元の判定用フラグ
  const lastRequestSpotId = useRef<number | null>(null);

  // Superclusterのインスタンスを作成
  const supercluster = useMemo(() => {
    const sc = new Supercluster({
      radius: 60,
      maxZoom: ZOOM_THRESHOLD, // これ以上のズームでは集約しない
    });
    
    const features = initialSpots.map(s => ({
      type: 'Feature' as const,
      properties: { cluster: false, spotId: s.id, pinKind: s.pinKind },
      geometry: {
        type: 'Point' as const,
        coordinates: [s.position.lng, s.position.lat],
      },
    }));
    
    sc.load(features);
    return sc;
  }, [initialSpots]);

  // 表示対象（クラスターまたは個別のピン）を計算
  const visibleEntities = useMemo(() => {
    if (!bounds || !supercluster) return [];

    const clusters = supercluster.getClusters(bounds, zoom);
    return clusters.map(c => {
      const [lng, lat] = c.geometry.coordinates;
      if (c.properties.cluster) {
        return {
          id: `cluster-${c.id}`,
          position: { lat, lng },
          pinKind: 'cluster', // 混合クラスター用
          isCluster: true,
          count: c.properties.point_count,
          clusterId: c.id
        };
      } else {
        return {
          id: c.properties.spotId,
          position: { lat, lng },
          pinKind: c.properties.pinKind,
          isCluster: false,
          count: 1
        };
      }
    });
  }, [supercluster, bounds, zoom]);

  // クラスター用アイコン生成
  const getClusterIcon = (count: number, pinKind: string) => {
    // クラスター（混合）の場合はデフォルトカラー、単一ピンの場合はその色を使用
    const metadata = PIN_METADATA[pinKind];
    const color = metadata?.color || "#3F7D58"; // 混合クラスターはメインカラー（緑）
    const size = count < 10 ? 40 : count < 100 ? 50 : 60;
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="${color}" fill-opacity="0.9" stroke="white" stroke-width="2" />
        <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="${Math.floor(size/2.5)}px" font-weight="bold" font-family="Arial" dy=".35em">${count}</text>
      </svg>
    `;
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      size
    };
  };

  // 選択中のスポットが変わったらURLのクエリパラメータを更新する
  useEffect(() => {
    if (!hasInitializedFromUrl.current) return;

    const params = new URLSearchParams(window.location.search);
    const currentId = params.get('selectedId');
    const newId = selectedSpot?.id.toString() || null;

    if (newId) {
      if (currentId !== newId) {
        params.set('selectedId', newId);
        window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
      }
    } else {
      if (currentId) {
        params.delete('selectedId');
        window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
      }
    }
  }, [selectedSpot?.id, pathname]);

  // iOS等のソフトウェアキーボード表示時の高さを取得してCSS変数にセットする
  useEffect(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const handleResize = () => {
        // innerHeightとvisualViewport.heightの差分をキーボードの高さ（＋アルファ）として取得
        const offset = window.innerHeight - window.visualViewport!.height;
        document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`);
      };

      window.visualViewport.addEventListener('resize', handleResize);
      handleResize();

      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  // 横画面の判定
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      setIsCardLoading(true);
      const dummySpot: MapSpotData = {
        id: -1,
        position: currentPos,
        pinKind: "",
        spotKind: "spot",
        spotName: "",
        isOpen: false,
        imageSrc: "",
        spotTags: [],
        detailURL: "",
        updatedAt: new Date()
      };
      setDisplayCards([dummySpot]);
      setSelectedSpot(dummySpot);

      const url = new URL(window.location.origin + '/api/search');
      if (activeKeyword) url.searchParams.append('keyword', activeKeyword);
      if (searchOptions) url.searchParams.append('options', searchOptions);
      
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
          
          if (data.length > 0) {
            lastSelectedSource.current = 'map';
            setSelectedSpot(data[0]);
          } else {
            setSelectedSpot(null);
          }
        }
      } catch (error) {
        console.error("検索API呼び出しエラー:", error);
        setSelectedSpot(null);
        setDisplayCards([]);
      } finally {
        setIsCardLoading(false);
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
    const containerCenter = isLandscape 
      ? containerRect.top + containerRect.height / 2
      : containerRect.left + containerRect.width / 2;

    let closestSpotId: number | null = null;
    let minDistance = Infinity;

    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        const elCenter = isLandscape
          ? rect.top + rect.height / 2
          : rect.left + rect.width / 2;
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
      el.scrollIntoView({ 
        behavior: 'smooth', 
        block: isLandscape ? 'center' : 'nearest', 
        inline: isLandscape ? 'nearest' : 'center' 
      });
      setTimeout(() => {
        isScrollingByCode.current = false;
      }, 500); 
    }
  }, [selectedSpot, isLandscape]);

  useEffect(() => {
    if (!selectedSpot || !mapRef.current) return;
    const map = mapRef.current;
    
    // プロジェクションが準備できるのを待ってから移動
    const listener = google.maps.event.addListener(map, 'tilesloaded', () => {
      panMapToSpot(map, selectedSpot.position, isLandscape);
      google.maps.event.removeListener(listener);
    });

    // すでにロード済みの場合は直接呼ぶ
    panMapToSpot(map, selectedSpot.position, isLandscape);
  }, [selectedSpot, isLandscape]);

  const handleBackToCurrent = () => {
    if (mapRef.current && currentPos) {
      mapRef.current.panTo(currentPos);
      mapRef.current.setZoom(15);
    }
  };

  // スポットクリック時の詳細取得処理
  const handleSpotClick = async (spotId: number, position: google.maps.LatLngLiteral, pinKind: string) => {
    lastSelectedSource.current = 'map';
    
    // すでに現在のリストにあるなら、そのスポットを選択（スクロール）するだけにする
    const alreadyInList = displayCards.find(s => s.id === spotId);
    if (alreadyInList) {
      setSelectedSpot(alreadyInList);
      return;
    }
    
    // リストにない場合、新規スポット1件のみを表示する形に切り替える（リストが際限なく増えるのを防ぐ）
    const inferredSpotKind = PIN_METADATA[pinKind]?.spotKind || "spot";

    setIsCardLoading(true);
    lastRequestSpotId.current = spotId;

    const dummySpot: MapSpotData = {
      id: spotId,
      position: position,
      pinKind: pinKind,
      spotKind: inferredSpotKind,
      spotName: "",
      isOpen: false,
      imageSrc: "",
      spotTags: [],
      detailURL: "",
      updatedAt: new Date()
    };
    
    setDisplayCards([dummySpot]);
    setSelectedSpot(dummySpot);

    try {
      const response = await fetch(`/api/spotcard?id=${spotId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch spot details: ${response.status}`);
      }
      const detailData: MapSpotData = await response.json();
      
      // レースコンディション対策：最新のリクエストのみ処理
      if (lastRequestSpotId.current === spotId) {
        setDisplayCards([detailData]);
        setSelectedSpot(detailData);
      }
    } catch (e) { 
      console.error("スポット詳細取得失敗:", e);
      if (lastRequestSpotId.current === spotId) {
        setDisplayCards([]);
        setSelectedSpot(null);
      }
    } finally {
      if (lastRequestSpotId.current === spotId) {
        setIsCardLoading(false);
      }
    }
  };

  if (!isLoaded) return null;

  return (
    <div className={styles.mapPage}>
      <div className={styles.topBar}>
        <SearchTextField 
          onSearch={(val) => setActiveKeyword(val)} 
          onFocus={handleSearchFocus}
          label="行きたい場所を検索" 
        />
        <MenuButton 
          onClick={() => {
            if (isSearchFocused) {
              handleSearchClose();
            } else {
              setIsMenuOpen(true);
            }
          }}
          isClose={isSearchFocused}
        />
      </div>

      <div className={`${styles.tagSearchContainer} ${isSearchFocused ? styles.tagSearchVisible : styles.tagSearchHidden}`}>
        <TagSearchButtons />
      </div>

      <MenuDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initCenter}
        zoom={zoom}
        options={{
          mapId: "2180f9c8f0d419cfa3681583",
          disableDefaultUI: true,
        }}
        onLoad={(map) => {
          mapRef.current = map;
          if (selectedSpot) {
            panMapToSpot(map, selectedSpot.position, isLandscape);
          }
          const b = map.getBounds();
          if (b) {
            const ne = b.getNorthEast();
            const sw = b.getSouthWest();
            setBounds([sw.lng(), sw.lat(), ne.lng(), ne.lat()]);
          }
        }}
        onIdle={() => {
          if (mapRef.current) {
            const newZoom = mapRef.current.getZoom() ?? 14;
            setZoom(newZoom);
            const b = mapRef.current.getBounds();
            if (b) {
              const ne = b.getNorthEast();
              const sw = b.getSouthWest();
              setBounds([sw.lng(), sw.lat(), ne.lng(), ne.lat()]);
            }
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

        {visibleEntities.map((entity) => {
          const spotId = Number(entity.id);
          const isSelected = selectedSpot?.id === spotId;

          // 閾値以下の場合は、単一のピンでも「丸1」アイコンで表示する
          const shouldShowCircleStyle = entity.isCluster || zoom <= ZOOM_THRESHOLD;

          if (shouldShowCircleStyle) {
            const { url, size } = getClusterIcon(entity.count, entity.pinKind);
            return (
              <Marker
                key={entity.id}
                position={entity.position}
                zIndex={!entity.isCluster && isSelected ? 1000 : 1}
                clickable={true}
                onClick={() => {
                  if (entity.isCluster) {
                    if (mapRef.current && entity.clusterId !== undefined && typeof entity.clusterId === 'number') {
                      const expansionZoom = supercluster.getClusterExpansionZoom(entity.clusterId);
                      // クラスターをより詳細に展開するため、推奨ズームよりさらに深くズームする
                      // MAX_ZOOM を超えないようにクランプする
                      const nextZoom = Math.min(expansionZoom + CLUSTER_EXPANSION_ZOOM_INCREMENT, MAX_ZOOM);
                      mapRef.current.setZoom(nextZoom);
                      
                      // カードが開いている場合はオフセットを考慮して移動
                      if (selectedSpot) {
                        panMapToSpot(mapRef.current, entity.position, isLandscape);
                      } else {
                        mapRef.current.panTo(entity.position);
                      }
                    }
                  } else {
                    handleSpotClick(spotId, entity.position, entity.pinKind);
                    // 単一ピン（丸1）をクリックした際、詳細ピンが見えるズームレベルまで拡大する
                    if (mapRef.current) {
                      // クラスタークリックと同様に、閾値より深くズームして視認性を高める
                      const nextZoom = zoom <= ZOOM_THRESHOLD 
                        ? Math.min(ZOOM_THRESHOLD + CLUSTER_EXPANSION_ZOOM_INCREMENT, MAX_ZOOM) 
                        : zoom;
                      
                      if (zoom <= ZOOM_THRESHOLD) {
                        mapRef.current.setZoom(nextZoom);
                      }
                      // ズーム変更と移動を同期させるため、isLandscapeを渡す
                      panMapToSpot(mapRef.current, entity.position, isLandscape);
                    }
                  }
                }}
                icon={{
                  url: url,
                  anchor: new google.maps.Point(size / 2, size / 2),
                }}
              />
            );
          }

          // 個別ピン（詳細なSVGアイコン）の表示（zoom > ZOOM_THRESHOLD の場合）
          const pinSize = isSelected ? SELECTED_PIN_SIZE : NORMAL_PIN_SIZE;
          return (
            <Marker
              key={entity.id}
              position={entity.position}
              zIndex={isSelected ? 1000 : 1}
              clickable={true}
              onClick={() => handleSpotClick(spotId, entity.position, entity.pinKind)}
              icon={{
                url: entity.pinKind,
                scaledSize: new google.maps.Size(pinSize.width, pinSize.height),
                anchor: new google.maps.Point(pinSize.width / 2, pinSize.height),
              }}
            />
          );
        })}

        <div className={selectedSpot ? styles.cardWrapper : `${styles.cardWrapper} ${styles.cardHidden}`}>
          {selectedSpot && (
            <>
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
                    {isCardLoading && selectedSpot?.id === spot.id ? (
                      <SpotCardSkeleton />
                    ) : (
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
                        isFavorite={isFavorite(spot.id)}
                        onFavoriteToggle={() => toggleFavorite(spot.id)}
                      />
                    )}
                  </div>
                ))}
                <div className={styles.spacer} />
              </div>

              {/* 横画面用のスクロールインジケーター（詳細ページの画像スクロール風） */}
              {isLandscape && displayCards.length > 1 && (
                <div className={styles.verticalIndicator}>
                  {displayCards.map((spot) => (
                    <div
                      key={spot.id}
                      className={`${styles.dot} ${selectedSpot.id === spot.id ? styles.activeDot : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // クリックで該当カードへスクロール
                        const el = cardRefs.current[spot.id];
                        if (el) {
                          isScrollingByCode.current = true;
                          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
                          setTimeout(() => {
                            isScrollingByCode.current = false;
                          }, 500);
                        }
                        setSelectedSpot(spot);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
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
