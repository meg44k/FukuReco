import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EditSpotForm from './EditSpotForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSpotPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. スポットデータの取得
  const { data: spot, error: spotError } = await supabase
    .from('spots')
    .select('*')
    .eq('id', id)
    .single();

  if (spotError || !spot) {
    notFound();
  }

  // 2. メニューデータの取得（画像URLも結合して取得）
  const { data: menus, error: menuError } = await supabase
    .from('menus')
    .select(`
      *,
      assets!asset_id (
        url
      )
    `)
    .eq('spot_id', id);

  // 3. アセット（画像）の取得
  const { data: assets, error: assetError } = await supabase
    .from('assets')
    .select('*')
    .eq('spot_id', id);

  return (
    <EditSpotForm 
      spot={spot} 
      menus={menus || []} 
      assets={assets || []} 
    />
  );
}
