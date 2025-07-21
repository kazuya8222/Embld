'use client'

import { useState } from 'react'
import { Upload, X, Plus, ExternalLink } from 'lucide-react'

interface AppSubmissionFormProps {
  ideaId: string
  onSubmit: (formData: FormData) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function AppSubmissionForm({ ideaId, onSubmit, onCancel, isSubmitting = false }: AppSubmissionFormProps) {
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      const validFiles = newFiles.filter(file => {
        const isValidType = file.type.startsWith('image/')
        const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
        return isValidType && isValidSize
      })
      
      setScreenshots(prev => [...prev, ...validFiles])
      
      // Create preview URLs
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviewUrls])
    }
  }

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => {
      // Clean up the URL object
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})

    const formData = new FormData(event.currentTarget)
    formData.append('ideaId', ideaId)

    // Add screenshots to form data
    screenshots.forEach((file, index) => {
      formData.append(`screenshot_${index}`, file)
    })

    // Basic validation
    const appName = formData.get('appName') as string
    const appUrl = formData.get('appUrl') as string
    
    const newErrors: Record<string, string> = {}
    
    if (!appName?.trim()) {
      newErrors.appName = 'アプリ名は必須です'
    }
    
    if (appUrl && !isValidUrl(appUrl)) {
      newErrors.appUrl = '有効なURLを入力してください'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('App submission error:', error)
    }
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="appName" className="block text-sm font-medium text-gray-700 mb-2">
            アプリ名 *
          </label>
          <input
            type="text"
            id="appName"
            name="appName"
            required
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.appName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="開発したアプリの名前を入力してください"
          />
          {errors.appName && (
            <p className="mt-1 text-sm text-red-600">{errors.appName}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            アプリの説明
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="アプリの機能や特徴を詳しく説明してください"
          />
        </div>

        <div>
          <label htmlFor="appUrl" className="block text-sm font-medium text-gray-700 mb-2">
            アプリURL
          </label>
          <input
            type="url"
            id="appUrl"
            name="appUrl"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
              errors.appUrl ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://your-app.com"
          />
          {errors.appUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.appUrl}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Webアプリの場合はURL、モバイルアプリの場合はストアページのURLを入力してください
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            スクリーンショット（任意）
          </label>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="screenshots" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">クリックしてファイルを選択</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (最大5MBまで)</p>
                </div>
                <input
                  id="screenshots"
                  name="screenshots"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotUpload}
                  disabled={isSubmitting}
                />
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSubmitting}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="storeUrls" className="block text-sm font-medium text-gray-700 mb-2">
            ストアURL（任意）
          </label>
          <div className="space-y-2">
            <input
              type="url"
              name="appStoreUrl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="App Store URL"
            />
            <input
              type="url"
              name="googlePlayUrl"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Google Play Store URL"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            モバイルアプリの場合は、該当するストアのURLを入力してください
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          disabled={isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? '送信中...' : 'アプリを投稿'}
        </button>
      </div>
    </form>
  )
}