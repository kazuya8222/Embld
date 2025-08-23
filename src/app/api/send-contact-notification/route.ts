import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const FROM_EMAIL = process.env.FROM_EMAIL!;

const schema = z.object({
  lastName: z.string().min(1).max(50),
  firstName: z.string().min(1).max(50),
  email: z.string().email().max(320),
  company: z.string().max(100).optional(),
  purpose: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export async function POST(req: Request) {
  try {
    const { lastName, firstName, email, company, purpose, message } = schema.parse(await req.json());

    const fullName = `${lastName} ${firstName}`;
    const subject = `【EmBld】新しいお問い合わせ: ${purpose}`;
    const text = [
      "新しいお問い合わせが届きました。",
      "",
      `名前: ${fullName}`,
      `メール: ${email}`,
      company ? `会社名: ${company}` : null,
      `目的: ${purpose}`,
      `受信時刻: ${new Date().toLocaleString('ja-JP')}`,
      "",
      "----- お問い合わせ内容 -----",
      message,
      "",
      "管理画面を確認:",
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/admin/contacts`
    ].filter(Boolean).join("\n");

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject,
      text,
      replyTo: email,
    });

    if (error) return NextResponse.json({ ok: false }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}