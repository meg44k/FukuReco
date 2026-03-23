'use client'

import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Stack,
  IconButton,
  Button
} from '@mui/material';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const STATS = [
  { label: '総スポット数', value: '124', icon: <MapPin color="#3b82f6" />, color: '#eff6ff' },
  { label: '月間訪問者', value: '1,280', icon: <Users color="#10b981" />, color: '#ecfdf5' },
  { label: 'お気に入り数', value: '456', icon: <TrendingUp color="#f59e0b" />, color: '#fffbeb' },
  { label: '平均滞在時間', value: '45m', icon: <Clock color="#8b5cf6" />, color: '#f5f3ff' },
];

const RECENT_SPOTS = [
  { name: '博多一風堂 総本店', type: '飲食店', date: '2024-03-20', status: '公開中' },
  { name: '大濠公園', type: '観光地', date: '2024-03-19', status: '公開中' },
  { name: '福岡城跡', type: '観光地', date: '2024-03-18', status: '下書き' },
];

export default function AdminDashboard() {
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h5" fontWeight="800" gutterBottom>
            ダッシュボード
          </Typography>
          <Typography variant="body2" color="text.secondary">
            本日のFukuRecoの状況をひと目で確認できます
          </Typography>
        </Box>
        <Link href="/admin/spots/new" passHref style={{ textDecoration: 'none' }}>
          <Button 
            variant="contained" 
            startIcon={<Plus size={18} />}
            sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 'bold' }}
          >
            スポットを追加
          </Button>
        </Link>
      </Box>

      {/* 統計カード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STATS.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="500" gutterBottom>
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" fontWeight="800">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: stat.color }}>
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* 最近追加されたスポット */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="700">最近追加されたスポット</Typography>
              <Button size="small" endIcon={<ChevronRight size={16} />}>すべて表示</Button>
            </Box>
            <Stack spacing={2}>
              {RECENT_SPOTS.map((spot, i) => (
                <Box 
                  key={i}
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    border: '1px solid #f0f0f0',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#fcfcfc' }
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ p: 1, bgcolor: '#f0f4ff', borderRadius: 1.5 }}>
                      <MapPin size={20} color="#3b82f6" />
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight="600">{spot.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{spot.type} • {spot.date}</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        px: 1, 
                        py: 0.5, 
                        borderRadius: 1, 
                        bgcolor: spot.status === '公開中' ? '#ecfdf5' : '#f3f4f6',
                        color: spot.status === '公開中' ? '#10b981' : '#6b7280',
                        fontWeight: '600'
                      }}
                    >
                      {spot.status}
                    </Typography>
                    <IconButton size="small"><ChevronRight size={18} /></IconButton>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* 役立つショートカット */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="700" gutterBottom>ショートカット</Typography>
            <Stack spacing={1} sx={{ mt: 2 }}>
              <Button fullWidth variant="outlined" sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}>
                営業時間の更新
              </Button>
              <Button fullWidth variant="outlined" sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}>
                画像の一括アップロード
              </Button>
              <Button fullWidth variant="outlined" sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}>
                クチコミの返信
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
