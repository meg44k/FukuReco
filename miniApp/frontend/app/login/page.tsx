'use client'

import { 
  Box, 
  Button, 
  Container, 
  Paper, 
  TextField, 
  Typography, 
  Alert,
  Stack
} from '@mui/material';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { MapPin, Lock } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      bgcolor: '#f8f9fa' 
    }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e0e0e0', textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center" sx={{ mb: 4 }}>
            <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 2 }}>
              <MapPin color="white" size={32} />
            </Box>
            <Typography variant="h5" fontWeight="800">
              FukuReco Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              管理者アカウントでログインしてください
            </Typography>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>{error}</Alert>}

          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="outlined"
                autoComplete="email"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="outlined"
                autoComplete="current-password"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={<Lock size={18} />}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
