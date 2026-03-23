'use server'

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function createSpot(formData: FormData) {
  const supabase = await createClient();

  // デバッグ用: 受信データの確認
  console.log('--- createSpot Action Start ---');
  console.log('Name:', formData.get('name'));
  const imageFile = formData.get('image') as File;
  console.log('Main image file info:', imageFile ? { name: imageFile.name, size: imageFile.size, type: imageFile.type } : 'No file');

  // --- 1. スポットメイン画像のアップロード準備 ---
  let imageUrl = null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `spots/${fileName}`;

    console.log('Uploading main image:', filePath, 'Size:', imageFile.size, 'Type:', imageFile.type);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('spot-images')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Main image upload error:', uploadError);
    } else {
      console.log('Main image upload success:', uploadData);
      const { data: { publicUrl } } = supabase.storage
        .from('spot-images')
        .getPublicUrl(filePath);
      imageUrl = publicUrl;
      console.log('Public URL:', imageUrl);
    }
  }

  // --- 2. スポット本体データの登録 ---
  const spotData: any = {
    name: formData.get('name') as string,
    place_type: formData.get('place_type') as string,
    catchphrase: formData.get('catchphrase') as string,
    address: formData.get('address') as string,
    nearest_station: formData.get('nearest_station') as string,
    distance_from_transit: formData.get('distance_from_transit') as string,
    stay_duration: formData.get('stay_duration') as string,
    fukureko_comment: formData.get('fukureko_comment') as string,
    business_hours: formData.get('business_hours') as string,
    phone_number: formData.get('phone_number') as string,
    website_url: formData.get('website_url') as string,
    average_budget: formData.get('average_budget') as string,
    remarks: formData.get('remarks') as string || '',
  };

  const { data: insertedSpots, error: spotError } = await supabase
    .from('spots')
    .insert([spotData])
    .select();

  if (spotError || !insertedSpots || insertedSpots.length === 0) {
    console.error('Error inserting spot:', spotError);
    throw new Error(`Failed to create spot: ${spotError?.message}`);
  }

  const spotId = insertedSpots[0].id;

  // --- 3. assets テーブルへの画像URL登録 ---
  if (imageUrl) {
    const { error: assetError } = await supabase
      .from('assets')
      .insert([{
        spot_id: spotId,
        url: imageUrl,
        is_photo: true
      }]);

    if (assetError) {
      console.error('Error inserting asset:', assetError);
      throw new Error(`Failed to create asset: ${assetError.message}`);
    }
  }

  // --- 4. メニューデータの登録 ---
  const menuCount = parseInt(formData.get('menu_count') as string || '0');
  
  if (menuCount > 0) {
    const menuPromises = [];

    for (let i = 0; i < menuCount; i++) {
      const menuName = formData.get(`menu_name_${i}`) as string;
      const menuPrice = formData.get(`menu_price_${i}`) as string;
      const menuDetail = formData.get(`menu_detail_${i}`) as string;
      const menuRecommend = formData.get(`menu_recommend_val_${i}`) === 'true';
      const menuImageFile = formData.get(`menu_image_${i}`) as File;

      if (!menuName) continue;

      const uploadMenuImageAndData = async () => {
        let assetId = null;
        if (menuImageFile && menuImageFile.size > 0) {
          const mExt = menuImageFile.name.split('.').pop();
          const mFileName = `menu-${Math.random().toString(36).substring(2)}-${Date.now()}.${mExt}`;
          const mFilePath = `menus/${mFileName}`;

          console.log(`Uploading menu image [${i}]:`, mFilePath, 'Type:', menuImageFile.type);

          const { data: mUploadData, error: mUploadError } = await supabase.storage
            .from('spot-images')
            .upload(mFilePath, menuImageFile, {
              contentType: menuImageFile.type
            });

          if (!mUploadError) {
            console.log(`Menu image [${i}] upload success:`, mUploadData);
            const { data: { publicUrl } } = supabase.storage
              .from('spot-images')
              .getPublicUrl(mFilePath);
            
            // assets テーブルに登録してIDを取得
            const { data: assetData, error: assetError } = await supabase
              .from('assets')
              .insert([{
                spot_id: spotId,
                url: publicUrl,
                is_photo: true
              }])
              .select()
              .single();

            if (!assetError && assetData) {
              assetId = assetData.id; // ここで整数のIDを取得
            } else {
              console.error('Error creating menu asset:', assetError);
            }
          } else {
            console.error(`Menu image [${i}] upload error:`, mUploadError);
          }
        }

        return {
          spot_id: spotId,
          name: menuName,
          price: menuPrice ? parseInt(menuPrice) : null,
          detail: menuDetail,
          is_recommend: menuRecommend,
          asset_id: assetId, // URLではなく整数のIDをセット
        };
      };

      menuPromises.push(uploadMenuImageAndData());
    }

    const menuDataList = await Promise.all(menuPromises);
    
    if (menuDataList.length > 0) {
      const { error: menuError } = await supabase
        .from('menus')
        .insert(menuDataList);

      if (menuError) {
        console.error('Error inserting menus:', menuError);
        throw new Error(`Failed to create menus: ${menuError.message}`);
      }
    }
  }

  redirect('/admin/spots');
}

export async function updateSpot(formData: FormData) {
  const supabase = await createClient();
  const spotId = formData.get('id') as string;

  console.log('--- updateSpot Action Start ---', spotId);

  // 1. スポットメイン画像の処理
  const imageFile = formData.get('image') as File;
  const existingImageUrl = formData.get('existing_image_url') as string;
  let imageUrl = existingImageUrl;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `spots/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('spot-images')
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false
      });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('spot-images')
        .getPublicUrl(filePath);
      imageUrl = publicUrl;
      console.log('New main image uploaded:', imageUrl);
    } else {
      console.error('Main image upload error:', uploadError);
    }
  }

  // 2. スポット本体データの更新
  const spotData: any = {
    name: formData.get('name') as string,
    place_type: formData.get('place_type') as string,
    catchphrase: formData.get('catchphrase') as string,
    address: formData.get('address') as string,
    nearest_station: formData.get('nearest_station') as string,
    distance_from_transit: formData.get('distance_from_transit') as string,
    stay_duration: formData.get('stay_duration') as string,
    fukureko_comment: formData.get('fukureko_comment') as string,
    business_hours: formData.get('business_hours') as string,
    phone_number: formData.get('phone_number') as string,
    website_url: formData.get('website_url') as string,
    average_budget: formData.get('average_budget') as string,
    remarks: formData.get('remarks') as string || '',
  };

  const { error: spotError } = await supabase
    .from('spots')
    .update(spotData)
    .eq('id', spotId);

  if (spotError) {
    console.error('Error updating spot:', spotError);
    throw new Error(`Failed to update spot: ${spotError.message}`);
  }

  // 3. assets テーブルの更新（画像が変更された場合）
  if (imageUrl !== existingImageUrl) {
    const { data: existingAssets } = await supabase
      .from('assets')
      .select('id')
      .eq('spot_id', spotId)
      .eq('is_photo', true);

    if (existingAssets && existingAssets.length > 0) {
      await supabase
        .from('assets')
        .update({ url: imageUrl })
        .eq('id', existingAssets[0].id);
    } else {
      await supabase
        .from('assets')
        .insert([{ spot_id: spotId, url: imageUrl, is_photo: true }]);
    }
  }

  // 4. メニューデータの更新
  const menuCount = parseInt(formData.get('menu_count') as string || '0');
  
  // 既存のメニューを削除（簡易実装）
  await supabase.from('menus').delete().eq('spot_id', spotId);

  if (menuCount > 0) {
    const menuPromises = [];

    for (let i = 0; i < menuCount; i++) {
      const menuName = formData.get(`menu_name_${i}`) as string;
      const menuPrice = formData.get(`menu_price_${i}`) as string;
      const menuDetail = formData.get(`menu_detail_${i}`) as string;
      const menuRecommend = formData.get(`menu_recommend_val_${i}`) === 'true';
      const menuImageFile = formData.get(`menu_image_${i}`) as File;
      const menuExistingImage = formData.get(`menu_existing_image_${i}`) as string;

      if (!menuName) continue;

      const uploadMenuImageAndData = async () => {
        let assetId = null;
        
        // 既存の画像URLから現在のIDを取得するか、新しく登録するか
        if (menuExistingImage) {
          const { data: existingAsset } = await supabase
            .from('assets')
            .select('id')
            .eq('url', menuExistingImage)
            .limit(1)
            .single();
          if (existingAsset) assetId = existingAsset.id;
        }

        if (menuImageFile && menuImageFile.size > 0) {
          const mExt = menuImageFile.name.split('.').pop();
          const mFileName = `menu-${Math.random().toString(36).substring(2)}-${Date.now()}.${mExt}`;
          const mFilePath = `menus/${mFileName}`;

          const { error: mUploadError } = await supabase.storage
            .from('spot-images')
            .upload(mFilePath, menuImageFile, {
              contentType: menuImageFile.type
            });

          if (!mUploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('spot-images')
              .getPublicUrl(mFilePath);
            
            // 新しい画像をassetsに登録
            const { data: assetData, error: assetError } = await supabase
              .from('assets')
              .insert([{
                spot_id: spotId,
                url: publicUrl,
                is_photo: true
              }])
              .select()
              .single();

            if (!assetError && assetData) {
              assetId = assetData.id;
            }
          }
        }

        return {
          spot_id: spotId,
          name: menuName,
          price: menuPrice ? parseInt(menuPrice) : null,
          detail: menuDetail,
          is_recommend: menuRecommend,
          asset_id: assetId,
        };
      };

      menuPromises.push(uploadMenuImageAndData());
    }

    const menuDataList = await Promise.all(menuPromises);
    
    if (menuDataList.length > 0) {
      const { error: menuError } = await supabase
        .from('menus')
        .insert(menuDataList);

      if (menuError) {
        console.error('Error inserting menus during update:', menuError);
      }
    }
  }

  redirect('/admin/spots');
}

export async function deleteSpot(id: number) {
  const supabase = await createClient();

  console.log('--- deleteSpot Action Start ---', id);

  // 1. 関連データの削除
  await supabase.from('menus').delete().eq('spot_id', id);
  await supabase.from('assets').delete().eq('spot_id', id);

  // 2. スポット本体の削除
  const { error } = await supabase
    .from('spots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting spot:', error);
    throw new Error(`Failed to delete spot: ${error.message}`);
  }

  console.log('Spot deleted successfully:', id);
  
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/admin/spots');
}
