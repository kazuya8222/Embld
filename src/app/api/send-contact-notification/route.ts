import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const FROM_EMAIL = process.env.FROM_EMAIL!;

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(320),
  company: z.string().max(100).optional(),
  category: z.enum(['general', 'idea', 'development', 'business', 'bug', 'other']),
  message: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  try {
    const { name, email, company, category, message } = schema.parse(await req.json());

    const categoryLabels: { [key: string]: string } = {
      general: '一般的なお問い合わせ',
      idea: 'アイデア・企画について',
      development: '開発について',
      business: 'ビジネス提携について',
      bug: '不具合報告',
      other: 'その他'
    };

    const categoryLabel = categoryLabels[category] || category;

    const subject = `【EmBld】新しいお問い合わせ: ${categoryLabel}`;
    const text = [
      "新しいお問い合わせが届きました。",
      "",
      `名前: ${name}`,
      `メール: ${email}`,
      company ? `会社名: ${company}` : null,
      `カテゴリ: ${categoryLabel}`,
      `受信時刻: ${new Date().toLocaleString('ja-JP')}`,
      "",
      "----- お問い合わせ内容 -----",
      message,
      "",
      "管理画面で詳細を確認:",
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/contacts`
    ].filter(Boolean).join("\n");

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      text,
      reply_to: email,
    });

    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}