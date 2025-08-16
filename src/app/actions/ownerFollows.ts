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

export async function getFollowers(userId: string) {
  const supabase = await createClient();

  const { data: followers, error } = await supabase
    .from('owner_follows')
    .select(`
      follower_id,
      created_at,
      follower:users!follower_id(
        id,
        username,
        avatar_url,
        bio
      )
    `)
    .eq('following_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching followers:', error);
    return { success: false, error: error.message };
  }

  return { 
    success: true, 
    data: followers?.map(f => {
      const follower = Array.isArray(f.follower) ? f.follower[0] : f.follower;
      return {
        id: follower?.id,
        username: follower?.username,
        avatar_url: follower?.avatar_url,
        bio: follower?.bio,
        followed_at: f.created_at
      };
    }) || []
  };
}

export async function getFollowing(userId: string) {
  const supabase = await createClient();

  const { data: following, error } = await supabase
    .from('owner_follows')
    .select(`
      following_id,
      created_at,
      following:users!following_id(
        id,
        username,
        avatar_url,
        bio
      )
    `)
    .eq('follower_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching following:', error);
    return { success: false, error: error.message };
  }

  return { 
    success: true, 
    data: following?.map(f => {
      const following = Array.isArray(f.following) ? f.following[0] : f.following;
      return {
        id: following?.id,
        username: following?.username,
        avatar_url: following?.avatar_url,
        bio: following?.bio,
        followed_at: f.created_at
      };
    }) || []
  };
}

export async function checkFollowStatus(followerId: string, followingId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('owner_follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking follow status:', error);
    return { success: false, error: error.message };
  }

  return { success: true, isFollowing: !!data };
}