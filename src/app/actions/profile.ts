'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'ユーザー情報が見つかりません' }
  }

  const username = formData.get('username') as string
  const avatarUrl = formData.get('avatar_url') as string || null

  try {
    // ユーザー名の重複チェック（サーバーサイドで実行）
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .single()

    if (existingUser) {
      return { error: 'このユーザー名はすでに使用されています' }
    }

    // プロフィールを更新
    const { error } = await supabase
      .from('users')
      .update({
        username,
        avatar_url: avatarUrl
      })
      .eq('id', user.id)

    if (error) {
      console.error('Profile update error:', error)
      return { error: `エラー: ${error.message}` }
    }

    // キャッシュを更新
    revalidatePath('/')
    revalidatePath('/profile')
    revalidatePath('/profile/settings')

    return { success: 'プロフィールを更新しました' }
  } catch (error: any) {
    console.error('Update error:', error)
    return { error: 'プロフィールの更新に失敗しました' }
  }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'ユーザー情報が見つかりません' }
  }

  const file = formData.get('file') as File
  
  if (!file || file.size === 0) {
    return { error: 'ファイルが選択されていません' }
  }

  // ファイルサイズチェック (5MB以下)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'ファイルサイズは5MB以下にしてください' }
  }

  try {
    // 既存のアバター画像を削除
    const { data: currentProfile } = await supabase
      .from('users')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (currentProfile?.avatar_url) {
      const oldFileName = currentProfile.avatar_url.split('/').pop()
      if (oldFileName) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${oldFileName}`])
        
        if (deleteError) {
          console.error('Failed to delete old avatar:', deleteError)
        }
      }
    }

    // ファイル名を生成
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    // Supabase Storageにアップロード
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error details:', uploadError)
      return { error: '画像のアップロードに失敗しました' }
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // プロフィールを更新
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id)

    if (updateError) {
      return { error: 'プロフィールの更新に失敗しました' }
    }

    // キャッシュを更新
    revalidatePath('/')
    revalidatePath('/profile')
    revalidatePath('/profile/settings')

    return { success: '画像をアップロードしました', avatarUrl: publicUrl }
  } catch (error: any) {
    console.error('Upload error:', error)
    return { error: '画像のアップロードに失敗しました' }
  }
}