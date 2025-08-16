'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

export async function createOwnerPostComment(data: {
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
}) {
  const supabase = await createClient();

  // 投稿の作成者情報を取得
  const { data: post } = await supabase
    .from('owner_posts')
    .select('user_id')
    .eq('id', data.post_id)
    .single();

  const { data: comment, error } = await supabase
    .from('owner_post_comments')
    .insert(data)
    .select(`
      *,
      user:users(username, avatar_url)
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: error.message };
  }

  // 通知を作成（自分の投稿でない場合のみ）
  if (post && post.user_id !== data.user_id) {
    await createNotification({
      recipientId: post.user_id,
      senderId: data.user_id,
      postId: data.post_id,
      commentId: comment.id,
      type: 'comment'
    });
  }

  revalidatePath(`/owners/${data.post_id}`);
  return { success: true, data: comment };
}

export async function updateOwnerPostComment(commentId: string, content: string) {
  const supabase = await createClient();

  const { data: comment, error } = await supabase
    .from('owner_post_comments')
    .update({ content })
    .eq('id', commentId)
    .select()
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: comment };
}

export async function deleteOwnerPostComment(commentId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('owner_post_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}