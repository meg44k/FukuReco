export const calculateOffsetByZoom = (zoom: number) => 0.00018 * Math.pow(2, 20 - zoom);

export const panMapToSpot = (map: google.maps.Map, position: google.maps.LatLngLiteral) => {
  const offsetLat = calculateOffsetByZoom(map.getZoom() ?? 15);
  map.panTo(position);
  map.panTo({
    lat: position.lat - offsetLat,
    lng: position.lng,
  });
};
