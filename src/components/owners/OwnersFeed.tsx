import { createClient } from '@/lib/supabase/server';
import { OwnerPostCard } from './OwnerPostCard';

export async function OwnersFeed() {
  const supabase = await createClient();
  
  const { data: posts, error } = await supabase
    .from('owner_posts')
    .select(`
      *,
      user:users(id, username, avatar_url),
      likes:owner_post_likes(count),
      comments:owner_post_comments(count)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching posts:', error);
    return (
      <div className="text-center py-8 text-gray-500">
        投稿の読み込みに失敗しました
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">まだ投稿がありません</h3>
        <p className="text-gray-600">
          最初の投稿者になりましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <OwnerPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}