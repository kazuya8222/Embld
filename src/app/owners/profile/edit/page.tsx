import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { OwnersHeader } from '@/components/owners/OwnersHeader';
import { OwnerProfileEditForm } from '@/components/owners/OwnerProfileEditForm';

export default async function OwnerProfileEditPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // ユーザープロファイル情報を取得
  const { data: userProfile } = await supabase
    .from('users')
    .select('id, username, avatar_url, google_avatar_url, bio, location, website, one_liner, x_account, instagram_account, tiktok_account, youtube_account')
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    redirect('/owners');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OwnersHeader user={user} userProfile={userProfile} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール編集</h1>
          <p className="text-gray-600 mt-2">
            あなたのプロフィール情報を更新してください
          </p>
        </div>
        
        <OwnerProfileEditForm userProfile={userProfile} />
      </div>
    </div>
  );
}