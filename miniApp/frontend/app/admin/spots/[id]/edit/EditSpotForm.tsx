'use client'

import { 
  Box, 
  Button, 
  Grid, 
  TextField, 
  Typography, 
  Paper,
  MenuItem as SelectMenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Stack,
  Breadcrumbs,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material';
import { useState, useRef } from 'react';
import { updateSpot } from '../../actions'; // updateSpot アクションを後で作る
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Clock, 
  Phone, 
  Info, 
  Image as ImageIcon, 
  X, 
  Plus, 
  UtensilsCrossed,
  Trash2,
  Star
} from 'lucide-react';
import Link from 'next/link';

const PLACE_TYPES = [
  { value: 'restaurant', label: '飲食店 (Restaurant)' },
  { value: 'sightseeing', label: '観光地 (Sightseeing)' },
  { value: 'shop', label: 'ショップ (Shop)' },
  { value: 'resting', label: '休憩スポット (Resting Spot)' },
];

interface MenuFormData {
  id: string; // クライアント側での識別用、既存データの場合はDBのID（数値）
  dbId?: number; // DBの実際のID
  name: string;
  price: string;
  detail: string;
  isRecommend: boolean;
  image: File | null;
  imagePreview: string | null;
  existingImageUrl?: string | null;
}

interface EditSpotFormProps {
  spot: any;
  menus: any[];
  assets: any[];
}

export default function EditSpotForm({ spot, menus: initialMenus, assets }: EditSpotFormProps) {
  const [placeType, setPlaceType] = useState(spot.place_type);
  
  // メイン画像の初期表示
  const mainAsset = assets.find(a => a.is_photo);
  const [imagePreview, setImagePreview] = useState<string | null>(mainAsset?.url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // メニューステートの初期化
  const [menus, setMenus] = useState<MenuFormData[]>(
    initialMenus.map(m => ({
      id: m.id.toString(),
      dbId: m.id,
      name: m.name || '',
      price: m.price?.toString() || '',
      detail: m.detail || '',
      isRecommend: m.is_recommend || false,
      image: null,
      imagePreview: null,
      existingImageUrl: m.assets?.url // page.tsxで結合して取得したassets(url)をセット
    }))
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addMenu = () => {
    setMenus([
      ...menus,
      {
        id: Math.random().toString(36).substring(7),
        name: '',
        price: '',
        detail: '',
        isRecommend: false,
        image: null,
        imagePreview: null
      }
    ]);
  };

  const removeMenu = (id: string) => {
    setMenus(menus.filter(m => m.id !== id));
  };

  const updateMenuField = (id: string, field: keyof MenuFormData, value: any) => {
    setMenus(menus.map(m => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    }));
  };

  const handleMenuImageChange = (id: string, file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMenuField(id, 'imagePreview', reader.result as string);
        updateMenuField(id, 'image', file);
      };
      reader.readAsDataURL(file);
    } else {
      updateMenuField(id, 'imagePreview', null);
      updateMenuField(id, 'image', null);
      updateMenuField(id, 'existingImageUrl', null);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link href="/admin" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}>ダッシュボード</Link>
          <Link href="/admin/spots" style={{ color: 'inherit', textDecoration: 'none', fontSize: '0.875rem' }}>スポット管理</Link>
          <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>スポット編集</Typography>
        </Breadcrumbs>
        
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="800">
            スポットを編集: {spot.name}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link href="/admin/spots" passHref style={{ textDecoration: 'none' }}>
              <Button 
                variant="outlined"
                startIcon={<ArrowLeft size={18} />}
                sx={{ borderRadius: 2, px: 3, borderColor: '#e2e8f0', color: 'text.secondary' }}
              >
                キャンセル
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Box>
      
      <form action={updateSpot}>
        <input type="hidden" name="id" value={spot.id} />
        
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={4}>
              {/* 1. 基本情報 */}
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box sx={{ p: 1, bgcolor: 'primary.lighter', borderRadius: 1.5, color: 'primary.main' }}>
                    <Info size={20} />
                  </Box>
                  <Typography variant="h6" fontWeight="700">基本情報</Typography>
                </Stack>
                
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="店舗・スポット名"
                      name="name"
                      defaultValue={spot.name}
                      required
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid size={12}>
                    <FormControl fullWidth>
                      <InputLabel id="place-type-label">スポット種別</InputLabel>
                      <Select
                        labelId="place-type-label"
                        label="スポット種別"
                        name="place_type"
                        value={placeType}
                        onChange={(e) => setPlaceType(e.target.value)}
                        required
                        sx={{ borderRadius: 2 }}
                      >
                        {PLACE_TYPES.map((type) => (
                          <SelectMenuItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectMenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="キャッチフレーズ"
                      name="catchphrase"
                      defaultValue={spot.catchphrase}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="フクレコの一言コメント"
                      name="fukureko_comment"
                      defaultValue={spot.fukureko_comment}
                      variant="outlined"
                      multiline
                      rows={3}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* 2. ロケーション */}
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box sx={{ p: 1, bgcolor: '#fef3c7', borderRadius: 1.5, color: '#f59e0b' }}>
                    <MapPin size={20} />
                  </Box>
                  <Typography variant="h6" fontWeight="700">ロケーション・アクセス</Typography>
                </Stack>

                <Grid container spacing={3}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="住所"
                      name="address"
                      defaultValue={spot.address}
                      required
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="最寄り駅"
                      name="nearest_station"
                      defaultValue={spot.nearest_station}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="交通アクセス"
                      name="distance_from_transit"
                      defaultValue={spot.distance_from_transit}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* 5. メニュー情報 */}
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: '#fce7f3', color: '#db2777', borderRadius: 1.5 }}>
                      <UtensilsCrossed size={20} />
                    </Box>
                    <Typography variant="h6" fontWeight="700">メニュー設定</Typography>
                  </Stack>
                  <Button 
                    variant="outlined" 
                    startIcon={<Plus size={16} />}
                    onClick={addMenu}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    メニューを追加
                  </Button>
                </Stack>

                <Stack spacing={3}>
                  {menus.map((menu, index) => (
                    <Box 
                      key={menu.id} 
                      sx={{ 
                        p: 2, 
                        border: '1px solid #f1f5f9', 
                        borderRadius: 2,
                        bgcolor: menu.isRecommend ? '#fffbeb' : '#ffffff',
                        position: 'relative',
                        borderLeft: menu.isRecommend ? '4px solid #f59e0b' : '1px solid #f1f5f9'
                      }}
                    >
                      <IconButton 
                        onClick={() => removeMenu(menu.id)}
                        sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
                        size="small"
                      >
                        <Trash2 size={18} />
                      </IconButton>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Box 
                            onClick={() => document.getElementById(`menu-file-${menu.id}`)?.click()}
                            sx={{ 
                              width: '100%', 
                              aspectRatio: '1/1', 
                              border: '1px dashed #cbd5e1', 
                              borderRadius: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              bgcolor: '#f8fafc'
                            }}
                          >
                            {menu.imagePreview ? (
                              <Box component="img" src={menu.imagePreview} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : menu.existingImageUrl ? (
                              <Box component="img" src={menu.existingImageUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <ImageIcon size={24} color="#94a3b8" />
                            )}
                          </Box>
                          <input 
                            id={`menu-file-${menu.id}`}
                            type="file" 
                            name={`menu_image_${index}`}
                            accept="image/*"
                            hidden
                            onChange={(e) => handleMenuImageChange(menu.id, e.target.files?.[0] || null)}
                          />
                          <input type="hidden" name={`menu_existing_image_${index}`} value={menu.existingImageUrl || ''} />
                          <input type="hidden" name={`menu_db_id_${index}`} value={menu.dbId || ''} />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 9 }}>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={2}>
                              <TextField
                                fullWidth
                                size="small"
                                label="メニュー名"
                                name={`menu_name_${index}`}
                                value={menu.name}
                                onChange={(e) => updateMenuField(menu.id, 'name', e.target.value)}
                                required
                              />
                              <TextField
                                sx={{ width: 200 }}
                                size="small"
                                label="価格"
                                name={`menu_price_${index}`}
                                type="number"
                                value={menu.price}
                                onChange={(e) => updateMenuField(menu.id, 'price', e.target.value)}
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">¥</InputAdornment>,
                                }}
                              />
                            </Stack>
                            <TextField
                              fullWidth
                              size="small"
                              label="説明文"
                              name={`menu_detail_${index}`}
                              multiline
                              rows={2}
                              value={menu.detail}
                              onChange={(e) => updateMenuField(menu.id, 'detail', e.target.value)}
                            />
                            <FormControlLabel
                              control={
                                <Switch 
                                  size="small"
                                  name={`menu_recommend_${index}`}
                                  checked={menu.isRecommend}
                                  onChange={(e) => updateMenuField(menu.id, 'isRecommend', e.target.checked)}
                                />
                              }
                              label={
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography variant="body2">おすすめ</Typography>
                                  {menu.isRecommend && <Star size={14} color="#f59e0b" fill="#f59e0b" />}
                                </Stack>
                              }
                            />
                            <input type="hidden" name={`menu_recommend_val_${index}`} value={menu.isRecommend ? 'true' : 'false'} />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Stack>
                <input type="hidden" name="menu_count" value={menus.length} />
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={4}>
              {/* 写真アップロード */}
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box sx={{ p: 1, bgcolor: '#dbeafe', color: '#2563eb', borderRadius: 1.5 }}>
                    <ImageIcon size={20} />
                  </Box>
                  <Typography variant="h6" fontWeight="700">スポット写真</Typography>
                </Stack>

                <Box 
                  sx={{ 
                    border: '2px dashed #e2e8f0', 
                    borderRadius: 3, 
                    p: 2, 
                    textAlign: 'center',
                    bgcolor: '#f8fafc',
                    position: 'relative',
                    minHeight: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {imagePreview ? (
                    <>
                      <Box component="img" src={imagePreview} sx={{ width: '100%', height: 'auto', borderRadius: 2, maxHeight: 300, objectFit: 'cover' }} />
                      <IconButton 
                        onClick={removeImage}
                        sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                        size="small"
                      >
                        <X size={16} />
                      </IconButton>
                    </>
                  ) : (
                    <Stack spacing={1} alignItems="center">
                      <ImageIcon size={40} color="#94a3b8" />
                      <Typography variant="body2" color="text.secondary">画像をアップロード</Typography>
                      <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()}>ファイルを選択</Button>
                    </Stack>
                  )}
                  <input type="file" name="image" accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} />
                  <input type="hidden" name="existing_image_url" value={mainAsset?.url || ''} />
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box sx={{ p: 1, bgcolor: '#ecfdf5', borderRadius: 1.5, color: '#10b981' }}>
                    <Clock size={20} />
                  </Box>
                  <Typography variant="h6" fontWeight="700">営業詳細</Typography>
                </Stack>
                <Stack spacing={3}>
                  <TextField fullWidth label="営業時間" name="business_hours" defaultValue={spot.business_hours} variant="outlined" multiline rows={2} />
                  <TextField fullWidth label="定休日" name="closed_days" defaultValue={spot.closed_days} variant="outlined" />
                  <TextField fullWidth label="滞在時間目安" name="stay_duration" defaultValue={spot.stay_duration} variant="outlined" />
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box sx={{ p: 1, bgcolor: '#f5f3ff', borderRadius: 1.5, color: '#8b5cf6' }}>
                    <Phone size={20} />
                  </Box>
                  <Typography variant="h6" fontWeight="700">連絡先・その他</Typography>
                </Stack>
                <Stack spacing={3}>
                  <TextField fullWidth label="電話番号" name="phone_number" defaultValue={spot.phone_number} variant="outlined" />
                  <TextField fullWidth label="平均予算" name="average_budget" defaultValue={spot.average_budget} variant="outlined" InputProps={{ startAdornment: <InputAdornment position="start">¥</InputAdornment> }} />
                  <TextField fullWidth label="公式サイト URL" name="website_url" defaultValue={spot.website_url} type="url" variant="outlined" />
                </Stack>
              </Paper>

              <Box sx={{ position: 'sticky', top: 100 }}>
                <Paper elevation={4} sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.main', color: 'white' }}>
                  <Button type="submit" fullWidth variant="contained" color="inherit" startIcon={<Save size={18} />} sx={{ py: 1.5, borderRadius: 2, fontWeight: '800', color: 'primary.main', bgcolor: 'white' }}>
                    変更を保存する
                  </Button>
                </Paper>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
