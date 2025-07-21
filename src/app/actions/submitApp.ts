'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function submitApp(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    throw new Error('認証が必要です')
  }

  // Extract form data
  const ideaId = formData.get('ideaId') as string
  const appName = formData.get('appName') as string
  const description = formData.get('description') as string
  const appUrl = formData.get('appUrl') as string
  const appStoreUrl = formData.get('appStoreUrl') as string
  const googlePlayUrl = formData.get('googlePlayUrl') as string

  // Validate required fields
  if (!ideaId || !appName) {
    throw new Error('必要な情報が不足しています')
  }

  // Check if idea exists
  const { data: idea, error: ideaError } = await supabase
    .from('ideas')
    .select('id')
    .eq('id', ideaId)
    .single()

  if (ideaError || !idea) {
    throw new Error('指定されたアイデアが見つかりません')
  }

  // Process store URLs
  let storeUrls: any = {}
  if (appStoreUrl) {
    storeUrls.appStore = appStoreUrl
  }
  if (googlePlayUrl) {
    storeUrls.googlePlay = googlePlayUrl
  }

  // Handle screenshot uploads
  const screenshots: string[] = []
  
  // Get all screenshot files from form data
  const entries = Array.from(formData.entries())
  
  for (const [key, value] of entries) {
    if (key.startsWith('screenshot_') && value instanceof File) {
      // In a real implementation, you would upload the file to storage
      // For now, we'll store a placeholder URL
      // This should be replaced with actual file upload logic using Supabase Storage
      
      const file = value as File
      const fileName = `${Date.now()}_${file.name}`
      
      try {
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('app-screenshots')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Error uploading screenshot:', uploadError)
          // Continue without this screenshot rather than failing entirely
        } else {
          // Get public URL for the uploaded file
          const { data: urlData } = supabase.storage
            .from('app-screenshots')
            .getPublicUrl(fileName)
          
          if (urlData.publicUrl) {
            screenshots.push(urlData.publicUrl)
          }
        }
      } catch (error) {
        console.error('Error processing screenshot:', error)
        // Continue without this screenshot
      }
    }
  }

  // Insert app into database
  const { data: appData, error: insertError } = await supabase
    .from('completed_apps')
    .insert({
      idea_id: ideaId,
      developer_id: session.user.id,
      app_name: appName,
      description: description || null,
      app_url: appUrl || null,
      store_urls: Object.keys(storeUrls).length > 0 ? storeUrls : null,
      screenshots: screenshots.length > 0 ? screenshots : null
    })
    .select()
    .single()

  if (insertError) {
    console.error('Error inserting app:', insertError)
    throw new Error('アプリの投稿に失敗しました')
  }

  // Update idea status to 'completed' if this is the first app
  const { data: existingApps, error: appsError } = await supabase
    .from('completed_apps')
    .select('id')
    .eq('idea_id', ideaId)

  if (!appsError && existingApps && existingApps.length === 1) {
    // This is the first app for this idea, update status
    await supabase
      .from('ideas')
      .update({ status: 'completed' })
      .eq('id', ideaId)
  }

  // Revalidate the idea detail page to show the new app
  revalidatePath(`/ideas/${ideaId}`)
  
  return { success: true, appId: appData.id }
}