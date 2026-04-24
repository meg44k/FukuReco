export const calculateOffsetByZoom = (zoom: number) => 0.00010 * Math.pow(2, 20 - zoom);

export const panMapToSpot = (map: google.maps.Map, position: google.maps.LatLngLiteral) => {
  const zoom = map.getZoom() ?? 15;
  const projection = map.getProjection();

  // レスポンシブな実装: 画面の縦幅(window.innerHeight)に基づいてオフセットを計算
  if (projection && typeof window !== 'undefined') {
    const scale = Math.pow(2, zoom);
    const worldCoordinate = projection.fromLatLngToPoint(new google.maps.LatLng(position));
    
    if (worldCoordinate) {
      // 画面の縦幅の1/4分、マップの中心を南（下）にずらす
      // => 結果として対象のピンが画面の中央より上部（1/4の位置）に表示される
      const pixelOffsetY = window.innerHeight * 0.1;
      
      // ピクセル数を現在のズームレベルにおけるワールド座標のオフセットに変換
      const worldOffsetY = pixelOffsetY / scale;
      
      // y座標を加算して中心を南へ移動
      const newCenterPoint = new google.maps.Point(
        worldCoordinate.x,
        worldCoordinate.y + worldOffsetY
      );
      
      const newCenterLatLng = projection.fromPointToLatLng(newCenterPoint);
      if (newCenterLatLng) {
        map.panTo(newCenterLatLng);
        return;
      }
    }
  }

  // フォールバック（以前の固定計算による実装）
  const offsetLat = calculateOffsetByZoom(zoom);
  map.panTo({
    lat: position.lat - offsetLat,
    lng: position.lng,
  });
};
