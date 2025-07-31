// データベース問題のデバッグスクリプト
// 使用方法: node scripts/debug-database.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDatabase() {
  console.log('=== データベースデバッグ開始 ===\n');

  try {
    // 1. 基本接続テスト
    console.log('1. 基本接続テスト...');
    const { data: version, error: versionError } = await supabase
      .rpc('version')
      .single();
    
    if (versionError) {
      console.error('❌ 接続失敗:', versionError.code, versionError.message);
    } else {
      console.log('✅ 接続成功');
    }

    // 2. ideasテーブルの構造確認
    console.log('\n2. ideasテーブルの確認...');
    const { data: ideasSchema, error: schemaError } = await supabase
      .from('ideas')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ ideasテーブルエラー:', schemaError.code, schemaError.message);
      console.log('詳細:', schemaError.details);
      console.log('ヒント:', schemaError.hint);
    } else {
      console.log('✅ ideasテーブル確認成功');
    }

    // 3. usersテーブルの確認
    console.log('\n3. usersテーブルの確認...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, username')
      .limit(3);
    
    if (usersError) {
      console.error('❌ usersテーブルエラー:', usersError.code, usersError.message);
    } else {
      console.log('✅ usersテーブル確認成功');
      console.log('ユーザー数:', usersData.length);
      if (usersData.length > 0) {
        console.log('サンプルユーザー:', usersData[0]);
      }
    }

    // 4. RLSポリシーのテスト（テストユーザーID使用）
    console.log('\n4. RLSポリシーのテスト...');
    const testUserId = '3853921f-19ee-4607-85b6-e7d29da31275';
    
    // テストデータでinsertを試行
    const testIdea = {
      user_id: testUserId,
      title: 'Test Idea',
      problem: 'Test Problem',
      solution: 'Test Solution',
      category: 'ツール',
      tags: ['test']
    };

    console.log('テストデータでinsert試行...');
    const { data: insertResult, error: insertError } = await supabase
      .from('ideas')
      .insert(testIdea)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert失敗:', insertError.code, insertError.message);
      console.log('詳細:', insertError.details);
      console.log('ヒント:', insertError.hint);
      
      // RLSが原因かチェック
      if (insertError.code === '42501' || insertError.message.includes('policy')) {
        console.log('\n🔍 RLSポリシーの問題の可能性があります');
        console.log('Supabase管理画面で以下を確認してください:');
        console.log('1. Authentication → Policies → ideas テーブル');
        console.log('2. INSERT ポリシーが正しく設定されているか');
        console.log('3. auth.uid() = user_id の条件が適切か');
      }
    } else {
      console.log('✅ Insert成功:', insertResult.id);
      
      // テストデータを削除
      await supabase.from('ideas').delete().eq('id', insertResult.id);
      console.log('テストデータを削除しました');
    }

  } catch (error) {
    console.error('予期しないエラー:', error);
  }

  console.log('\n=== デバッグ完了 ===');
}

debugDatabase();