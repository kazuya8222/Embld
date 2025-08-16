'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string;
  post_id?: string;
  comment_id?: string;
  type: 'like' | 'comment' | 'follow';
  content?: string;
  is_read: boolean;
  created_at: string;
  sender: {
    username: string;
    avatar_url?: string;
  };
  post?: {
    id: string;
    title: string;
  };
}

// 通知を作成
export async function createNotification({
  recipientId,
  senderId,
  postId,
  commentId,
  type,
  content
}: {
  recipientId: string;
  senderId: string;
  postId?: string;
  commentId?: string;
  type: 'like' | 'comment' | 'follow';
  content?: string;
}) {
  // 自分自身への通知は作成しない
  if (recipientId === senderId) {
    return { success: true };
  }

  const supabase = await createClient();

  try {
    // 同じ種類の通知が既に存在するかチェック（いいねの重複防止）
    if (type === 'like' && postId) {
      const { data: existingNotification } = await supabase
        .from('owner_notifications')
        .select('id')
        .eq('recipient_id', recipientId)
        .eq('sender_id', senderId)
        .eq('post_id', postId)
        .eq('type', 'like')
        .single();

      if (existingNotification) {
        return { success: true }; // 既に存在する場合は何もしない
      }
    }

    const { data, error } = await supabase
      .from('owner_notifications')
      .insert({
        recipient_id: recipientId,
        sender_id: senderId,
        post_id: postId,
        comment_id: commentId,
        type,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

// いいね通知を削除（いいね取り消し時）
export async function deleteNotification({
  recipientId,
  senderId,
  postId,
  type
}: {
  recipientId: string;
  senderId: string;
  postId?: string;
  type: 'like' | 'comment' | 'follow';
}) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('owner_notifications')
      .delete()
      .eq('recipient_id', recipientId)
      .eq('sender_id', senderId)
      .eq('post_id', postId)
      .eq('type', type);

    if (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error: 'Failed to delete notification' };
  }
}

// 通知一覧を取得
export async function getNotifications(userId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('owner_notifications')
      .select(`
        *,
        sender:users!sender_id(username, avatar_url),
        post:owner_posts(id, title)
      `)
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Notification[] };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Failed to fetch notifications' };
  }
}

// 未読通知数を取得
export async function getUnreadNotificationCount(userId: string) {
  const supabase = await createClient();

  try {
    const { count, error } = await supabase
      .from('owner_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error fetching unread count:', error);
      return { success: false, error: error.message };
    }

    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { success: false, error: 'Failed to fetch unread count' };
  }
}

// 通知を既読にする
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('owner_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: 'Failed to mark notification as read' };
  }
}

// 全ての通知を既読にする
export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('owner_notifications')
      .update({ is_read: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/owners');
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: 'Failed to mark all notifications as read' };
  }
}