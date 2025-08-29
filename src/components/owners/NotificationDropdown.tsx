'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageCircle, User, X } from 'lucide-react';
import Link from 'next/link';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, type Notification } from '@/app/actions/notifications';

interface NotificationDropdownProps {
  userId: string;
  initialUnreadCount?: number;
}

export function NotificationDropdown({ userId, initialUnreadCount = 0 }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 通知一覧を取得
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const result = await getNotifications(userId);
      if (result.success && result.data) {
        setNotifications(result.data);
        setUnreadCount(result.data.filter(n => !n.is_read).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
    setLoading(false);
  };

  // ドロップダウンを開く時に通知を取得
  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

  // 通知を既読にする
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setIsOpen(false);
  };

  // 全て既読にする
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // 通知のアイコンを取得
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <User className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // 通知のメッセージを生成
  const getNotificationMessage = (notification: Notification) => {
    const senderName = notification.sender.username;
    switch (notification.type) {
      case 'like':
        return `${senderName}さんがあなたの投稿にいいねしました`;
      case 'comment':
        return `${senderName}さんがあなたの投稿にコメントしました`;
      case 'follow':
        return `${senderName}さんがあなたをフォローしました`;
      default:
        return notification.content || '';
    }
  };

  // 通知のリンクを生成
  const getNotificationLink = (notification: Notification) => {
    if (notification.post_id) {
      return `/owners/${notification.post_id}`;
    }
    if (notification.type === 'follow') {
      return `/owners/profile/${notification.sender.username}`;
    }
    return '#';
  };

  // 時間をフォーマット
  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'たった今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 通知ベルアイコン */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知ドロップダウン */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">通知</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  すべて既読
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 通知リスト */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">通知はありません</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationLink(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block p-4 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* 送信者のアバター */}
                    <div className="flex-shrink-0">
                      {notification.sender.avatar_url ? (
                        <img
                          src={notification.sender.avatar_url}
                          alt={notification.sender.username}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      {/* 通知タイプアイコン */}
                      <div className="relative -mt-2 -mr-2 ml-auto">
                        <div className="bg-white rounded-full p-1 shadow-sm border">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                    </div>

                    {/* 通知内容 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {getNotificationMessage(notification)}
                      </p>
                      {notification.post?.title && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          「{notification.post.title}」
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>

                    {/* 未読インジケーター */}
                    {!notification.is_read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* フッター */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-100 text-center">
              <Link
                href="/owners/notifications"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                onClick={() => setIsOpen(false)}
              >
                すべての通知を見る
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}