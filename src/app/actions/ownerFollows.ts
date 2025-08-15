'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function followUser(followingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('owner_follows')
    .insert({
      follower_id: user.id,
      following_id: followingId,
    });

  if (error) {
    console.error('Error following user:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/owners/profile/${followingId}`);
  return { success: true };
}

export async function unfollowUser(followingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { error } = await supabase
    .from('owner_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId);

  if (error) {
    console.error('Error unfollowing user:', error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/owners/profile/${followingId}`);
  return { success: true };
}