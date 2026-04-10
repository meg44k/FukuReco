'use client';

import styles from "./MapComponent.module.css"
import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from '@react-google-maps/api'
import { LocateFixed } from "lucide-react";
import { IconButton } from "@mui/material";
import { SpotCard } from "@/components/atoms/spotCard/SpotCard";
import { MapSpotData, MinimalSpotData } from "@/types/map";
import { panMapToSpot } from "@/lib/map/mapUtils";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

// マップ表示時の中心
const initCenter = {
  lat: 33.5902,
  lng: 130.4017,
};

type Props = {
  searchResults: MapSpotData[]; // 検索結果（詳細データあり）
  initialSpots: MinimalSpotData[]; // 初期表示は最小限のデータ配列を受け取る
}

export const MapComponent = ({ searchResults, initialSpots }: Props) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  // state管理
  const [selectedSpot, setSelectedSpot] = useState<null | MapSpotData>(null);  // 選択中の詳細データ
  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentPos, setCurrentPos] = useState<google.maps.LatLngLiteral | null>(null);

  // カード表示用リスト
  const [displayCards, setDisplayCards] = useState<MapSpotData[]>([]);
  const cardListRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const isScrollingByCode = useRef<boolean>(false); // プログラムによるスクロール中かどうかのフラグ
  const lastSelectedSource = useRef<'map' | 'scroll'>('map'); // 選択元の判定用フラグ

  // 検索結果がある場合、最初のスポットを選択状態にしてリストをセットする
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      lastSelectedSource.current = 'map';
      setDisplayCards(searchResults);
      setSelectedSpot(searchResults[0]);
    }
  }, [searchResults]);

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
        // コンテナの中央に最も近いカードを探す
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

    if (lastSelectedSource.current === 'scroll') {
      return; // ユーザーのスクロールによって選択された場合はスクロール処理をスキップ
    }

    // 現在見えているカードと選択されたカードが違えばスクロール
    const el = cardRefs.current[selectedSpot.id];
    if (el) {
      isScrollingByCode.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      
      // スクロール完了後にフラグを戻す（簡易的なタイマー）
      setTimeout(() => {
        isScrollingByCode.current = false;
      }, 500); 
    }
  }, [selectedSpot]);

  const options: google.maps.MapOptions = {
    mapId: "2180f9c8f0d419cfa3681583",
    disableDefaultUI: true,
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPos({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => console.error("位置情報取得失敗", error)
    );
  }, []);

  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // ピンクリック時に詳細データを取得
  const handlePinClick = async (minimalSpot: MinimalSpotData) => {
    // 1. すでに検索結果(displayCards)の中に詳細データがあれば、それを使う
    const alreadyFetched = displayCards.find(s => s.id === minimalSpot.id);
    if (alreadyFetched) {
      lastSelectedSource.current = 'map';
      setSelectedSpot(alreadyFetched);
      return;
    }

    // 2. なければ詳細をフェッチする
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`/api/spotcard?id=${minimalSpot.id}`);
      if (!response.ok) {
        throw new Error("詳細データの取得に失敗しました");
      }
      const detailData: MapSpotData = await response.json();
      
      // フェッチした単一のスポットをカードリストにセットして表示
      lastSelectedSource.current = 'map';
      setDisplayCards([detailData]);
      setSelectedSpot(detailData);
    } catch (error) {
      console.error(error);
      // エラー時のフォールバックとして最小限の情報を表示するか、エラーメッセージを表示する処理を入れることも可能
    } finally {
      setIsLoadingDetail(false);
    }
  };

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
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initCenter}
        zoom={14}
        options={options}
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
        {currentPos && (
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

        {/* 最小限のデータ(initialSpots)でピンを大量に描画 */}
        {initialSpots.map((spot) => (
          <Marker
            key={spot.id}
            position={spot.position}
            onClick={() => handlePinClick(spot)}
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
            </div>
          )}
        </div>

        {!selectedSpot && (
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