"use client";

import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Grid, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  FormControlLabel, 
  Checkbox,
  Alert,
  Snackbar
} from '@mui/material';
import { createClient } from '@/lib/supabase/client';

const pinOptions = [
  { label: 'Food (飲食店)', value: 'FoodPin.svg' },
  { label: 'Chair (休憩所)', value: 'ChairPin.svg' },
  { label: 'Camera (観光スポット)', value: 'CameraPin.svg' },
  { label: 'Gift (お土産)', value: 'GiftPin.svg' },
];

const spotKindOptions = [
  { label: '飲食店 (Shop)', value: 'shop' },
  { label: '観光地 (Spot)', value: 'spot' },
];

export default function AdminPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    spotName: '',
    spotKind: 'shop',
    pinKind: 'FoodPin.svg',
    imageSrc: '',
    catchphrase: '',
    description: '',
    editorialComment: '',
    price1: '',
    price2: '',
    address: '',
    latitude: '',
    longitude: '',
    isOpen: true,
    tags: '', // Comma separated
    detailURL: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement & { checked?: boolean };
    setFormData(prev => ({
      ...prev,
      [name as string]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: submitError } = await supabase
        .from('spots')
        .insert([
          {
            name: formData.spotName,
            kind: formData.spotKind,
            pin_kind: formData.pinKind,
            image_url: formData.imageSrc,
            catchphrase: formData.catchphrase,
            description: formData.description,
            editorial_comment: formData.editorialComment,
            price1: formData.price1,
            price2: formData.price2,
            address: formData.address,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            is_open: formData.isOpen,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
            detail_url: formData.detailURL,
          }
        ]);

      if (submitError) throw submitError;

      setSuccess(true);
      // Reset form
      setFormData({
        spotName: '',
        spotKind: 'shop',
        pinKind: 'FoodPin.svg',
        imageSrc: '',
        catchphrase: '',
        description: '',
        editorialComment: '',
        price1: '',
        price2: '',
        address: '',
        latitude: '',
        longitude: '',
        isOpen: true,
        tags: '',
        detailURL: '',
      });
    } catch (err: any) {
      console.error('Error inserting data:', err);
      setError(err.message || 'データの登録に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        スポット管理 (Admin)
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        新しい飲食店や観光スポットをSupabaseに登録します。
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                required
                fullWidth
                label="スポット名"
                name="spotName"
                value={formData.spotName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>種類</InputLabel>
                <Select
                  name="spotKind"
                  value={formData.spotKind}
                  label="種類"
                  onChange={handleChange as any}
                >
                  {spotKindOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>ピンの種類</InputLabel>
                <Select
                  name="pinKind"
                  value={formData.pinKind}
                  label="ピンの種類"
                  onChange={handleChange as any}
                >
                  {pinOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    name="isOpen" 
                    checked={formData.isOpen} 
                    onChange={handleChange as any} 
                  />
                }
                label="営業中"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="画像URL"
                name="imageSrc"
                value={formData.imageSrc}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="キャッチフレーズ"
                name="catchphrase"
                value={formData.catchphrase}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="説明 (お店のコメント)"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="編集部の評価"
                name="editorialComment"
                value={formData.editorialComment}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="価格帯1 (ランチ等)"
                name="price1"
                value={formData.price1}
                onChange={handleChange}
                placeholder="￥1,000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="価格帯2 (ディナー等)"
                name="price2"
                value={formData.price2}
                onChange={handleChange}
                placeholder="￥2,000～"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="住所"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="緯度 (Latitude)"
                name="latitude"
                type="number"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="33.5902"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="経度 (Longitude)"
                name="longitude"
                type="number"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="130.4017"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="タグ (カンマ区切り)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="ラーメン, 豚骨, 禁煙"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="詳細URL"
                name="detailURL"
                value={formData.detailURL}
                onChange={handleChange}
                placeholder="/spots/restaurant"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? '登録中...' : '登録する'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          スポットを正常に登録しました！
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
