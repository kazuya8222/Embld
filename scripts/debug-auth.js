const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAuth() {
  try {
    console.log('=== Supabase認証デバッグ ===\n');
    
    // 1. 現在のセッション確認
    console.log('1. 現在のセッション確認');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ セッション取得エラー:', sessionError.message);
    } else if (session) {
      console.log('✅ セッション存在:', session.user.email);
      console.log('   - User ID:', session.user.id);
      console.log('   - Access Token:', session.access_token ? '存在' : 'なし');
      console.log('   - Refresh Token:', session.refresh_token ? '存在' : 'なし');
    } else {
      console.log('ℹ️ セッションなし');
    }
    
    // 2. 認証設定確認
    console.log('\n2. 認証設定確認');
    const { data: authConfig, error: configError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    
    if (configError) {
      console.log('❌ 認証設定エラー:', configError.message);
    } else {
      console.log('✅ 認証設定正常');
    }
    
    // 3. ログアウトテスト
    console.log('\n3. ログアウトテスト');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.log('❌ ログアウトエラー:', signOutError.message);
    } else {
      console.log('✅ ログアウト成功');
    }
    
    // 4. セッション再確認
    console.log('\n4. ログアウト後のセッション確認');
    const { data: { session: afterSignOut }, error: afterError } = await supabase.auth.getSession();
    
    if (afterError) {
      console.log('❌ セッション確認エラー:', afterError.message);
    } else if (afterSignOut) {
      console.log('⚠️ ログアウト後もセッションが残存:', afterSignOut.user.email);
    } else {
      console.log('✅ ログアウト後セッションなし');
    }
    
    // 5. 環境変数確認
    console.log('\n5. 環境変数確認');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
    console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '設定済み' : '未設定');
    console.log('   - NODE_ENV:', process.env.NODE_ENV);
    
    // 6. 推奨設定
    console.log('\n6. 推奨設定確認');
    console.log('Supabaseダッシュボードで以下を確認してください：');
    console.log('');
    console.log('Authentication → URL Configuration:');
    console.log('   - Site URL: https://www.em-bld.com');
    console.log('   - Redirect URLs:');
    console.log('     * https://www.em-bld.com/auth/callback');
    console.log('     * http://localhost:3000/auth/callback');
    console.log('');
    console.log('Authentication → Settings:');
    console.log('   - Session Timeout: 3600 (1時間)');
    console.log('   - Refresh Token Rotation: Enabled');
    console.log('   - Secure Cookie: Enabled (本番環境)');
    
  } catch (error) {
    console.error('デバッグエラー:', error.message);
  }
}

debugAuth(); 