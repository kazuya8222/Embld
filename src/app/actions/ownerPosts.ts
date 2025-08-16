'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createOwnerPost(data: {
  user_id: string;
  title: string;
  description: string;
  content?: string;
  project_url?: string;
  github_url?: string;
  demo_url?: string;
  demo_video_url?: string;
  tech_stack?: string[];
  tags?: string[];
  images?: string[];
  category?: string;
  pricing_model?: string;
  platform?: string[];
  is_public?: boolean;
}) {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('owner_posts')
    .insert({
      ...data,
      status: 'published',
      approval_status: 'pending', // 承認待ちステータス
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/owners');
  return { success: true, data: post };
}

export async function updateOwnerPost(postId: string, data: any) {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('owner_posts')
    .update(data)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/owners');
  revalidatePath(`/owners/${postId}`);
  return { success: true, data: post };
}

export async function deleteOwnerPost(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('owner_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/owners');
  return { success: true };
}

export async function likeOwnerPost(postId: string, userId: string) {
  const supabase = await createClient();

  const { data: existingLike } = await supabase
    .from('owner_post_likes')
    .select()
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('owner_post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (!error) {
      await supabase.rpc('decrement_owner_post_likes', { post_id: postId });
    }

    return { success: !error, liked: false };
  } else {
    // Like
    const { error } = await supabase
      .from('owner_post_likes')
      .insert({ post_id: postId, user_id: userId });

    if (!error) {
      await supabase.rpc('increment_owner_post_likes', { post_id: postId });
    }

    return { success: !error, liked: true };
  }
}

export async function incrementViewCount(postId: string) {
  const supabase = await createClient();

  const { error } = await supabase.rpc('increment_owner_post_views', { 
    post_id: postId 
  });

  return { success: !error };
}

export async function saveOwnerPost(postId: string, userId: string) {
  const supabase = await createClient();

  const { data: existingSave } = await supabase
    .from('owner_post_saves')
    .select()
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existingSave) {
    // Unsave
    const { error } = await supabase
      .from('owner_post_saves')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    revalidatePath('/owners');
    revalidatePath(`/owners/${postId}`);
    revalidatePath('/owners/profile');
    return { success: !error, saved: false };
  } else {
    // Save
    const { error } = await supabase
      .from('owner_post_saves')
      .insert({ post_id: postId, user_id: userId });

    revalidatePath('/owners');
    revalidatePath(`/owners/${postId}`);
    revalidatePath('/owners/profile');
    return { success: !error, saved: true };
  }
}