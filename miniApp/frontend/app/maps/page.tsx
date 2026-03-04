'use client';

import styles from "./page.module.css"
import { useEffect, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api'
import { LocateFixed } from "lucide-react";
import { IconButton } from "@mui/material";
import { SpotCard } from "@/components/atoms/spotCard/SpotCard";

// 将来的に、typesディレクトリに移動
type SpotKinds = "shop" | "spot";
type SpotData = {
  id: number;
  spotKind: SpotKinds;
  pinKind: string;
  spotName: string;
  isOpen: boolean;
  imageSrc: string;
  spotTags: string[];
  detailURL: string;
  price1?: string;
  price2?: string;
  position: google.maps.LatLngLiteral;
}

const containerStyle = {
  width: "100%",
  height: "100vh",
};

// マップ表示時の中心
// ユーザの現在地を取得して使用
const initCenter = {
  lat: 33.5902,
  lng: 130.4017,
};

export default function Map() {
  // Google MapsスクリプトをReact経由で読み込む
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  // state管理
  const [selectedSpot, setSelectedSpot] = useState<null | SpotData>(null);  // 選択店舗
  const mapRef = useRef<google.maps.Map | null>(null);    // googlemapインスタンス
  const [currentPos, setCurrentPos] = useState<google.maps.LatLngLiteral | null>(null);   // ユーザの現在地座標
  const [directions, setDirections] = useState<any | null>(null);   // 目的地までのルート情報
  const [showRoute, setShowRoute] = useState<boolean>(false);   // ルートを表示するかのフラグ


  // テスト用データ
  const spots: SpotData[] = [
    {
      id: 1,
      spotKind: "shop" as SpotKinds,
      pinKind: "FoodPin.svg",
      spotName: "なんとかラーメン",
      isOpen: true,
      imageSrc: "/sampleImage.png",
      spotTags: ["ラーメン", "豚骨", "待ち時間少", "禁煙"],
      detailURL: "/spots/restaurant",
      price1: "￥:1500",
      price2: "￥:200~3000",
      position: { lat: 33.5905, lng: 130.3817 },
    },
    {
      id: 2,
      spotKind: "shop" as SpotKinds,
      pinKind: "ChairPin.svg",
      spotName: "なんとかなるうどん",
      isOpen: true,
      imageSrc: "/sampleImage.png",
      spotTags: ["うどん", "地元人気", "待ち時間少", "禁煙"],
      detailURL: "/spots/restaurant",
      price1: "￥:1500",
      position: { lat: 33.5900, lng: 130.3998 },
    },
    {
      id: 3,
      spotKind: "shop" as SpotKinds,
      pinKind: "CameraPin.svg",
      spotName: "なんとかもつ鍋",
      isOpen: true,
      imageSrc: "/sampleImage.png",
      spotTags: ["ラーメン", "豚骨", "待ち時間少", "禁煙"],
      detailURL: "/spots/restaurant",
      price1: "￥:1500",
      price2: "￥:200~3000",
      position: { lat: 33.5905, lng: 130.3857 },
    },
    {
      id: 4,
      spotKind: "shop" as SpotKinds,
      pinKind: "GiftPin.svg",
      spotName: "なんとかなる明太子",
      isOpen: true,
      imageSrc: "/sampleImage.png",
      spotTags: ["うどん", "地元人気", "待ち時間少", "禁煙"],
      detailURL: "/spots/restaurant",
      price1: "￥:1500",
      position: { lat: 33.5900, lng: 130.3958 },
    },
  ];

  // マップ表示のオプション
  const options: google.maps.MapOptions = {
    mapId: "2180f9c8f0d419cfa3681583",
    disableDefaultUI: true,
  };

  // ユーザの現在地取得
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPos({ lat: position.coords.latitude, lng: position.coords.longitude, });
      },
      (error) => {
        console.error("位置情報取得失敗", error);
      }
    );
  }, []);

  // ピンクリックハンドラ
  const handlePinClick = (spot: SpotData) => {
    setSelectedSpot(prev => {
      if (prev?.id === spot.id) return null;
      setDirections(null);
      setShowRoute(false);
      return spot; 
    });
  };

  // ピン選択変更時処理
  useEffect(() => {
    if (!selectedSpot || !mapRef.current) return;

    const map = mapRef.current;
    // ズームに応じたオフセットを取得
    const offsetLat = calculateOffsetByZoom(map.getZoom() ?? 15)
    map.panTo(selectedSpot.position);
    mapRef.current.panTo({
      lat: selectedSpot.position.lat - offsetLat,
      lng: selectedSpot.position.lng,
    });
  }, [selectedSpot]);

  // ズーム度合いに対してオフセットを返す関数
  const calculateOffsetByZoom = (zoom: number) => {
    return 0.00018 * Math.pow(2, 20 - zoom);
  };

  // ルート用コールバック関数
  const directionsCallBack = (result: any) => {
    if (result !== null && result.status === "OK"){
      setDirections(result)
    }
  }

  // マップの中心を現在地に戻す関数
  const handleBackToCurrent = () => {
    if (mapRef.current && currentPos) {
      mapRef.current.panTo(currentPos);
      mapRef.current.setZoom(15);
    }
  };

  // スクリプトが読み込まれるまで待つ
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
        }}
        onClick={() => {
          setSelectedSpot(null);
        }}
      >
        {currentPos && selectedSpot && showRoute && !directions && (
          // 現在地からルートを計算してdirectionaを更新
          <DirectionsService
            options={{
              origin: currentPos,
              destination: selectedSpot?.position,
              travelMode: google.maps.TravelMode.TRANSIT,
            }}
            callback={directionsCallBack}
            />
        )}

        {directions && (
          <DirectionsRenderer
            options={{
              directions: directions,
              suppressMarkers: false,
            }}
          />
        )}

        {/* 現在地のマーカー */}
        {currentPos && (
          <Marker
            position={currentPos}
            icon={{
              // Google風の青いドットを再現
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: "#4285F4",
              fillOpacity: 1,
              scale: 8,
              strokeColor: "white",
              strokeWeight: 2,
            }}
          />
        )}

        {/* マーカー配置 */}
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={spot.position}
            onClick={() => handlePinClick(spot)}
            icon={{
              // 仮として、spotsデータにアイコンの
              url: spot.pinKind,
              scaledSize: new google.maps.Size(
                selectedSpot?.id === spot.id ? 80 :50,
                selectedSpot?.id === spot.id ? 80 :50
              ),
            }}
          />
        ))}

        {/* カードを表示 */}
        <div className={
          selectedSpot
            ? styles.cardWrapper
            : `${styles.cardWrapper} ${styles.cardHidden}`
        }>
          {selectedSpot && 
            <div className={styles.cardWrapper}>
              <SpotCard
                spotKind={selectedSpot.spotKind}
                spotName={selectedSpot.spotName}
                isOpen={selectedSpot.isOpen}
                imageSrc={selectedSpot.imageSrc}
                spotTags={selectedSpot.spotTags}
                detailURL={selectedSpot.detailURL}
                price1={selectedSpot.price1}
                price2={selectedSpot.price2}
                onCloseClick={() => setSelectedSpot(null)}
                onDetailClick={() => {}}
                onRouteClick={() => setShowRoute(true)}
              />
            </div>
        }
        </div>

        {/* 現在地に戻るボタン */}
        <div className={styles.backToCurrentBtn}>
          {!selectedSpot &&
            <IconButton onClick={handleBackToCurrent}><LocateFixed/></IconButton>
          }
        </div>
      </GoogleMap>
    </div>
  );
}
