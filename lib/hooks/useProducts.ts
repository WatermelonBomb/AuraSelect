'use client'

import { useState, useEffect } from 'react'
import { productsApi, type ProductFilters } from '@/lib/api/products'
import type { Product } from '@/components/views/AdminDashboard'

// Fallback mock products for development when API is not available
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'プレミアム フェイスクリーム',
    price: 3500,
    category: 'skincare' as any,
    description: '保湿力抜群のフェイスクリーム。乾燥肌に効果的です。',
    ingredients: 'ヒアルロン酸、コラーゲン、セラミド',
    fragrance: 'ローズ',
    tags: ['保湿', 'エイジングケア', '敏感肌OK'],
    stock: 50,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center',
    rating: 4.5,
    isActive: true,
    isNew: true,
    isPopular: true
  },
  {
    id: '2',
    name: 'ナチュラル シャンプー',
    price: 2800,
    category: 'shampoo' as any,
    description: '天然成分100%のシャンプー。髪にやさしい洗浄力です。',
    ingredients: 'ココナッツオイル、アルガンオイル、天然エキス',
    fragrance: 'ラベンダー',
    tags: ['天然成分', 'ノンシリコン', '敏感肌OK'],
    stock: 30,
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center',
    rating: 4.2,
    isActive: true,
    isPopular: true
  },
  {
    id: '3',
    name: 'リュクス ヘアトリートメント',
    price: 4200,
    category: 'treatment' as any,
    description: '髪に深い栄養を与えるプレミアムトリートメント。毛先まで潤う美しい髪へ。',
    ingredients: 'アルガンオイル、ケラチン、プラセンタ',
    fragrance: 'フローラル',
    tags: ['ダメージケア', 'サロン品質', '深層補修'],
    stock: 25,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&crop=center',
    rating: 4.7,
    isActive: true,
    isNew: false,
    isLimited: true
  },
  {
    id: '4',
    name: 'プロフェッショナル スタイリングワックス',
    price: 3200,
    category: 'styling' as any,
    description: '長時間キープできるスタイリングワックス。理想のヘアスタイルを実現。',
    ingredients: 'カルナウバワックス、シアバター、植物オイル',
    fragrance: 'シトラス',
    tags: ['ロングキープ', '自然な仕上がり', 'プロ仕様'],
    stock: 40,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center',
    rating: 4.3,
    isActive: true,
    isNew: true,
    isPopular: false
  }
]

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try API first, fallback to mock data
      const data = await productsApi.getProducts(filters)
      setProducts(data)
    } catch (err) {
      console.warn('API unavailable, using mock data:', err)
      // Fallback to mock data for development
      setProducts(mockProducts.filter(p => {
        if (filters?.category && p.category !== filters.category) return false
        if (filters?.is_active !== undefined && p.isActive !== filters.is_active) return false
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          return p.name.toLowerCase().includes(searchLower) ||
                 p.description.toLowerCase().includes(searchLower) ||
                 p.tags.some(tag => tag.toLowerCase().includes(searchLower))
        }
        return true
      }))
      setError(null) // Don't show error for development fallback
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const refetch = () => {
    return fetchProducts()
  }

  const addProduct = async (productData: Omit<Product, 'id' | 'rating' | 'isActive' | 'isNew' | 'isPopular' | 'isLimited'>): Promise<Product> => {
    try {
      const newProduct = await productsApi.createProduct({
        name: productData.name,
        price: productData.price,
        category: productData.category,
        description: productData.description,
        ingredients: productData.ingredients,
        fragrance: productData.fragrance,
        tags: productData.tags,
        stock: productData.stock,
        image: productData.image
      })
      
      setProducts(prev => [...prev, newProduct])
      return newProduct
    } catch (err) {
      // Fallback to local state update for development
      const fallbackProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        rating: 4.0,
        isActive: true,
        isNew: true,
        isPopular: false
      }
      setProducts(prev => [...prev, fallbackProduct])
      return fallbackProduct
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = await productsApi.updateProduct(id, {
        name: updates.name,
        price: updates.price,
        category: updates.category,
        description: updates.description,
        ingredients: updates.ingredients,
        fragrance: updates.fragrance,
        tags: updates.tags,
        stock: updates.stock,
        image: updates.image,
        is_active: updates.isActive
      })
      
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      )
    } catch (err) {
      // Fallback to local state update for development
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? { ...product, ...updates } : product
        )
      )
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      await productsApi.deleteProduct(id)
      setProducts(prev => prev.filter(product => product.id !== id))
    } catch (err) {
      // Fallback to local state update for development
      setProducts(prev => prev.filter(product => product.id !== id))
    }
  }

  const toggleProductStatus = async (id: string) => {
    try {
      const updatedProduct = await productsApi.toggleProductStatus(id)
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      )
    } catch (err) {
      // Fallback to local state update for development
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? { ...product, isActive: !product.isActive } : product
        )
      )
    }
  }

  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id)
  }

  const getProductsByCategory = (category: string): Product[] => {
    return products.filter(product => product.category === category)
  }

  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase()
    return products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  return {
    products,
    isLoading,
    error,
    refetch,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductById,
    getProductsByCategory,
    searchProducts
  }
}