'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ContactFormData {
  name: string
  email: string
  company?: string
  category: string
  message: string
}

export async function submitContact(formData: ContactFormData) {
  try {
    const supabase = createSupabaseServerClient()

    // Save to Supabase
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        category: formData.category,
        message: formData.message,
        status: 'unread'
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving contact:', error)
      return { success: false, error: 'データベースへの保存に失敗しました' }
    }

    // Send email notification to admin
    try {
      if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
        const response = await fetch(`${appUrl}/api/send-contact-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        const result = await response.json()
        if (result.ok) {
          console.log('Email notification sent successfully')
        } else {
          console.error('Failed to send email notification')
        }
      } else {
        console.log('Email configuration missing, skipping email notification')
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError)
      // メール送信エラーでも、お問い合わせは保存されているので成功とする
    }

    // Revalidate admin pages to refresh contact counts (開発環境では無効化)
    try {
      if (process.env.NODE_ENV !== 'development') {
        revalidatePath('/admin')
        revalidatePath('/admin/contacts')
      }
    } catch (revalidateError) {
      console.log('Revalidation skipped in development:', revalidateError)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error in submitContact:', error)
    return { success: false, error: '予期しないエラーが発生しました' }
  }
}