import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { OwnersHeader } from '@/components/owners/OwnersHeader';
import { OwnerProfile } from '@/components/owners/OwnerProfile';
import { ProfileContent } from '@/components/owners/ProfileContent';

interface PageProps {
  params: { username: string };
}

export default async function OwnerProfilePage({ params }: PageProps) {
  const supabase = await createClient();
  
  // Get user by username or ID
  let user;
  const { data: userByUsername } = await supabase
    .from('users')
    .select('*, bio, location, website, one_liner, x_account, instagram_account, tiktok_account, youtube_account')
    .eq('username', params.username)
    .single();

  if (userByUsername) {
    user = userByUsername;
  } else {
    // Try to get by ID if username not found
    const { data: userById } = await supabase
      .from('users')
      .select('*, bio, location, website, one_liner, x_account, instagram_account, tiktok_account, youtube_account')
      .eq('id', params.username)
      .single();
    
    user = userById;
  }

  if (!user) {
    notFound();
  }

  // Get user's posts
  const { data: posts } = await supabase
    .from('owner_posts')
    .select(`
      *,
      likes:owner_post_likes(count),
      comments:owner_post_comments(count)
    `)
    .eq('user_id', user.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  // Get follower/following counts
  const { data: followers } = await supabase
    .from('owner_follows')
    .select('id')
    .eq('following_id', user.id);

  const { data: following } = await supabase
    .from('owner_follows')
    .select('id')
    .eq('follower_id', user.id);

  // Check if current user follows this profile
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  // ユーザープロファイル情報を取得
  let userProfile = null;
  if (currentUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('id, username, avatar_url, google_avatar_url')
      .eq('id', currentUser.id)
      .single();
    userProfile = profile;
  }
  
  let isFollowing = false;
  
  if (currentUser && currentUser.id !== user.id) {
    const { data: followData } = await supabase
      .from('owner_follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', user.id)
      .single();
    
    isFollowing = !!followData;
  }

  // Get saved posts if viewing own profile
  let savedPosts: any[] = [];
  if (currentUser?.id === user.id) {
    const { data: saves } = await supabase
      .from('owner_post_saves')
      .select(`
        created_at,
        post:owner_posts(
          *,
          likes:owner_post_likes(count),
          comments:owner_post_comments(count),
          user:users(id, username, avatar_url)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    savedPosts = saves?.map(save => save.post).filter(Boolean) || [];
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnersHeader user={currentUser} userProfile={userProfile} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <OwnerProfile
          user={user}
          postCount={posts?.length || 0}
          followerCount={followers?.length || 0}
          followingCount={following?.length || 0}
          isFollowing={isFollowing}
          isOwnProfile={currentUser?.id === user.id}
          currentUserId={currentUser?.id}
        />
        
        <ProfileContent 
          posts={posts || []}
          savedPosts={savedPosts}
          isOwnProfile={currentUser?.id === user.id}
        />
      </div>
    </div>
  );
}