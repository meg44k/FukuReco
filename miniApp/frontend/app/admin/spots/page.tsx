import { createClient } from '@/lib/supabase/server';
import { 
  Box, 
  Button, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  Tooltip
} from '@mui/material';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin
} from 'lucide-react';
import SpotActions from './SpotActions';

export default async function AdminSpotsPage() {
  const supabase = await createClient();
  const { data: spots, error } = await supabase
    .from('spots')
    .select('*')
    .order('created_at', { ascending: false });

  const getPlaceTypeLabel = (type: string) => {
    switch (type) {
      case 'restaurant': return { label: '飲食店', color: 'primary' as const };
      case 'sightseeing': return { label: '観光地', color: 'secondary' as const };
      case 'shop': return { label: 'ショップ', color: 'success' as const };
      case 'resting': return { label: '休憩所', color: 'warning' as const };
      default: return { label: type, color: 'default' as const };
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h5" fontWeight="800" gutterBottom>
            スポット管理
          </Typography>
          <Typography variant="body2" color="text.secondary">
            登録されているすべてのスポット情報を管理・編集できます
          </Typography>
        </Box>
        <Link href="/admin/spots/new" passHref style={{ textDecoration: 'none' }}>
          <Button 
            variant="contained" 
            startIcon={<Plus size={18} />}
            sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 'bold' }}
          >
            新規登録
          </Button>
        </Link>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
        {/* ツールバー */}
        <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="スポット名、住所で検索..."
            sx={{ width: 320 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#94a3b8" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: '#f8f9fa' }
            }}
          />
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<Filter size={16} />}
            sx={{ borderRadius: 2, color: 'text.secondary', borderColor: '#e2e8f0' }}
          >
            フィルタ
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" color="text.secondary" fontWeight="500">
            全 {spots?.length || 0} 件のスポット
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#f8f9fa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>スポット名</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>種別</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>所在地</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>登録日</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>ステータス</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {error ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="error">エラーが発生しました: {error.message}</Typography>
                  </TableCell>
                </TableRow>
              ) : spots && spots.length > 0 ? (
                spots.map((spot) => {
                  const typeInfo = getPlaceTypeLabel(spot.place_type);
                  return (
                    <TableRow key={spot.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 1.5 }}>
                            <MapPin size={18} color="#64748b" />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="700">{spot.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>ID: {spot.id}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={typeInfo.label} 
                          size="small" 
                          color={typeInfo.color}
                          variant="outlined"
                          sx={{ fontWeight: '600', borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {spot.address}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" suppressHydrationWarning>
                          {new Date(spot.created_at).toISOString().split('T')[0].replace(/-/g, '/')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label="公開中" 
                          size="small" 
                          sx={{ bgcolor: '#ecfdf5', color: '#10b981', fontWeight: 'bold', borderRadius: 1.5 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <SpotActions spotId={spot.id} spotName={spot.name} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">登録されているスポットはありません</Typography>
                    <Link href="/admin/spots/new" passHref style={{ textDecoration: 'none' }}>
                      <Button 
                        variant="text" 
                        sx={{ mt: 1 }}
                      >
                        最初のスポットを登録する
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
