'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createOwnerPostComment(data: {
  post_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
}) {
  const supabase = await createClient();

  const { data: comment, error } = await supabase
    .from('owner_post_comments')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: error.message };
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