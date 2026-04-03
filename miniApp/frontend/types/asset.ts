export interface Asset {
    id: number; // 写真のID
    URL: string; // 写真のURL
    isPhoto: boolean; // 写真が画像か動画か True: 画像 False: 動画
    isPhotoGallery: boolean; // 写真ギャラリーに表示するかどうか
    galleryOrder?: number; // ギャラリーでの表示順
}