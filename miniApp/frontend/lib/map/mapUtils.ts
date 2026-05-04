/**
 * ズームレベルに応じた緯度オフセットを計算
 * 係数 0.00012 は、一般的なスマホ画面の高さ約10%分に相当
 */
export const calculateOffsetByZoom = (zoom: number) => 0.00012 * Math.pow(2, 20 - zoom);

/**
 * 指定した座標を表示領域に合わせて地図を移動
 */
export const panMapToSpot = (map: google.maps.Map, position: google.maps.LatLngLiteral, isLandscape: boolean = false) => {
  const projection = map.getProjection();
  if (!projection) return;

  const zoom = map.getZoom() ?? 15;
  const container = map.getDiv();
  const width = container.offsetWidth;
  const height = container.offsetHeight;

  // 1. ピンの現在の地理座標をピクセル座標（世界座標）に変換
  const worldPoint = projection.fromLatLngToPoint(position);
  if (!worldPoint) return;

  // 2. ズームレベルに応じたスケール
  const scale = Math.pow(2, zoom);

  // 3. 画面上の「理想のピン位置」から「画面中心」へのピクセル単位のズームに依存しないオフセットを計算
  let offsetX = 0;
  let offsetY = 0;

  if (isLandscape) {
    // 横画面: 横は3/4（右側）、縦は2/3（下寄り）
    // 画面中心(w/2, h/2)から見たオフセットを計算
    // 理想のピン位置 X = width * 0.75, Y = height * (2/3)
    offsetX = (width * 0.75) - (width / 2);
    offsetY = (height * (2 / 3)) - (height / 2);
  } else {
    // 縦画面: 横は半分、縦は中心より10%上 (height * 0.4)
    // 理想のピン位置 X = width * 0.5, Y = height * 0.4
    offsetX = 0;
    offsetY = (height * 0.4) - (height / 2);
  }

  // 4. ピクセルオフセットを地理座標系（世界座標）の差分に変換
  // X方向の移動: offset / scale
  const worldOffsetX = offsetX / scale;
  const worldOffsetY = offsetY / scale;

  // 5. 新しい中心点を計算
  // 理想の場所にピンを持ってくるために、マップの中心を「ピンの位置 - オフセット」に設定する
  const newCenterWorld = new google.maps.Point(
    worldPoint.x - worldOffsetX,
    worldPoint.y - worldOffsetY
  );

  const newCenterLatLng = projection.fromPointToLatLng(newCenterWorld);
  if (newCenterLatLng) {
    map.panTo(newCenterLatLng);
  }
};
