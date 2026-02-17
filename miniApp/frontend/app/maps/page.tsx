"use client";

import { useRef } from "react";
import Script from "next/script";

export default function Map() {

  const mapRef = useRef<HTMLDivElement | null>(null);
  const handleLoad = async () => {

    // ライブラリからインポート
    const { Map,InfoWindow } = (await google.maps.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;

    const { AdvancedMarkerElement } =
      (await google.maps.importLibrary(
        "marker"
      )) as google.maps.MarkerLibrary;

    if (!mapRef.current) return;

    const map = new Map(mapRef.current, {
      center: { lat: 33.5902, lng: 130.4017 },
      zoom: 15,
      mapId: "2180f9c8f0d419cfa3681583",
    });

    // 新しいピンの追加
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: 33.5915, lng: 130.4017 },
      title: "new spot",
      gmpClickable: true,
    });

    const infoWindow = new InfoWindow();
    // ピンのクリックリスナー
    marker.element.addEventListener('pointerenter', (event: any) => {
      // const { target } = domEvent;
      infoWindow.close();
      infoWindow.setContent('pointer enter');
      infoWindow.open({anchor: marker, map, });
      console.log('pointer enter');
    })

    marker.element.addEventListener('pointerleave', () => {
      infoWindow.close();
      console.log('pointer leave!');
    })
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&v=weekly`}
        strategy="afterInteractive"
        onLoad={handleLoad}
      />
      <div ref={mapRef} style={{ width: "100%", height: "100vh" }} />
    </>
  );
}
