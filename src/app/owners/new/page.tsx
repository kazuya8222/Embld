import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OwnersHeader } from '@/components/owners/OwnersHeader';
import { ProjectPostForm } from '@/components/owners/ProjectPostForm';

export default async function NewOwnerPostPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // ユーザープロファイル情報を取得
  const { data: userProfile } = await supabase
    .from('users')
    .select('id, username, avatar_url, google_avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnersHeader user={user} userProfile={userProfile} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">新しいプロダクトを投稿</h1>
          <p className="text-gray-600 mt-2">
            あなたの個人開発プロダクトを共有して、フィードバックを得ましょう
          </p>
        </div>
        
        <ProjectPostForm userId={user.id} />
      </div>
    </div>
  );
}