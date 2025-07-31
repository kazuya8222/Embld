// Supabase認証設定確認スクリプト
// 使用方法: node scripts/check-supabase-config.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuthConfig() {
  try {
    console.log('=== Supabase認証設定確認 ===\n');
    
    // 基本情報
    console.log('Project URL:', supabaseUrl);
    console.log('Service Key:', supabaseServiceKey ? '設定済み' : '未設定');
    
    // 認証プロバイダーの確認
    console.log('\n=== 認証プロバイダー設定の確認が必要 ===');
    console.log('以下をSupabase管理画面で確認してください：');
    console.log('');
    console.log('1. Authentication → Providers → Google');
    console.log('   - Enabled: ON');
    console.log('   - Client ID: 設定済み');
    console.log('   - Client Secret: 設定済み');
    console.log('');
    console.log('2. Authentication → URL Configuration');
    console.log('   - Site URL: 本番環境のURL');
    console.log('   - Redirect URLs:');
    console.log('     * http://localhost:3000/auth/callback');
    console.log('     * https://yourdomain.com/auth/callback');
    console.log('');
    
    // テスト接続
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    
    if (error) {
      console.log('❌ 接続エラー:', error.message);
    } else {
      console.log('✅ Supabase接続成功');
      console.log('登録ユーザー数:', data.users.length);
    }
    
  } catch (error) {
    console.error('エラー:', error.message);
  }
}

checkAuthConfig();