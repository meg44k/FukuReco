'use client'

import { Stack, Tooltip, IconButton } from '@mui/material';
import { Edit3, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import DeleteSpotButton from './DeleteSpotButton';

interface SpotActionsProps {
  spotId: number;
  spotName: string;
}

export default function SpotActions({ spotId, spotName }: SpotActionsProps) {
  return (
    <Stack direction="row" spacing={1} justifyContent="flex-end">
      <Tooltip title="編集">
        <IconButton 
          component={Link}
          href={`/admin/spots/${spotId}/edit`}
          size="small" 
          sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}
        >
          <Edit3 size={18} />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="詳細を見る">
        <IconButton 
          size="small" 
          sx={{ color: 'text.secondary' }}
          onClick={() => window.open(`/spots/restaurant/${spotId}`, '_blank')}
        >
          <ExternalLink size={18} />
        </IconButton>
      </Tooltip>
      
      <DeleteSpotButton id={spotId} name={spotName} />
    </Stack>
  );
}
