/**
 * ズームレベルに応じた緯度オフセットを計算
 * 係数 0.00012 は、一般的なスマホ画面の高さ約10%分に相当
 */
export const calculateOffsetByZoom = (zoom: number) => 0.00012 * Math.pow(2, 20 - zoom);

/**
 * 指定した座標を、画面中央から10%上に表示するように地図を移動
 */
export const panMapToSpot = (map: google.maps.Map, position: google.maps.LatLngLiteral, targetZoom?: number) => {
  const zoom = targetZoom ?? map.getZoom() ?? 15;
  const offsetLat = calculateOffsetByZoom(zoom);

  // 地図の中心を「ピンの座標より少し南（下）」に設定することで、
  //相対的にピンが「中央より北（上）」に表示されるようにする
  map.panTo({
    lat: position.lat - offsetLat,
    lng: position.lng,
  });
};
