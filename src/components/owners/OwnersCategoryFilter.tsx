'use client';

import { useRouter } from 'next/navigation';
import { Filter, TrendingUp, Clock, Heart } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  post_count: number;
}

interface OwnersCategoryFilterProps {
  categories: Category[];
  currentCategory?: string;
  currentSort?: string;
}

export function OwnersCategoryFilter({ 
  categories, 
  currentCategory,
  currentSort = 'latest'
}: OwnersCategoryFilterProps) {
  const router = useRouter();

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams();
    if (slug !== 'all') params.set('category', slug);
    if (currentSort && currentSort !== 'latest') params.set('sort', currentSort);
    
    const queryString = params.toString();
    router.push(`/owners${queryString ? `?${queryString}` : ''}`);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams();
    if (currentCategory && currentCategory !== 'all') params.set('category', currentCategory);
    if (sort !== 'latest') params.set('sort', sort);
    
    const queryString = params.toString();
    router.push(`/owners${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      {/* Categories */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-600" />
          <h3 className="text-lg font-semibold">カテゴリ</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !currentCategory || currentCategory === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌐 すべて
          </button>
          
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.slug)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                currentCategory === category.slug
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: currentCategory === category.slug ? category.color : undefined,
              }}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
              <span className="ml-1 text-xs opacity-80">({category.post_count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">並び替え:</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleSortChange('latest')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center ${
                  currentSort === 'latest' || !currentSort
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-4 h-4 mr-1" />
                最新
              </button>
              
              <button
                onClick={() => handleSortChange('popular')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center ${
                  currentSort === 'popular'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-4 h-4 mr-1" />
                人気
              </button>
              
              <button
                onClick={() => handleSortChange('trending')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center ${
                  currentSort === 'trending'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                トレンド
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}