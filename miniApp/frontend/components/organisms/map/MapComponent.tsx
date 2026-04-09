'use client';

import styles from "./MapComponent.module.css"
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
import { MapSpotData, MinimalSpotData } from "@/types/map";

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
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [showRoute, setShowRoute] = useState<boolean>(false);

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
    if (selectedSpot?.id === minimalSpot.id) {
      setSelectedSpot(null);
      return;
    }

    // 1. すでに検索結果(searchResults)の中に詳細データがあれば、それを使う
    const alreadyFetched = searchResults.find(s => s.id === minimalSpot.id);
    if (alreadyFetched) {
      setSelectedSpot(alreadyFetched);
      setDirections(null);
      setShowRoute(false);
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
      setSelectedSpot(detailData);
    } catch (error) {
      console.error(error);
      // エラー時のフォールバックとして最小限の情報を表示するか、エラーメッセージを表示する処理を入れることも可能
    } finally {
      setIsLoadingDetail(false);
    }

    setDirections(null);
    setShowRoute(false);
  };

  const calculateOffsetByZoom = (zoom: number) => 0.00018 * Math.pow(2, 20 - zoom);

  useEffect(() => {
    if (!selectedSpot || !mapRef.current) return;
    const map = mapRef.current;
    const offsetLat = calculateOffsetByZoom(map.getZoom() ?? 15);
    map.panTo(selectedSpot.position);
    map.panTo({
      lat: selectedSpot.position.lat - offsetLat,
      lng: selectedSpot.position.lng,
    });
  }, [selectedSpot]);

  const directionsCallBack = (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
    if (result !== null && status === "OK") setDirections(result);
  }

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
        onLoad={(map) => { mapRef.current = map; }}
        onClick={() => setSelectedSpot(null)}
      >
        {currentPos && selectedSpot && showRoute && !directions && (
          <DirectionsService
            options={{
              origin: currentPos,
              destination: selectedSpot.position,
              travelMode: google.maps.TravelMode.TRANSIT,
            }}
            callback={directionsCallBack}
          />
        )}

        {directions && <DirectionsRenderer options={{ directions, suppressMarkers: false }} />}

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
                updatedAt={selectedSpot.updatedAt}
                onCloseClick={() => setSelectedSpot(null)}
                onDetailClick={() => {}}
                onRouteClick={() => setShowRoute(true)}
              />
            </div>
          )}
        </div>

        <div className={styles.backToCurrentBtn}>
          {!selectedSpot && <IconButton onClick={handleBackToCurrent}><LocateFixed /></IconButton>}
        </div>
      </GoogleMap>
    </div>
  );
};

export default MapComponent;