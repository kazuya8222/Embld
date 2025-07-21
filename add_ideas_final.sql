-- 既存のユーザーIDを使用してアイデアのみを追加
-- ユーザー作成は不要（既存ユーザーを使用）

INSERT INTO ideas (user_id, title, problem, solution, target_users, category, tags, status, created_at, updated_at) VALUES

-- エンターテイメント系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), '映画の感想を短時間で共有できるアプリ', '映画を見終わった後の感想を気軽に共有したいが、長文レビューは書くのが面倒', 'スタンプや絵文字、短いコメントで感想をサクッと共有。同じ映画を見た人とリアルタイムでつながれる機能', '映画好きの若者', 'エンターテイメント', ARRAY['映画', 'レビュー', 'SNS'], 'open', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '推し活を効率化するスケジュール管理アプリ', 'アイドルやアーティストの活動情報が散らばっていて見落としがち', 'ライブ、TV出演、リリース情報を一元管理。リマインダーやファン同士の情報共有機能付き', '推し活を楽しむファン', 'エンターテイメント', ARRAY['推し活', 'スケジュール', 'ファン'], 'open', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- ライフスタイル系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), 'ひとり暮らしの自炊をゲーム化するアプリ', '自炊が面倒でつい外食やコンビニ弁当に頼ってしまう', '料理をクエスト化、レベルアップやバッジ獲得で楽しく自炊を継続。食材の使い切りチャレンジなど', 'ひとり暮らしの若者', 'ライフスタイル', ARRAY['料理', 'ゲーミフィケーション', '節約'], 'open', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '近所の小さなお店を発見できるマップアプリ', 'チェーン店ばかりで個人経営の素敵なお店を見つけにくい', 'GPS連動で半径500m以内の個人店を表示。店主のこだわりや常連さんのコメントが読める', '新しい発見を求める人', 'ライフスタイル', ARRAY['グルメ', '地域', 'マップ'], 'open', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

-- 仕事・生産性系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), 'リモートワーク中の集中力を可視化するアプリ', '在宅勤務で集中できているか客観的に分からない', 'マイクやカメラで集中度を測定、最適な休憩タイミングを提案。同僚との集中度比較機能', 'リモートワーカー', '仕事・生産性', ARRAY['集中力', 'AI', 'リモートワーク'], 'open', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '会議の無駄時間を削減するタイマーアプリ', '会議が長引いて本当に必要な議論ができない', '議題ごとに時間配分を設定、リアルタイムで進行管理。参加者全員に残り時間を共有', '会社員、チームリーダー', '仕事・生産性', ARRAY['会議', '時間管理', 'チームワーク'], 'in_development', NOW() - INTERVAL '6 days', NOW() - INTERVAL '1 day'),

-- 健康・フィットネス系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), '姿勢改善を習慣化するリマインダーアプリ', 'デスクワークで猫背になりがち、気づいたら直そうと思っても忘れてしまう', 'スマホのセンサーで姿勢を検知、定期的に改善を促すリマインド。美しい姿勢のお手本動画付き', 'デスクワーカー', '健康・フィットネス', ARRAY['姿勢', 'リマインダー', 'デスクワーク'], 'open', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '散歩コースを自動生成するアプリ', '毎日同じ散歩コースで飽きてしまう', 'GPS位置から新しい散歩ルートを自動提案。距離や所要時間、景色の良さを考慮した最適化', '健康志向の人、犬の飼い主', '健康・フィットネス', ARRAY['散歩', 'GPS', 'ルート'], 'open', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

-- 学習・教育系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), '通勤時間で英語学習が続くアプリ', '英語学習したいが机に向かう時間がなかなか取れない', '電車の揺れを検知して通勤中専用の学習モードに。片手操作で単語学習、降車駅で自動終了', '通勤している社会人', '学習・教育', ARRAY['英語', '通勤', '電車'], 'open', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '子どもの「なぜ？」に答える図鑑アプリ', '子どもの質問に適切に答えられない、調べるのに時間がかかる', '写真を撮るだけで説明が表示、子どもの年齢に合わせた解説レベル調整機能', '子育て中の親', '学習・教育', ARRAY['子育て', '図鑑', 'AI'], 'open', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),

-- ソーシャル・コミュニケーション系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), '同じ趣味の人と偶然出会えるアプリ', 'オンラインでは趣味友達がいるが、リアルで会える人が少ない', 'GPS連動で近くにいる同じ趣味の人を匿名で通知。お互いが同意したら連絡先交換', '趣味を共有したい人', 'ソーシャル', ARRAY['趣味', '出会い', 'GPS'], 'open', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '近所の人とちょっとした助け合いアプリ', '重い荷物を運んでもらいたい、電球交換を手伝ってもらいたい時に頼める人がいない', '近所限定で小さなお手伝いを依頼・提供。ポイント制でお礼のやり取り', 'ご近所さん', 'ソーシャル', ARRAY['近所', '助け合い', 'コミュニティ'], 'open', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),

-- ファイナンス系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), 'レシートを撮るだけの無駄遣いチェッカー', '何にお金を使っているか把握できていない、家計簿が続かない', 'レシートを撮影するだけで自動で支出分析。「これ本当に必要だった？」と振り返り機能', '節約したい人', 'ファイナンス', ARRAY['家計簿', 'レシート', 'AI'], 'open', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '友達同士の割り勘を簡単に管理するアプリ', '飲み会や旅行での割り勘計算と清算が面倒', 'グループ作成で自動計算、誰がいくら払ったか記録。LINEで清算リマインド送信', '友人グループ', 'ファイナンス', ARRAY['割り勘', '清算', 'グループ'], 'in_development', NOW() - INTERVAL '14 days', NOW() - INTERVAL '2 days'),

-- ショッピング系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), '冷蔵庫の中身から献立を提案するアプリ', '冷蔵庫にある食材を無駄にしてしまう、献立を考えるのが面倒', '冷蔵庫の写真から食材を認識、消費期限順に使い切りレシピを提案', '料理をする人', 'ショッピング', ARRAY['料理', '食材管理', 'レシピ'], 'open', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '服の着回し記録で無駄な買い物を防ぐアプリ', '同じような服ばかり買ってしまう、手持ちの服を活用できていない', '服の写真を登録、着回しパターンを記録。似た服を買おうとすると警告', 'おしゃれ好きな人', 'ショッピング', ARRAY['ファッション', '着回し', 'クローゼット'], 'open', NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days'),

-- 旅行系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), 'ひとり旅専用の安全共有アプリ', 'ひとり旅は楽しいが、万が一の時に不安', '家族や友人と位置情報を共有、定期的な安否確認。緊急時の連絡先を現地語で表示', 'ひとり旅をする人', '旅行', ARRAY['安全', '位置情報', 'ひとり旅'], 'open', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '現地の人おすすめスポット発見アプリ', 'ガイドブックに載ってない地元の人だけが知る場所に行きたい', '現地在住者が秘密のスポットを投稿、旅行者は現地で確認。お礼チップ機能付き', '旅行者', '旅行', ARRAY['観光', '現地情報', 'ローカル'], 'open', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),

-- 音楽系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), 'その場の雰囲気に合う音楽を自動選択するアプリ', '場面に合った音楽選びが難しい、プレイリスト作成が面倒', 'マイクで周囲の音を分析、その場の雰囲気（カフェ、集中、リラックス等）に最適な音楽を自動再生', '音楽好き', '音楽', ARRAY['音楽', '雰囲気', 'AI'], 'open', NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days'),

-- ペット系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), 'ペットの健康状態をAIで判断するアプリ', 'ペットの体調変化に気づくのが遅れがち、病院に連れて行くべきか迷う', 'ペットの写真や動画からAIが健康状態を分析、病院受診の必要性を判定', 'ペット飼い主', 'ライフスタイル', ARRAY['ペット', '健康', 'AI'], 'open', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),

-- 写真・カメラ系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), '写真の整理を自動化するアプリ', 'スマホに写真が溜まりすぎて整理できない', 'AIが写真の内容を分析して自動分類、似た写真の中からベストショットを選択', '写真をたくさん撮る人', '写真・動画', ARRAY['写真', '整理', 'AI'], 'open', NOW() - INTERVAL '21 days', NOW() - INTERVAL '21 days'),

-- ゲーム系
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '実際の街を舞台にしたリアル謎解きゲーム', '家にいながら外出気分を味わいたい、新しい場所を発見したい', 'GPS連動で実在の街を舞台にした謎解き。解決すると地域のお店の割引クーポンがもらえる', 'ゲーム好き、外出好き', 'ゲーム', ARRAY['謎解き', 'GPS', 'リアル'], 'open', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),

-- 最新のトレンド系アイデア（人気を演出）
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), 'ChatGPTとの会話を記録して成長を実感するアプリ', 'AIとの対話履歴が残らず、どんな質問をしたか忘れてしまう', '各AIツールとの会話履歴を一元管理、質問の質向上をAIがアドバイス', 'AI活用初心者', '仕事・生産性', ARRAY['AI', 'ChatGPT', '記録'], 'open', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), '今話題のことを5分で理解できるニュースアプリ', 'トレンドニュースをちゃんと理解したいが時間がない', 'トレンドニュースを5分動画で解説、背景知識も含めてわかりやすく説明', '忙しいビジネスマン', 'ニュース', ARRAY['ニュース', '解説', '動画'], 'open', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), 'サブスク管理で無駄遣いを防ぐアプリ', '複数のサブスクを契約していて把握しきれない', '全サブスクの利用頻度を追跡、使ってないサービスの解約を提案', 'サブスク利用者', 'ファイナンス', ARRAY['サブスク', '節約', '管理'], 'open', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),

-- さらに追加のアイデア
((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 1), 'VTuberのように顔を隠して配信できるアプリ', '配信したいが顔出しはしたくない、でもアバターは高価', 'スマホカメラで表情を読み取り、簡単なアバターに反映。無料で始められる配信環境', '配信初心者', 'エンターテイメント', ARRAY['配信', 'アバター', 'VTuber'], 'open', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),

((SELECT id FROM users ORDER BY created_at LIMIT 1 OFFSET 0), '電車の遅延を予測して教えてくれるアプリ', '遅延でいつも予定が狂ってしまう', 'AI学習で電車の遅延を10分前に予測、代替ルートや時間調整を提案', '電車通勤者', '交通', ARRAY['電車', '遅延', '予測'], 'open', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours');

-- wants（いいね）を追加して人気度を演出
INSERT INTO wants (idea_id, user_id, created_at) 
SELECT 
    i.id,
    u.id,
    i.created_at + INTERVAL '1 hour' * (1 + random() * 47)
FROM ideas i
CROSS JOIN users u
WHERE i.created_at > NOW() - INTERVAL '1 day'  -- 最新のアイデア
  AND random() < 0.8  -- 80%の確率でいいね
ON CONFLICT (idea_id, user_id) DO NOTHING;

-- 特に人気のアイデアにさらにいいねを追加
INSERT INTO wants (idea_id, user_id, created_at)
SELECT 
    i.id,
    u.id,
    NOW() - INTERVAL '1 day' + INTERVAL '1 hour' * floor(random() * 48)
FROM ideas i
CROSS JOIN users u
WHERE (i.title LIKE '%推し活%' OR i.title LIKE '%ChatGPT%' OR i.title LIKE '%自炊%' OR i.title LIKE '%映画%' OR i.title LIKE '%VTuber%')
  AND random() < 0.9  -- 90%の確率でいいね
ON CONFLICT (idea_id, user_id) DO NOTHING;

-- コメントを追加
INSERT INTO comments (idea_id, user_id, content, created_at)
SELECT 
    i.id,
    (SELECT id FROM users WHERE id != i.user_id ORDER BY random() LIMIT 1),
    CASE 
        WHEN i.title LIKE '%ChatGPT%' THEN 'これは絶対欲しい！AIツールが増えすぎて管理が大変でした'
        WHEN i.title LIKE '%推し活%' THEN '推し活民には必須アプリですね！ぜひ作ってください'
        WHEN i.title LIKE '%自炊%' THEN 'ゲーム要素があると続きそう！料理のモチベ上がります'
        WHEN i.title LIKE '%映画%' THEN 'レビュー書くの面倒だから、これなら続けられそう'
        WHEN i.title LIKE '%VTuber%' THEN '顔出し配信のハードル下がりますね！いいアイデア'
        WHEN i.category = 'エンターテイメント' THEN '面白そう！ぜひ使ってみたいです'
        WHEN i.category = 'ライフスタイル' THEN '日常が便利になりそうですね'
        WHEN i.category = '仕事・生産性' THEN '仕事効率化に良さそう'
        WHEN i.category = 'ファイナンス' THEN '家計管理に助かります'
        ELSE 'いいアイデアですね！実現したら絶対使う'
    END,
    i.created_at + INTERVAL '2 hours' + INTERVAL '1 hour' * (random() * 24)
FROM ideas i
WHERE i.created_at > NOW() - INTERVAL '7 days'
  AND random() < 0.3  -- 30%の確率でコメント
LIMIT 20;