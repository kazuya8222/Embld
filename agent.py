# -*- coding: utf-8 -*-
import operator
import argparse
from typing import Annotated, Optional, List

# .envファイルのパスを明示的に指定
import os
from pathlib import Path
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field

# 日本語固定出力の指示（共通で使う）
JP = (
    "【重要】出力は必ず日本語のみで記述すること。"
    "英語は使用しない（固有名詞やサービス名など必要最小限を除く）。"
    "語尾や体裁は各ドキュメントの性格に合わせること。"
)

# =========================
# 1. データモデル定義
# =========================
class Persona(BaseModel):
    name: str = Field(..., description="ペルソナの名前")
    background: str = Field(..., description="ペルソナの持つ背景")

class Personas(BaseModel):
    personas: List[Persona] = Field(default_factory=list, description="ペルソナのリスト")

class Interview(BaseModel):
    persona: Persona = Field(..., description="インタビュー対象のペルソナ")
    question: str = Field(..., description="インタビューでの質問")
    answer: str = Field(..., description="インタビューでの回答")

class InterviewResult(BaseModel):
    interviews: List[Interview] = Field(default_factory=list, description="インタビュー結果のリスト")

class EvaluationResult(BaseModel):
    reason: str = Field(..., description="判断の理由")
    is_sufficient: bool = Field(..., description="情報が十分かどうか")
    gaps: List[str] = Field(default_factory=list, description="不足している情報項目（箇条書き）")
    followup_questions: List[str] = Field(default_factory=list, description="不足を埋めるための具体的な追加入力質問")

class ExternalEnvironmentAnalysis(BaseModel):
    customer_analysis: str = Field(..., description="市場と顧客の分析")
    competitor_analysis: str = Field(..., description="競合の分析")
    company_analysis: str = Field(..., description="自社(このプロジェクト)の分析")
    pest_analysis: str = Field(..., description="マクロ環境分析")
    summary_and_strategy: str = Field(..., description="分析の要約と戦略的提言")

# --- 旧: 統合評価モデル（後方互換のため残置。使わない）---
class PlanAssessment(BaseModel):
    is_viable: bool = Field(..., description="個人開発プロジェクトとして実行可能かつ、成功の見込みがあるか")
    reason: str = Field(..., description="上記のように判断した理由の要約")
    main_strength: str = Field(..., description="この計画の最大の強み")
    main_weakness: str = Field(..., description="この計画の最大の弱点・リスク")
    recommendation: str = Field(..., description="評価を踏まえ、次に行うべきことの提案")

# --- ペルソナ制約と採点済みモデル ---
class PersonaConstraints(BaseModel):
    primary_role: str = Field(..., description="中心となる役割（例：副業の教育系YouTuber）")
    age_range: Optional[str] = Field(default=None, description="年齢帯（例：30代前半など）")
    work_style: Optional[str] = Field(default=None, description="働き方/時間制約（例：本業多忙・夜間のみなど）")
    usage_frequency: Optional[str] = Field(default=None, description="利用頻度（例：週1-2回）")
    device_context: Optional[str] = Field(default=None, description="主端末/環境（例：PC中心/モバイル併用など）")
    skill_level: Optional[str] = Field(default=None, description="IT/編集スキルの水準")
    must_include_keywords: List[str] = Field(default_factory=list, description="必ず含めたいキーワード（役割/文脈/課題）")
    must_exclude_keywords: List[str] = Field(default_factory=list, description="除外するキーワード（不適合な役割/文脈）")
    notes: Optional[str] = Field(default=None, description="その他の制約・注意点")

class PersonaScored(Persona):
    fit_score: float = Field(..., ge=0.0, le=1.0, description="制約への適合度スコア(0-1)")
    rationale: str = Field(..., description="このペルソナが制約に適合する根拠（日本語）")

class PersonasScored(BaseModel):
    personas: List[PersonaScored] = Field(default_factory=list, description="採点済みペルソナの配列")

# --- 分割評価モデル（新設） ---
class ProfitabilityAssessment(BaseModel):
    is_profitable: bool = Field(..., description="収益性の見込み（True/False）")
    reason: str = Field(..., description="収益性判断の理由（日本語）")

class FeasibilityAssessment(BaseModel):
    is_feasible: bool = Field(..., description="実現可能性（True/False）")
    reason: str = Field(..., description="実現性判断の理由（日本語）")

class LegalAssessment(BaseModel):
    is_compliant: bool = Field(..., description="法務・コンプライアンス適合（True/False）")
    reason: str = Field(..., description="法務判断の理由（日本語：規約・著作権・個人情報・表示義務など）")

# =========================
# 2. ワークフローの状態(State)
# =========================
class InterviewState(BaseModel):
    initial_problem: str = Field(...)
    initial_persona: str = Field(...)
    initial_solution: str = Field(...)
    clarification_interview_log: str = Field(default="")
    user_request: str = Field(default="")  # サマリー
    personas: Annotated[List[Persona], operator.add] = Field(default_factory=list)
    interviews: Annotated[List[Interview], operator.add] = Field(default_factory=list)
    professional_requirements_doc: str = Field(default="", description="（統合）要件定義書：個人開発向けビジネス＋開発")
    consultant_analysis_report: Optional[ExternalEnvironmentAnalysis] = Field(default=None, description="外部環境分析レポート")
    # 旧統合評価は保持のみ（使わない）
    plan_assessment: Optional[PlanAssessment] = Field(default=None, description="旧: 収益性・実現性の統合評価結果")
    # 十分性評価（インタビュー情報の）
    iteration: int = Field(default=0)
    is_information_sufficient: bool = Field(default=False)
    evaluation_result: Optional[EvaluationResult] = Field(default=None)
    followup_round: int = Field(default=0, description="不足時の追加入力ラウンド数（0〜2）")
    pitch_document: str = Field(default="", description="学生向けのプロジェクト企画書")

    # 新: 分割評価の結果
    profitability: Optional[ProfitabilityAssessment] = Field(default=None)
    feasibility: Optional[FeasibilityAssessment] = Field(default=None)
    legal: Optional[LegalAssessment] = Field(default=None)

    # 改善ループのためのフラグ：既存ペルソナを保持しつつ追加生成するか
    augment_personas: bool = Field(default=False)

# =========================
# 3. 主要コンポーネント
# =========================
class ClarificationInterviewer:
    def __init__(self, llm: ChatOpenAI):
        self.question_generator = (
            ChatPromptTemplate.from_messages([
                ("system",
                 "あなたは初期入力（課題・ペルソナ・解決策）の解釈と後続アウトプットの齟齬を最小化するための"
                 "『方向性アライメント質問票』を作る専門家です。"
                 "特定の業界・媒体・UI・プロダクト名に依存しない**汎用**の質問にすること。"
                 "入力（課題/ペルソナ/解決策）に含まれる用語から曖昧または広範な語を抽出し一般化して定義づけを求める。"
                 "回答は短時間で可能なよう**選択中心＋最小限の自由記入**、必要なら『わからない』を用意する。"
                 "まずAIの理解を2文で要約（エコーバック）→同意/差分→ゴール/非ゴール→優先順位→完成の定義→制約→入出力→ユーザー文脈→曖昧語の定義。"
                 f"{JP} 出力は指定のMarkdownフォーマットに**厳密**に従うこと。"),
                ("human",
                 "【前提（ユーザーの初期入力）】\n"
                 "- 課題: {problem}\n- ペルソナ: {persona}\n- 解決策の仮説: {solution}\n\n"
                 "【出力フォーマット】\n"
                 "# 方向性アライメント質問票\n"
                 "## 0. 私の理解（2文）\n"
                 "- （AIの理解を2文で要約）\n"
                 "- これはあなたのイメージに近いですか？ → はい／いいえ\n"
                 "- ちがう点（1行）: ______\n\n"
                 "## 1. 主要ゴール（最も近い1つ）\n"
                 "- [ ] 価値検証 / [ ] 獲得 / [ ] 効率化 / [ ] 満足度 / [ ] 収益 / [ ] その他: ______\n"
                 "- 成功の合図（1行・数値可）: ______\n\n"
                 "## 2. スコープ（In / Out）\n"
                 "- In: 1) ______  2) ______  3) ______\n"
                 "- Out: 1) ______  2) ______  3) ______\n\n"
                 "## 3. 優先順位（各ペアで片方に○）\n"
                 "- 品質 ○ / 速度 ○\n"
                 "- 自動化 ○ / 手動コントロール ○\n"
                 "- 幅広い適用 ○ / 特定ニーズに特化 ○\n"
                 "- 初期コスト低 ○ / 維持コスト低 ○\n\n"
                 "## 4. 完成の定義（1文）\n"
                 "- あなたの定義: ______\n\n"
                 "## 5. 制約（Must / Must-not・各最大3つ）\n"
                 "- Must: 1) ______  2) ______  3) ______\n"
                 "- Must-not: 1) ______  2) ______  3) ______\n\n"
                 "## 6. 入力と出力（一般化）\n"
                 "- 入力: テキスト／ファイル／URL／フォーム／外部API／その他: ______\n"
                 "- 出力: 要約／候補一覧／分類／スコア／レコメンド／メトリクス／その他: ______\n\n"
                 "## 7. ユーザーと文脈\n"
                 "- 主な利用者（役割）: ______ / 利用シーン: ______ / 頻度: ______\n\n"
                 "## 8. 曖昧語の具体化（最大3）\n"
                 "- 用語A: ______ → 意味: ______ / 判断基準: ______\n"
                 "- 用語B: ______ → 意味: ______ / 判断基準: ______\n"
                 "- 用語C: ______ → 意味: ______ / 判断基準: ______\n\n"
                 "## 9. オープンな懸念・リスク（最大3）\n"
                 "- 1) ______  2) ______  3) ______\n\n"
                 "※『わからない』も可。固有名や特定媒体名は避け、一般化した表現で。")
            ])
            | llm
            | StrOutputParser()
        )

    def generate_questions(self, problem: str, persona: str, solution: str) -> str:
        return self.question_generator.invoke({"problem": problem, "persona": persona, "solution": solution})

class RequestSummarizer:
    def __init__(self, llm: ChatOpenAI):
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system",
                 "あなたは優秀なプロジェクトマネージャーです。初期入力と質疑応答ログを読み解き、"
                 "開発チームが参照するための『プロジェクトサマリー』を1段落で簡潔に作成してください。"
                 f"{JP}"),
                ("human",
                 "## 元情報\n- **課題:** {problem}\n- **ターゲットペルソナ:** {persona}\n- **解決策:** {solution}\n\n"
                 "## ヒアリングログ\n{interview_log}\n\n## プロジェクトサマリー:")
            ])
            | llm
            | StrOutputParser()
        )

    def run(self, problem: str, persona: str, solution: str, interview_log: str) -> str:
        return self.chain.invoke({"problem": problem, "persona": persona, "solution": solution, "interview_log": interview_log})

# 改善後要件定義書から短いサマリーを抜き出す（改善ループ用）
class SummaryFromRequirements:
    def __init__(self, llm: ChatOpenAI):
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system",
                 "あなたは編集者です。与えられた要件定義書から、開発チーム向けに1段落の要約を作成します。"
                 "トーンは中立・簡潔。固有名の羅列を避け、目的・主要なユーザー価値・MVPスコープを明示する。"
                 f"{JP}"),
                ("human", "要件定義書（抜粋可）:\n{requirements}\n\n---\n1段落サマリー:")
            ])
            | llm
            | StrOutputParser()
        )

    def run(self, requirements: str) -> str:
        return self.chain.invoke({"requirements": requirements})

# --- 追加：制約抽出器 ---
class PersonaConstraintExtractor:
    def __init__(self, llm: ChatOpenAI):
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system",
                 "あなたは要求定義の整合性監査官です。"
                 "初期入力（課題/ペルソナ/解決策）とヒアリングログ（方向性アライメント質問票）から、"
                 "ペルソナ生成に必要な制約を日本語で構造化抽出します。"
                 f"{JP}"),
                ("human",
                 "## 初期入力\n- 課題: {problem}\n- ペルソナ: {persona}\n- 解決策: {solution}\n\n"
                 "## ヒアリングログ\n{interview_log}\n\n"
                 "## タスク\n"
                 "- 主要な役割・年齢帯・使用文脈・利用頻度・スキル水準などの必須条件を抽出\n"
                 "- 不適合になりやすい役割/文脈を禁止条件として抽出\n"
                 "- 必須/禁止のキーワードリストも作成\n"
                 "- 漏れがある場合は、初期入力とログから常識的に補完\n")
            ])
            | llm.with_structured_output(PersonaConstraints)
        )

    def run(self, problem: str, persona: str, solution: str, interview_log: str) -> PersonaConstraints:
        return self.chain.invoke({
            "problem": problem,
            "persona": persona,
            "solution": solution,
            "interview_log": interview_log
        })

# --- 置換：制約準拠＋採点付きペルソナ生成 ---
class PersonaGeneratorV2:
    def __init__(self, llm: ChatOpenAI, k: int = 10):
        self.gen_llm = llm
        self.k = k
        self.scored_llm = self.gen_llm.with_structured_output(PersonasScored)

    def run(self, user_request: str, constraints: PersonaConstraints) -> Personas:
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "あなたはユーザーインタビュー用のペルソナ生成の専門家です。"
             "以下の**制約**に適合する候補ペルソナを8〜10名作成し、各候補に対して"
             "『役割適合・文脈一致・制約順守・差別化』を総合した適合度スコア（0〜1）を付与してください。"
             "人物属性の重複は避けること。"
             f"{JP} すべて日本語で記述し、日本名を用いること。"),
            ("human",
             "## プロジェクトサマリー\n{user_request}\n\n"
             "## 制約（厳守）\n"
             "- 主要役割: {primary_role}\n"
             "- 年齢帯: {age_range}\n"
             "- 働き方/時間制約: {work_style}\n"
             "- 利用頻度: {usage_frequency}\n"
             "- 端末/環境: {device_context}\n"
             "- スキル水準: {skill_level}\n"
             "- 必須キーワード: {must_include}\n"
             "- 禁止キーワード: {must_exclude}\n"
             "- 備考: {notes}\n\n"
             "## 出力要件\n"
             "- 1人目は**代表ペルソナ**（最重要）として、制約への適合度が最も高い人物\n"
             "- 各候補に fit_score（0〜1）と rationale（1〜2文）を付与\n"
             "- 禁止キーワードに該当する役割/文脈は**出さない**\n")
        ])

        scored = (prompt | self.scored_llm).invoke({
            "user_request": user_request,
            "primary_role": constraints.primary_role,
            "age_range": constraints.age_range or "指定なし",
            "work_style": constraints.work_style or "指定なし",
            "usage_frequency": constraints.usage_frequency or "指定なし",
            "device_context": constraints.device_context or "指定なし",
            "skill_level": constraints.skill_level or "指定なし",
            "must_include": "、".join(constraints.must_include_keywords) if constraints.must_include_keywords else "（なし）",
            "must_exclude": "、".join(constraints.must_exclude_keywords) if constraints.must_exclude_keywords else "（なし）",
            "notes": constraints.notes or "（なし）",
        })

        kept = [p for p in scored.personas if p.fit_score >= 0.8]
        kept.sort(key=lambda x: x.fit_score, reverse=True)
        if not kept:
            kept = scored.personas[: self.k]
        else:
            kept = kept[: self.k]

        return Personas(personas=[Persona(name=p.name, background=p.background) for p in kept])

# --- 2回目用（はい/いいえ化） ---
class YesNoQuestionConverter:
    def __init__(self, llm: ChatOpenAI):
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system",
                 "あなたは質問設計の専門家です。与えられた自由記述のフォローアップ質問群を、"
                 "ユーザーが『はい／いいえ』で答えられる形式に短文化してください。"
                 "各質問は1文・日本語・肯定がデフォルト仮説になるように書き換える。"
                 "必要なら（任意で一言コメント可）を末尾に付す。"
                 f"{JP}"),
                ("human", "自由記述の質問群:\n{questions}\n\n変換後: 箇条書きで出力。")
            ])
            | llm
            | StrOutputParser()
        )

    def run(self, questions: List[str]) -> List[str]:
        raw = self.chain.invoke({"questions": "\n".join(f"- {q}" for q in questions)})
        lines = [l.strip("- ").strip() for l in raw.splitlines() if l.strip()]
        return [l for l in lines if l]

# --- 自動補完（最終フェーズの仮設定） ---
class AssumptionBackfiller:
    def __init__(self, llm: ChatOpenAI):
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system",
                 "あなたは個人開発のPMです。以下のプロジェクトサマリー/インタビュー/不足項目に基づき、"
                 "不足を**合理的な仮設定**で自動補完します。"
                 "各補完は『決定値（1行）／根拠（1行）／再確認方法（1行）』で短く。"
                 "日本語で、保守的かつ実装可能な現実解を優先。"
                 f"{JP}"),
                ("human",
                 "## プロジェクトサマリー\n{user_request}\n\n"
                 "## インタビューメモ\n{interview_details}\n\n"
                 "## 不足項目\n{gaps}\n\n"
                 "## 出力\n- 項目名: 決定値 / 根拠 / 再確認方法（各1行）を箇条書きで。")
            ])
            | llm
            | StrOutputParser()
        )

    def run(self, user_request: str, interviews: List[Interview], gaps: List[str]) -> str:
        interview_details = "\n".join(f"- {i.persona.name}: {i.answer}" for i in interviews)
        return self.chain.invoke({
            "user_request": user_request,
            "interview_details": interview_details or "（なし）",
            "gaps": "\n".join(f"- {g}" for g in gaps) or "（明示なし）"
        })

# --- ヒアリング（各ペルソナ3問ずつに変更） ---
class InterviewConductor:
    def __init__(self, llm: ChatOpenAI, questions_per_persona: int = 3):
        self.llm = llm
        self.k = questions_per_persona

    def run(self, user_request: str, personas: List[Persona]) -> InterviewResult:
        grouped_questions = self._generate_questions(user_request=user_request, personas=personas)
        interviews: List[Interview] = []
        for p, qs in zip(personas, grouped_questions):
            for q in qs:
                a = self._generate_answer(persona=p, question=q)
                interviews.append(Interview(persona=p, question=q, answer=a))
        return InterviewResult(interviews=interviews)

    def _generate_questions(self, user_request: str, personas: List[Persona]) -> List[List[str]]:
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "あなたはUXリサーチの質問設計の専門家です。各ペルソナの文脈から、"
             "真意を引き出す**具体的な質問**を3つ作成してください。"
             "回答に時間がかからない粒度、かつ合意形成に役立つものに限定。"
             f"{JP} 箇条書き3行で返す。"),
            ("human",
             "プロジェクトサマリー:\n{user_request}\n\n"
             "対象ペルソナ:\n{persona_name} - {persona_background}\n\n"
             "出力: 箇条書き3問のみ")
        ])
        chain = prompt | self.llm | StrOutputParser()
        outs: List[List[str]] = []
        for p in personas:
            raw = chain.invoke({
                "user_request": user_request,
                "persona_name": p.name,
                "persona_background": p.background
            })
            qs = [x.strip("-• ").strip() for x in raw.splitlines() if x.strip()]
            if len(qs) > self.k:
                qs = qs[: self.k]
            while len(qs) < self.k:
                qs.append("このプロジェクトに関する最大の懸念点は何ですか？（自由記述）")
            outs.append(qs)
        return outs

    def _generate_answer(self, persona: Persona, question: str) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "あなたは以下のペルソナとして回答します。"
             "一人称で自然な日本語、2〜3文、具体例を交えること。"
             f"{JP}"),
            ("human", "ペルソナ: {persona_name} - {persona_background}\n質問: {question}\n回答:")
        ])
        chain = prompt | self.llm | StrOutputParser()
        return chain.invoke({
            "persona_name": persona.name,
            "persona_background": persona.background,
            "question": question
        })

class InformationEvaluator:
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm.with_structured_output(EvaluationResult)

    def run(self, user_request: str, interviews: List[Interview]) -> EvaluationResult:
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "あなたは包括的な要件文書を作成するための情報の十分性を評価する専門家です。"
             "不足がある場合は、**何が足りないか（gaps）**と、**それを埋めるための追加入力質問（followup_questions）**を"
             "具体的かつ実行可能な形で作成してください。"
             "質問は短時間で答えられ、できれば定量・選択肢・例を含め、必要なら『わからない』を許容する設計に。"
             "ただし個人開発前提につき、軽微な不足は**AIの仮設定で補完可能**と判断し、"
             "致命的不足のみを『不十分』とする。致命的不足の例：法的リスク未方針、マネタイズ方針ゼロ、主要入出力が未定など。"
             f"{JP}"),
            ("human",
             "以下のプロジェクトサマリーとインタビュー結果に基づき、十分性を評価してください。\n\n"
             "プロジェクトサマリー: {user_request}\n\nインタビュー結果:\n{interview_results}")
        ])
        return (prompt | self.llm).invoke({
            "user_request": user_request,
            "interview_results": "\n".join(
                f"ペルソナ: {i.persona.name}\n質問: {i.question}\n回答: {i.answer}\n" for i in interviews
            )
        })

class FollowupAsker:
    """不足時に、EvaluationResult.followup_questions を対話で取得してログへ追記"""
    def __init__(self, yesno_converter: Optional[YesNoQuestionConverter] = None):
        self.yesno_converter = yesno_converter

    def collect(self, eval_result: EvaluationResult, mode: str = "free") -> str:
        qs = eval_result.followup_questions or []
        if not qs:
            return ""
        print("\n--- 5b. 追加入力（不足情報の解消）---")
        print("不足している情報項目:")
        for g in eval_result.gaps:
            print(f"- {g}")

        # 2回目ははい/いいえ形式に変換
        if mode == "yesno" and self.yesno_converter:
            qs = self.yesno_converter.run(qs)
            print("\n（今回は『はい／いいえ』でお答えください。必要なら一言コメントも可）")

        collected = []
        for idx, q in enumerate(qs, 1):
            print(f"\nQ{idx}: {q}")
            prompt = "回答を入力してください（未定なら『わからない』でも可。Enterで改行、空行で次へ）:"
            if mode == "yesno":
                prompt = "回答を入力してください（はい／いいえ、任意で一言コメント。Enterで改行、空行で次へ）:"
            print(prompt)
            lines = []
            while True:
                try:
                    line = input()
                except EOFError:
                    line = ""
                if not line:
                    break
                lines.append(line)
            ans = "\n".join(lines).strip() or "（無回答）"
            collected.append(f"Q{idx}: {q}\nA{idx}: {ans}")
        header = "## 追加入力（1回目・自由記述）" if mode == "free" else "## 追加入力（2回目・はい/いいえ）"
        return header + "\n" + "\n\n".join(collected)

class PitchGenerator:
    def __init__(self, llm: ChatOpenAI):
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system",
                 "あなたは、提示された情報を基に、大学生向けの魅力的なプロジェクト企画書（ピッチ資料）を作成する学生起業家です。"
                 "専門用語を避け、読者が共感しワクワクする文章を作成してください。"
                 f"{JP} 見出し・本文すべて日本語で記述すること。"),
                ("human", """以下の情報から、一般的な大学生が賛同しやすい形の「プロジェクト企画書」を、指定のMarkdownフォーマットで作成してください。
## 入力情報
- **プロジェクトサマリー:** {user_request}
- **インタビュー詳細 (ペルソナごとの意見):**
{interview_details}
---
## 出力フォーマット
# 🚀 プロジェクト企画書: [ここにキャッチーなアプリ名を考案して入力]
## 😵「こんなことで困ってない？」 - 解決したい課題
> [学生向けの言葉で課題を表現]
## ✨「こうなったら最高じゃない？」 - 僕たちの解決策
> [ベネフィットを感情的に描写]
## 🎯 ターゲットユーザー
- **こんな人にピッタリ:** [一行で表現]
## 🛠️ このアプリでできること (主要機能)
- **[主要機能1]:** [説明]
- **[主要機能2]:** [説明]
- **[主要機能3]:** [説明]
## 💰 ビジネス的な話（ちょっとだけ）
- [マネタイズの方針（例：基本無料＋有料プラン）]
## 🤝 一緒に作りませんか？
- [参加や応援の呼びかけ]""")
            ])
            | llm
            | StrOutputParser()
        )

    def run(self, user_request: str, interviews: List[Interview]) -> str:
        return self.chain.invoke({
            "user_request": user_request,
            "interview_details": "\n".join(f"ペルソナ「{i.persona.name}」の意見: {i.answer}\n" for i in interviews)
        })

class ProfessionalRequirementsGenerator:
    """統合要件定義書（個人開発向け：ビジネス＋開発）を生成"""
    def __init__(self, llm: ChatOpenAI):
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system",
                 "あなたは、個人開発者が単独で着手・運用できるレベルの『統合要件定義書（Lean＋Tech）』を作成する、"
                 "経験豊富なプロダクトマネージャー兼システムアナリストです。"
                 "ビジネス側（Lean BRD）と開発側（Tech Spec）を1つのドキュメントに統合し、"
                 "空欄を作らず仮説で埋め、実行手順に落とせる粒度で日本語のみで記述してください。"
                 f"{JP} 表・箇条書き・簡易表を活用し、具体的かつ簡潔に。"),
                ("human", r"""以下の情報から、**個人開発向け**の「統合要件定義書（Lean＋Tech）」を、指定のMarkdownフォーマットで作成してください。

## 入力情報
- **プロジェクトサマリー:** {user_request}
- **インタビューから得られたユーザーグループの要約:**
{user_groups_summary}
- **インタビュー詳細:**
{interview_details}

---
## 出力フォーマット（厳守）

# 📝 統合要件定義書（個人開発向け：Lean＋Tech）
## A. ビジネス（Lean BRD）
### A-1. プロジェクトカード
- 名称 / 一言価値 / 対象ユーザー / アンチゴール

### A-2. 課題と解く理由（Top3）
- いまの代替手段 / 不満点 / 解決の一言

### A-3. 主要ユーザーとジョブ
- ペルソナ要約 / やりたいこと（Jobs）/ 利用トリガー・頻度

### A-4. 価値提案と差別化
- 核心ベネフィット / 代替との差 / 最初に勝てるニッチ

### A-5. 収益モデルと価格（試算付き）
| プラン | 価格 | 主な制限/特典 | 期待CVR | 備考 |
|---|---:|---|---:|---|
- 無料枠の範囲 / 決済方法 / 返金ポリシー（簡易）

### A-6. 獲得チャネルと最初の10人
- チャネル候補 / 初回施策（3本）/ 目標KPI（数値）

### A-7. 成功指標（North Star & KPI）
| 指標 | 目標値 | 期間 |
|---|---:|---|

### A-8. スコープと優先順位（MVP前提）
- In / Out / トレードオフ（品質vs速度等）

### A-9. リスク・前提・法務
- 主要リスク（技術・需要・法務）/ 著作権・規約の要点 / 回避策

### A-10. コスト見積とランレート（概算）
| 区分 | 初期 | 月次 |
|---|---:|---:|
- 損益分岐の目安（式で）

## B. 開発（Tech Spec）
### B-1. MVPユーザーストーリー（3〜5件）
- 各ストーリーに **受け入れ基準**（チェックリスト）

### B-2. 画面と主要フロー
- 画面一覧 / 主フロー（文字ワイヤでOK）/ 状態遷移の要点

### B-3. データモデル（簡易ER）
- エンティティ / 主属性 / 関係 / 保持期間・削除方針

### B-4. API / 外部連携
- 必要エンドポイント（入出力・エラーの基本形）/ 帯域・制限の目安

### B-5. 非機能要件（個人開発現実解）
- 性能（目安）/ セキュリティ / 可用性 / 監視・バックアップ

### B-6. 運用・サポート
- 運用手順（デプロイ・障害対応）/ 計測・アラート / 既知の制約

### B-7. 開発ロードマップ（12週目安）
- W0-2 / W3-6 / W7-12 と **カット基準**

### B-8. 用語集（曖昧語の定義）
- 用語A/B/C（1行の意味＋判断基準）
""")
            ])
            | llm
            | StrOutputParser()
        )

    def run(self, user_request: str, interviews: List[Interview]) -> str:
        user_groups_summary = "\n".join(
            f"- **(ユーザーグループ {chr(65 + i)}):** {interview.persona.background}"
            for i, interview in enumerate(interviews)
        )
        return self.chain.invoke({
            "user_request": user_request,
            "user_groups_summary": user_groups_summary,
            "interview_details": "\n".join(
                f"ペルソナ: {i.persona.name}\n質問: {i.question}\n回答: {i.answer}\n" for i in interviews
            )
        })

class ConsultantExternalAnalyzer:
    def __init__(self, llm: ChatOpenAI):
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "あなたは外資系戦略コンサルのシニア。個人開発の実行可否判断に足る精度で外部環境を分析する。"
             "3C/PESTに加え、JTBD・市場規模推定（TAM/SAM/SOM）・ポーターの5フォース・規制/規約マップ・"
             "GTM（獲得実験）・ユニットエコノミクス（CAC/LTV/粗利/回収月）・技術実現性（推論コスト/遅延）・"
             "差別化/モート・主要リスク＆対策・シナリオ（楽観/中位/悲観）を含め、"
             "不足情報は**明示的な仮定**で補完し、数値は**レンジ**と**算出式**を示す。"
             "出力は日本語、Markdownで簡潔に。"
             "以下の5フィールド（customer_analysis/competitor_analysis/company_analysis/pest_analysis/summary_and_strategy）"
             "に、それぞれ関連する深掘り要素を**内包**して記述せよ。"
             f"{JP}"),
            ("human", """以下の統合要件定義書をもとに、外部環境を精緻に分析してください。

## 参考資料
- **統合要件定義書（個人開発向け）:** {professional_requirements_doc}

## 出力仕様（5フィールドに深掘り要素を内包して返す）
- customer_analysis: 
  - セグメンテーション（JTBD/ニーズ/利用トリガー/代替手段）
  - 市場規模推定（TAM/SAM/SOM）：仮定一覧、算出式、レンジをMarkdown表で
  - 初期ニッチ（ビーチヘッド）と“選ばれる理由”
- competitor_analysis:
  - 直接/間接競合の地図（タイプ別）
  - 機能×価格の比較表（最小限の列：価格帯/主要機能/長所/短所）
  - ポーターの5フォース要約（1〜2行×5項目）
  - 参入障壁と模倣可能性
- company_analysis:
  - コア差別化/モート（データ/ワークフロー/コミュニティ等）
  - 技術実現性：推論遅延目安、1処理あたり概算コスト（算出式）
  - ユニットエコノミクス（ARPU/CAC/粗利/回収月）：仮定と式を表で
  - GTM：最初の10人施策、主要チャネル、初期KPI
- pest_analysis:
  - P/E/S/T 各2〜3点のインサイト＋**含意（Implication）**を併記
  - 規制/規約マップ（著作権/プラットフォームToS/プライバシー/表示義務）
- summary_and_strategy:
  - 戦略骨子（勝ち筋、捨てるもの、MVPの最小勝利条件）
  - マイルストーン（0-4週/5-8週/9-12週）と計測指標
  - リスク×対策（Top5、回避/低減/受容の別）
  - シナリオ分析（楽観/中位/悲観：獲得速度、収益性、主要前提）
""")
        ])
        self.chain = prompt | llm.with_structured_output(ExternalEnvironmentAnalysis)

    def run(self, professional_requirements_doc: str) -> ExternalEnvironmentAnalysis:
        return self.chain.invoke({"professional_requirements_doc": professional_requirements_doc})

# ====== 分割アセッサ ======
class ProfitabilityAssessor:
    def __init__(self, llm: ChatOpenAI):
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "あなたは収益性の監査官。与えられた要件定義書と外部環境分析から、"
             "個人開発が**継続的に黒字化**できる見込みがあるかを判定する。"
             "価格戦略、ARPU、CAC、粗利、回収期間、チャーン、チャネルの現実性を短く吟味。"
             f"{JP} 出力は構造化（is_profitable, reason）。"),
            ("human",
             "## 要件定義書\n{requirements}\n\n## 外部環境\n顧客:{cust}\n競合:{comp}\n自社:{compy}\nPEST:{pest}\n要約:{sumst}\n\n判定:")
        ])
        self.chain = prompt | llm.with_structured_output(ProfitabilityAssessment)

    def run(self, req: str, ext: ExternalEnvironmentAnalysis) -> ProfitabilityAssessment:
        return self.chain.invoke({
            "requirements": req,
            "cust": ext.customer_analysis,
            "comp": ext.competitor_analysis,
            "compy": ext.company_analysis,
            "pest": ext.pest_analysis,
            "sumst": ext.summary_and_strategy,
        })

class FeasibilityAssessor:
    def __init__(self, llm: ChatOpenAI):
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "あなたは実現可能性の監査官。与えられた要件定義書と外部環境分析から、"
             "個人が負債なく**現実的な工数・コスト・技術難易度**で実装・運用できるかを判定する。"
             "MVPの範囲、スキル前提、推論コスト/遅延、運用負荷、依存外部APIの制約などを簡潔に評価。"
             f"{JP} 出力は構造化（is_feasible, reason）。"),
            ("human",
             "## 要件定義書\n{requirements}\n\n## 外部環境\n顧客:{cust}\n競合:{comp}\n自社:{compy}\nPEST:{pest}\n要約:{sumst}\n\n判定:")
        ])
        self.chain = prompt | llm.with_structured_output(FeasibilityAssessment)

    def run(self, req: str, ext: ExternalEnvironmentAnalysis) -> FeasibilityAssessment:
        return self.chain.invoke({
            "requirements": req,
            "cust": ext.customer_analysis,
            "comp": ext.competitor_analysis,
            "compy": ext.company_analysis,
            "pest": ext.pest_analysis,
            "sumst": ext.summary_and_strategy,
        })

class LegalAssessor:
    def __init__(self, llm: ChatOpenAI):
        prompt = ChatPromptTemplate.from_messages([
            ("system",
             "あなたは法務・コンプライアンス監査官。与えられた要件定義書と外部環境分析から、"
             "著作権・商標・プラットフォーム規約・個人情報/プライバシー・表示義務・年齢制限などの観点で"
             "プロダクトが**適合**しているかを判定する。重大違反の恐れがあればFalse。"
             f"{JP} 出力は構造化（is_compliant, reason）。"),
            ("human",
             "## 要件定義書\n{requirements}\n\n## 外部環境\n顧客:{cust}\n競合:{comp}\n自社:{compy}\nPEST:{pest}\n要約:{sumst}\n\n判定:")
        ])
        self.chain = prompt | llm.with_structured_output(LegalAssessment)

    def run(self, req: str, ext: ExternalEnvironmentAnalysis) -> LegalAssessment:
        return self.chain.invoke({
            "requirements": req,
            "cust": ext.customer_analysis,
            "comp": ext.competitor_analysis,
            "compy": ext.company_analysis,
            "pest": ext.pest_analysis,
            "sumst": ext.summary_and_strategy,
        })

# ====== 改善器 ======
class RequirementsImprover:
    def __init__(self, llm: ChatOpenAI):
        self.chain = (
            ChatPromptTemplate.from_messages([
                ("system",
                 "あなたはシニアPMです。以下の材料（要件定義書、外部環境、評価のNG理由）を受け、"
                 "個人開発で現実的に勝てる形へ**要件定義書を改訂**します。"
                 "改訂方針：MVPの絞り込み・差別化の明確化・収益性の改善（価格/コスト/チャネル）・"
                 "実現性の向上（段階導入/削減/代替手段）・法務の適合（フロー/同意/表記/権利）のいずれか。"
                 "元の良さは保持しつつ、危険な仮定は明確に変更。"
                 f"{JP} Markdownで完結な改訂版を返す。"),
                ("human",
                 "## 旧 要件定義書\n{req}\n\n## 外部環境の要点\n- 顧客:{cust}\n- 競合:{comp}\n- 自社:{compy}\n- PEST:{pest}\n- 要約:{sumst}\n\n"
                 "## 評価NG理由（収益性/実現性/法務のいずれか）\n{bad_reasons}\n\n"
                 "## 出力: 改訂版の要件定義書（Markdown）")
            ])
            | llm
            | StrOutputParser()
        )

    def run(self, req: str, ext: ExternalEnvironmentAnalysis, bad_reasons: List[str]) -> str:
        return self.chain.invoke({
            "req": req,
            "cust": ext.customer_analysis,
            "comp": ext.competitor_analysis,
            "compy": ext.company_analysis,
            "pest": ext.pest_analysis,
            "sumst": ext.summary_and_strategy,
            "bad_reasons": "\n".join(f"- {r}" for r in bad_reasons) if bad_reasons else "（明示なし）"
        })

# =========================
# 4. エージェント
# =========================
class RequirementsAgent:
    def __init__(self, llm: ChatOpenAI, persona_k: int = 5):
        self.clarification_interviewer = ClarificationInterviewer(llm=llm)
        self.request_summarizer = RequestSummarizer(llm=llm)
        self.summary_from_requirements = SummaryFromRequirements(llm=llm)

        # 制約抽出＋制約準拠ペルソナ生成
        self.constraint_extractor = PersonaConstraintExtractor(llm=llm)
        self.persona_generator = PersonaGeneratorV2(llm=llm, k=persona_k)

        # 2回目用のはい/いいえ変換器
        self.yesno_converter = YesNoQuestionConverter(llm=llm)

        self.interview_conductor = InterviewConductor(llm=llm, questions_per_persona=3)
        self.information_evaluator = InformationEvaluator(llm=llm)
        self.assumption_backfiller = AssumptionBackfiller(llm=llm)
        self.followup_asker = FollowupAsker(yesno_converter=self.yesno_converter)
        self.professional_requirements_generator = ProfessionalRequirementsGenerator(llm=llm)
        self.consultant_analyzer = ConsultantExternalAnalyzer(llm=llm)

        # 新・分割アセッサ
        self.profitability_assessor = ProfitabilityAssessor(llm=llm)
        self.feasibility_assessor = FeasibilityAssessor(llm=llm)
        self.legal_assessor = LegalAssessor(llm=llm)

        # 改善器
        self.requirements_improver = RequirementsImprover(llm=llm)

        # 旧：PlanAssessor（使わないが印字のため残せる）
        self.plan_assessor = None

        self.app = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(InterviewState)

        # --- ノード ---
        workflow.add_node("clarification_interview", self._clarification_interview_node)
        workflow.add_node("summarize_request", self._summarize_request_node)
        workflow.add_node("generate_personas", self._generate_personas_node)
        workflow.add_node("conduct_interviews", self._conduct_interviews_node)
        workflow.add_node("evaluate_information", self._evaluate_information_node)
        workflow.add_node("ask_followups", self._ask_followups_node)
        workflow.add_node("generate_professional_requirements", self._generate_professional_requirements_node)
        workflow.add_node("analyze_environment", self._analyze_environment_node)

        # 新：分割評価とゲート
        workflow.add_node("assess_profitability", self._assess_profitability_node)
        workflow.add_node("assess_feasibility", self._assess_feasibility_node)
        workflow.add_node("assess_legal", self._assess_legal_node)
        workflow.add_node("assessment_gate", self._assessment_gate_node)

        # 改善ループ
        workflow.add_node("improve_requirements", self._improve_requirements_node)

        # 最終成果物
        workflow.add_node("generate_pitch", self._generate_pitch_node)

        # --- エッジ ---
        workflow.set_entry_point("clarification_interview")
        workflow.add_edge("clarification_interview", "summarize_request")
        workflow.add_edge("summarize_request", "generate_personas")
        workflow.add_edge("generate_personas", "conduct_interviews")
        workflow.add_edge("conduct_interviews", "evaluate_information")

        # 分岐: 不十分なら 1回目=自由記述 / 2回目=はい・いいえ / 3回目以降=自動補完→前進
        workflow.add_conditional_edges(
            "evaluate_information",
            self._after_evaluation_branch,
            {
                "enough": "generate_professional_requirements",
                "need_followups": "ask_followups",
                "autofill_and_forward": "generate_professional_requirements",
            },
        )

        # 追加入力後は再要約 → 再度ペルソナから
        workflow.add_edge("ask_followups", "summarize_request")

        # 要件定義書 → 外部環境 → 分割評価（収益性→実現性→法務） → ゲート
        workflow.add_edge("generate_professional_requirements", "analyze_environment")
        workflow.add_edge("analyze_environment", "assess_profitability")
        workflow.add_edge("assess_profitability", "assess_feasibility")
        workflow.add_edge("assess_feasibility", "assess_legal")
        workflow.add_edge("assess_legal", "assessment_gate")

        # ゲート：全Trueなら最終成果物、False含むなら改善ループ
        workflow.add_conditional_edges(
            "assessment_gate",
            self._assessment_gate_branch,
            {
                "all_true": "generate_pitch",
                "refine_loop": "improve_requirements",
            },
        )

        # 改善ループ：改訂要件定義書→（その要件からサマリー再生成）→既存＋追加ペルソナ→再ヒアリング
        # 改善ノードで user_request と augment_personas をセットし、直接 persona 生成へ戻す
        workflow.add_edge("improve_requirements", "generate_personas")

        # 最終成果物 → END
        workflow.add_edge("generate_pitch", END)

        return workflow.compile()

    # --- ノード実装 ---
    def _clarification_interview_node(self, state: InterviewState):
        print("--- 1. 初期インタビュー ---")
        questions_str = self.clarification_interviewer.generate_questions(
            problem=state.initial_problem,
            persona=state.initial_persona,
            solution=state.initial_solution
        )
        print("\n【AIメンターからの質問】\n" + questions_str)
        print("\n回答を入力してください (Enterキー2回で終了):")
        user_answers = []
        while True:
            try:
                line = input()
            except EOFError:
                line = ""
            if not line:
                break
            user_answers.append(line)
        answers_str = "\n".join(user_answers)
        log = f"## 初期ヒアリング\n\n### 質問\n{questions_str}\n\n### 回答\n{answers_str}"
        return {"clarification_interview_log": log}

    def _summarize_request_node(self, state: InterviewState):
        print("\n--- 2. プロジェクトサマリー生成 ---")
        summary = self.request_summarizer.run(
            problem=state.initial_problem,
            persona=state.initial_persona,
            solution=state.initial_solution,
            interview_log=state.clarification_interview_log
        )
        return {"user_request": summary}

    def _generate_personas_node(self, state: InterviewState):
        print("\n--- 3. ペルソナ生成（制約準拠＋採点） ---")
        # 改善ループ中は既存を保持しつつ追加
        constraints = self.constraint_extractor.run(
            problem=state.initial_problem,
            persona=state.initial_persona,
            solution=state.initial_solution,
            interview_log=state.clarification_interview_log
        )
        personas_result = self.persona_generator.run(
            user_request=state.user_request,
            constraints=constraints
        )
        if state.augment_personas and state.personas:
            merged = list(state.personas) + list(personas_result.personas[:max(1, min(3, len(personas_result.personas)))])
            return {
                "personas": merged,
                "iteration": 0,
                "is_information_sufficient": False,
                "augment_personas": False,  # 使い切り
                "interviews": []  # 再ヒアリングのため一旦クリア
            }
        else:
            return {"personas": personas_result.personas, "iteration": 0, "is_information_sufficient": False}

    def _conduct_interviews_node(self, state: InterviewState):
        print(f"\n--- 4. 詳細インタビュー実施（各ペルソナ3問） (サイクル: {state.iteration + 1}) ---")
        interviews_result = self.interview_conductor.run(user_request=state.user_request, personas=state.personas)
        return {"interviews": interviews_result.interviews}

    def _evaluate_information_node(self, state: InterviewState):
        print("\n--- 5. 情報の十分性を評価 ---")
        evaluation_result = self.information_evaluator.run(user_request=state.user_request, interviews=state.interviews)
        print(f"評価: {'十分' if evaluation_result.is_sufficient else '不十分'}")
        if not evaluation_result.is_sufficient:
            if evaluation_result.gaps:
                print("不足している情報:")
                for g in evaluation_result.gaps:
                    print(f"- {g}")
            if evaluation_result.followup_questions:
                print("推奨される追加入力質問（要ユーザー回答）:")
                for q in evaluation_result.followup_questions:
                    print(f"- {q}")
        return {
            "is_information_sufficient": evaluation_result.is_sufficient,
            "iteration": state.iteration + 1,
            "evaluation_result": evaluation_result
        }

    def _ask_followups_node(self, state: InterviewState):
        """不足に基づく追加入力（1回目自由／2回目はい・いいえ）＋2回目後は自動補完を実施"""
        round_num = state.followup_round
        mode = "free" if round_num == 0 else "yesno"
        collected = self.followup_asker.collect(state.evaluation_result, mode=mode) if state.evaluation_result else ""
        appended_log = state.clarification_interview_log

        if collected:
            appended_log += "\n\n" + collected

        # 2回目が終わったら、自動補完で仮設定を追記して前に進めやすくする
        if round_num >= 1:
            auto_text = self.assumption_backfiller.run(
                user_request=state.user_request,
                interviews=state.interviews,
                gaps=state.evaluation_result.gaps if state.evaluation_result else []
            )
            appended_log += "\n\n## 自動補完（AI仮設定）\n" + auto_text

        return {"clarification_interview_log": appended_log, "followup_round": round_num + 1}

    def _generate_professional_requirements_node(self, state: InterviewState):
        print("\n--- 6. 【統合要件定義書（個人開発向け）】作成中 ---")
        prof_reqs = self.professional_requirements_generator.run(user_request=state.user_request, interviews=state.interviews)
        return {"professional_requirements_doc": prof_reqs}

    def _analyze_environment_node(self, state: InterviewState):
        print("\n--- 7. 【戦略コンサル】外部環境を分析中 ---")
        report = self.consultant_analyzer.run(professional_requirements_doc=state.professional_requirements_doc)
        return {"consultant_analysis_report": report}

    # ====== 分割評価ノード ======
    def _assess_profitability_node(self, state: InterviewState):
        print("\n--- 8a. 収益性評価 ---")
        assessment = self.profitability_assessor.run(req=state.professional_requirements_doc, ext=state.consultant_analysis_report)
        print(f"収益性: {'OK' if assessment.is_profitable else 'NG'} / 理由: {assessment.reason[:80]}...")
        return {"profitability": assessment}

    def _assess_feasibility_node(self, state: InterviewState):
        print("\n--- 8b. 実現性評価 ---")
        assessment = self.feasibility_assessor.run(req=state.professional_requirements_doc, ext=state.consultant_analysis_report)
        print(f"実現性: {'OK' if assessment.is_feasible else 'NG'} / 理由: {assessment.reason[:80]}...")
        return {"feasibility": assessment}

    def _assess_legal_node(self, state: InterviewState):
        print("\n--- 8c. 法務・コンプライアンス評価 ---")
        assessment = self.legal_assessor.run(req=state.professional_requirements_doc, ext=state.consultant_analysis_report)
        print(f"法務: {'OK' if assessment.is_compliant else 'NG'} / 理由: {assessment.reason[:80]}...")
        return {"legal": assessment}

    def _assessment_gate_node(self, state: InterviewState):
        # ダミー（遷移は _assessment_gate_branch が決定）
        return {}

    def _improve_requirements_node(self, state: InterviewState):
        print("\n--- 9. 改善ループ：要件定義書を改訂中 ---")
        bad_reasons: List[str] = []
        if state.profitability and not state.profitability.is_profitable:
            bad_reasons.append(f"[収益性NG] {state.profitability.reason}")
        if state.feasibility and not state.feasibility.is_feasible:
            bad_reasons.append(f"[実現性NG] {state.feasibility.reason}")
        if state.legal and not state.legal.is_compliant:
            bad_reasons.append(f"[法務NG] {state.legal.reason}")

        improved_doc = self.requirements_improver.run(
            req=state.professional_requirements_doc,
            ext=state.consultant_analysis_report,
            bad_reasons=bad_reasons
        )
        # 改訂版から新サマリーを生成
        new_summary = self.summary_from_requirements.run(improved_doc)

        print("→ 改訂版要件定義書をサマリーに反映。既存ペルソナを保持しつつ、追加ペルソナを生成して再ヒアリングへ。")
        return {
            "professional_requirements_doc": improved_doc,
            "user_request": new_summary,
            "augment_personas": True,
            "interviews": [],  # 再ヒアリング準備としてクリア
        }

    def _generate_pitch_node(self, state: InterviewState):
        print("\n--- 10. 【学生リーダーAI】プロジェクト企画書を作成中 ---")
        pitch = PitchGenerator(ChatOpenAI(model="gpt-4o", temperature=0)).run(
            user_request=state.user_request, interviews=state.interviews
        )
        return {"pitch_document": pitch}

    # --- 分岐関数 ---
    def _after_evaluation_branch(self, state: InterviewState) -> str:
        """十分性評価結果に応じて次のステップを返す
        - 十分: そのまま前進
        - 不十分: 1回目=自由記述で追加入力 / 2回目=はい・いいえで追加入力 / 3回目以降=自動補完して前進
        """
        if state.is_information_sufficient:
            return "enough"
        if state.followup_round < 2:
            return "need_followups"
        return "autofill_and_forward"

    def _assessment_gate_branch(self, state: InterviewState) -> str:
        ok = (
            state.profitability and state.profitability.is_profitable and
            state.feasibility and state.feasibility.is_feasible and
            state.legal and state.legal.is_compliant
        )
        return "all_true" if ok else "refine_loop"

    # 実行
    def run(self, problem: str, persona: str, solution: str):
        inputs = {"initial_problem": problem, "initial_persona": persona, "initial_solution": solution}
        return self.app.invoke(inputs, config={"recursion_limit": 100})
    
    

# =========================
# 5. 実行部分
# =========================
def main():
    parser = argparse.ArgumentParser(description="多角的アイデア評価＆ドキュメント生成エージェント（分割評価＋改善ループ）")
    parser.add_argument("--problem", type=str, required=True, help="解決したい課題")
    parser.add_argument("--persona", type=str, required=True, help="ターゲットとなるペルソナ")
    parser.add_argument("--solution", type=str, required=True, help="提案する解決策")
    parser.add_argument("--k", type=int, default=5, help="詳細分析で生成するペルソナの数")
    args = parser.parse_args()

    try:
        llm = ChatOpenAI(model="gpt-4o", temperature=0)
        agent = RequirementsAgent(llm=llm, persona_k=args.k)
        final_state = agent.run(problem=args.problem, persona=args.persona, solution=args.solution)

        print("\n\n" + "="*80)
        print(" " * 30 + "最終生成ドキュメント")
        print("="*80)

        # 1. 統合要件定義書（個人開発向け：ビジネス＋開発）
        print("\n\n" + "#" * 30 + " 1. 📝 統合要件定義書（個人開発向け：ビジネス＋開発） " + "#" * 30)
        print(final_state.get("professional_requirements_doc"))

        # 2. プロジェクト企画書
        print("\n\n" + "#" * 30 + " 2. 🚀 プロジェクト企画書 (学生向け) " + "#" * 30)
        print(final_state.get("pitch_document"))

        # 3. 外部環境分析レポート（抜粋表示）
        print("\n\n" + "#" * 30 + " 3. 📊 外部環境分析レポート (要点) " + "#" * 30)
        report = final_state.get("consultant_analysis_report")
        if report:
            print("\n## 市場・顧客分析\n" + report.customer_analysis)
            print("\n## 競合分析\n" + report.competitor_analysis)
            print("\n## 自社分析\n" + report.company_analysis)
            print("\n## PEST分析\n" + report.pest_analysis)
            print("\n## 要約と戦略的提言\n" + report.summary_and_strategy)

        # 4. 分割評価（最終状態）
        print("\n\n" + "#" * 30 + " 4. ✅ 分割評価の最終結果 " + "#" * 30)
        if final_state.get("profitability"):
            p = final_state["profitability"]
            print(f"- 収益性: {'OK' if p.is_profitable else 'NG'} | 理由: {p.reason}")
        if final_state.get("feasibility"):
            f = final_state["feasibility"]
            print(f"- 実現性: {'OK' if f.is_feasible else 'NG'} | 理由: {f.reason}")
        if final_state.get("legal"):
            l = final_state["legal"]
            print(f"- 法務: {'OK' if l.is_compliant else 'NG'} | 理由: {l.reason}")

    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")

if __name__ == "__main__":
    main()
