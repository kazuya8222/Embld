export type QType = "yesno" | "single" | "multi" | "text";
export type Choice = { label: string; value: string };

export type Question = {
  id: string;                 // 例: "0.agree", "1.goal", "2.scope.in"
  section: number;            // 0〜9 の章番号
  prompt: string;             // ユーザーに見せる1問文
  type: QType;
  choices?: Choice[];         // 選択式の場合
  placeholder?: string;       // テキストの場合
  required?: boolean;
  // 回答を state に格納するパス（後でMarkdown合成に使う）
  saveKey: string;            // 例: "alignment.agree"
  // 動的に選択肢を出す（曖昧語候補など）場合に使う
  needsModelAssist?: boolean; // trueならサーバでLLM補助を実行
};

export const QUESTION_PLAN: Question[] = [
  // ## 0. 私の理解（2文） -> 同意/差分
  { id: "0.summary", section: 0, prompt: "最初に、AI側の理解（2文要約）を表示します。確認できますか？", type: "yesno",
    choices: [{label:"はい",value:"yes"},{label:"いいえ",value:"no"}], saveKey: "alignment.summary.agree" },
  { id: "0.diff", section: 0, prompt: "どの点が違いますか？（1行）", type: "text", placeholder:"ちがう点（なければ空欄）", saveKey: "alignment.summary.diff" },

  // ## 1. 主要ゴール（最も近い1つ） + 成功の合図
  { id: "1.goal", section: 1, prompt: "主要ゴールはどれが最も近いですか？", type: "single", saveKey: "goal.primary",
    choices: ["価値検証","獲得","効率化","満足度","収益","その他"].map(x=>({label:x,value:x})) },
  { id: "1.signal", section: 1, prompt: "成功の合図（1行・数値可）を教えてください。", type:"text", saveKey: "goal.signal" },

  // ## 2. スコープ（In / Out）
  { id: "2.scope.in", section: 2, prompt: "MVPで In に含める項目を3つまで挙げてください。", type:"text", placeholder:"1) …… 2) …… 3) ……", saveKey: "scope.in" },
  { id: "2.scope.out", section: 2, prompt: "スコープ Out（今回はやらない）を3つまで挙げてください。", type:"text", saveKey: "scope.out" },

  // ## 3. 優先順位（各ペアで片方に○）
  { id:"3.prio.quality", section:3, prompt:"品質 vs 速度、どちらを優先しますか？", type:"single", saveKey:"priority.quality_speed",
    choices:[{label:"品質",value:"品質"},{label:"速度",value:"速度"}] },
  { id:"3.prio.auto", section:3, prompt:"自動化 vs 手動コントロール、どちらを優先しますか？", type:"single", saveKey:"priority.automation_control",
    choices:[{label:"自動化",value:"自動化"},{label:"手動コントロール",value:"手動コントロール"}] },
  { id:"3.prio.scope", section:3, prompt:"幅広い適用 vs 特定ニーズ特化、どちらを優先しますか？", type:"single", saveKey:"priority.breadth_focus",
    choices:[{label:"幅広い適用",value:"幅広い適用"},{label:"特定ニーズに特化",value:"特定ニーズに特化"}] },
  { id:"3.prio.cost", section:3, prompt:"初期コスト低 vs 維持コスト低、どちらを優先しますか？", type:"single", saveKey:"priority.initial_ongoing",
    choices:[{label:"初期コスト低",value:"初期コスト低"},{label:"維持コスト低",value:"維持コスト低"}] },

  // ## 4. 完成の定義（1文）
  { id:"4.def", section:4, prompt:"完成の定義（1文）を記入してください。", type:"text", saveKey:"definition.done" },

  // ## 5. 制約（Must / Must-not）
  { id:"5.must", section:5, prompt:"Must（最大3つ）を記入してください。", type:"text", saveKey:"constraints.must" },
  { id:"5.mustnot", section:5, prompt:"Must-not（最大3つ）を記入してください。", type:"text", saveKey:"constraints.must_not" },

  // ## 6. 入力 / 出力
  { id:"6.input", section:6, prompt:"主な入力の種類（テキスト/ファイル/URL/フォーム/外部API/その他）を選ぶか記入してください。", type:"text", saveKey:"io.input" },
  { id:"6.output", section:6, prompt:"主な出力（要約/候補一覧/分類/スコア/レコメンド/メトリクス/その他）を選ぶか記入してください。", type:"text", saveKey:"io.output" },

  // ## 7. ユーザーと文脈
  { id:"7.user", section:7, prompt:"主な利用者（役割）/ 利用シーン / 頻度を一行で教えてください。", type:"text", saveKey:"user.context" },

  // ## 8. 曖昧語の具体化（最大3）
  { id:"8.terms.seed", section:8, prompt:"曖昧/広範な用語があれば入力してください（最大3）。空欄可。", type:"text", saveKey:"terms.user_terms" , needsModelAssist:true},
  // needsModelAssist: 空なら LLM が初期入力から候補抽出して choices 提案 → 次の3問で定義づけ
  { id:"8.termA", section:8, prompt:"用語Aの意味（1行）と判断基準（1行）を教えてください。", type:"text", saveKey:"terms.A" },
  { id:"8.termB", section:8, prompt:"用語Bの意味（1行）と判断基準（1行）を教えてください。", type:"text", saveKey:"terms.B" },
  { id:"8.termC", section:8, prompt:"用語Cの意味（1行）と判断基準（1行）を教えてください。", type:"text", saveKey:"terms.C" },

  // ## 9. 懸念・リスク（最大3）
  { id:"9.risks", section:9, prompt:"オープンな懸念・リスク（最大3）を列挙してください。", type:"text", saveKey:"risks.items" },
];
