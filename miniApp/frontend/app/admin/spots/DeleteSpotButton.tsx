'use client'

import { IconButton, Tooltip } from '@mui/material';
import { Trash2 } from 'lucide-react';
import { deleteSpot } from './actions';
import { useState } from 'react';

interface DeleteSpotButtonProps {
  id: number;
  name: string;
}

export default function DeleteSpotButton({ id, name }: DeleteSpotButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`「${name}」を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
      try {
        setIsDeleting(true);
        await deleteSpot(id);
      } catch (error) {
        alert('削除に失敗しました。');
        console.error(error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <Tooltip title="削除">
      <IconButton 
        size="small" 
        sx={{ color: 'error.main', '&:hover': { bgcolor: '#fff1f2' } }}
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 size={18} />
      </IconButton>
    </Tooltip>
  );
}
