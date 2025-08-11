// Supabase レスポンスキャッシュ戦略
import { unstable_cache } from 'next/cache'

// アイデア一覧のキャッシュ（5秒間保持）
export const getCachedIdeas = unstable_cache(
  async (fetcher: () => Promise<any>) => {
    return await fetcher()
  },
  ['ideas-list'],
  {
    revalidate: 5,
    tags: ['ideas']
  }
)

// ユーザープロファイルのキャッシュ（60秒間保持）
export const getCachedUserProfile = unstable_cache(
  async (userId: string, fetcher: () => Promise<any>) => {
    return await fetcher()
  },
  ['user-profile'],
  {
    revalidate: 60,
    tags: ['user-profile']
  }
)

// 個別アイデアのキャッシュ（10秒間保持）
export const getCachedIdea = unstable_cache(
  async (ideaId: string, fetcher: () => Promise<any>) => {
    return await fetcher()
  },
  ['idea-detail'],
  {
    revalidate: 10,
    tags: ['idea']
  }
)