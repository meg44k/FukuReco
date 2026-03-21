export interface user {
    id: string; // LINEのID
    name: string; // LINEの名前
    createdAt: string;
    role: "admin" | "staff" | "member"; // 権限: admin: 開発者 > staff: お店の人 > member: 一般ユーザ
}