"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Plus, Edit, Trash2, Eye, Package, ToggleLeft, ToggleRight, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Product, Category, CategoryId } from "@/components/views/AdminDashboard"

type FormState = {
  name: string
  price: string
  category: CategoryId | ""
  description: string
  ingredients: string
  fragrance: string
  tags: string
  stock: string
  image: string
}

interface ProductManagerProps {
  products: Product[]
  categories: Category[]
  onAddProduct: (product: Omit<Product, "id" | "rating" | "isActive" | "isNew" | "isPopular" | "isLimited">) => void
  onUpdateProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
  onToggleStatus: (productId: string) => void
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center"

export default function ProductManager({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus,
}: ProductManagerProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | "all">("all")
  const [formData, setFormData] = useState<FormState>({
    name: "",
    price: "",
    category: "",
    description: "",
    ingredients: "",
    fragrance: "",
    tags: "",
    stock: "",
    image: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      ingredients: "",
      fragrance: "",
      tags: "",
      stock: "",
      image: "",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    const priceNum = Number(formData.price)
    const stockNum = Number(formData.stock)
    if (!formData.name.trim()) return alert("商品名を入力してください")
    if (!formData.category) return alert("カテゴリを選択してください")
    if (!Number.isFinite(priceNum) || priceNum <= 0) return alert("価格は正の数で入力してください")
    if (!Number.isInteger(stockNum) || stockNum < 0) return alert("在庫は0以上の整数で入力してください")

    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const base = {
      name: formData.name.trim(),
      price: priceNum,
      category: formData.category as CategoryId,
      description: formData.description.trim(),
      ingredients: formData.ingredients.trim(),
      fragrance: formData.fragrance.trim(),
      tags,
      stock: stockNum,
      image: formData.image || DEFAULT_IMAGE,
    }

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...base })
    } else {
      onAddProduct(base)
    }

    setShowAddProduct(false)
    setEditingProduct(null)
    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description,
      ingredients: product.ingredients,
      fragrance: product.fragrance,
      tags: product.tags.join(", "),
      stock: String(product.stock),
      image: product.image,
    })
    setShowAddProduct(true)
  }

  // フィルタリングされた商品
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && product.isActive) ||
                           (statusFilter === "inactive" && !product.isActive)
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [products, searchQuery, statusFilter, categoryFilter])

  // 統計
  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    inactive: products.filter(p => !p.isActive).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect border-0 rounded-2xl">
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">総商品数</div>
          </CardContent>
        </Card>
        <Card className="glass-effect border-0 rounded-2xl">
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">公開中</div>
          </CardContent>
        </Card>
        <Card className="glass-effect border-0 rounded-2xl">
          <CardContent className="p-4 text-center">
            <ToggleLeft className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            <div className="text-sm text-gray-600">非公開</div>
          </CardContent>
        </Card>
        <Card className="glass-effect border-0 rounded-2xl">
          <CardContent className="p-4 text-center">
            <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
            <div className="text-sm text-gray-600">在庫切れ</div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター・検索・新商品追加 */}
      <Card className="glass-effect border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            {/* 検索 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">商品検索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="商品名・説明で検索..."
                  className="pl-10 border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                />
              </div>
            </div>

            {/* ステータスフィルター */}
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="border-2 border-amber-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">公開中</SelectItem>
                  <SelectItem value="inactive">非公開</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* カテゴリフィルター */}
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
              <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
                <SelectTrigger className="border-2 border-amber-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 新商品追加ボタン */}
            <Button
              onClick={() => {
                setEditingProduct(null)
                resetForm()
                setShowAddProduct(true)
              }}
              className="rose-gold-gradient hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl luxury-shadow whitespace-nowrap"
            >
              <Plus className="w-5 h-5 mr-2" />
              新商品追加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 商品フォーム */}
      {showAddProduct && (
        <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 border-b border-yellow-200/30">
            <CardTitle className="text-xl font-playfair text-gray-800">
              {editingProduct ? "商品編集" : "新商品追加"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">商品名 *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="商品名を入力"
                    className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">価格 *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">カテゴリ *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as CategoryId }))}>
                    <SelectTrigger className="border-2 border-amber-200 rounded-xl">
                      <SelectValue placeholder="カテゴリを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">在庫数 *</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                    className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">商品説明</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="商品の特徴や使い方を説明"
                  className="border-2 border-amber-200 focus:border-amber-400 rounded-xl resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">成分</label>
                  <Input
                    value={formData.ingredients}
                    onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                    placeholder="主要成分を入力"
                    className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">香り</label>
                  <Input
                    value={formData.fragrance}
                    onChange={(e) => setFormData(prev => ({ ...prev, fragrance: e.target.value }))}
                    placeholder="香りの特徴"
                    className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">タグ</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="カンマ区切りでタグを入力"
                    className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">商品画像URL</label>
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="画像のURLを入力"
                    className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="rose-gold-gradient hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl luxury-shadow">
                  {editingProduct ? "更新" : "追加"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddProduct(false)
                    setEditingProduct(null)
                    resetForm()
                  }}
                  className="border-2 border-gray-300 font-medium px-8 py-3 rounded-xl"
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 商品一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="glass-effect hover:luxury-shadow-lg transition-all border-0 rounded-3xl overflow-hidden">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_IMAGE
                }}
              />
              <div className="absolute top-3 left-3">
                <Badge className={product.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}>
                  {product.isActive ? "公開中" : "非公開"}
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge className={product.stock > 0 ? "bg-blue-500 text-white" : "bg-red-500 text-white"}>
                  在庫 {product.stock}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="mb-3">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                <p className="text-2xl font-bold luxury-text-gradient">¥{product.price.toLocaleString()}</p>
                <Badge className="bg-amber-100 text-amber-800 text-xs mt-1">
                  {categories.find(c => c.id === product.category)?.name}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {product.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={product.isActive}
                    onCheckedChange={() => onToggleStatus(product.id)}
                  />
                  <span className="text-xs text-gray-600">公開</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(product)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeleteProduct(product.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="glass-effect border-0 rounded-3xl">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">商品が見つかりません</h3>
            <p className="text-gray-500 mb-4">検索条件を変更するか、新しい商品を追加してください</p>
            <Button
              onClick={() => {
                setEditingProduct(null)
                resetForm()
                setShowAddProduct(true)
              }}
              className="rose-gold-gradient hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl luxury-shadow"
            >
              <Plus className="w-5 h-5 mr-2" />
              新商品追加
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}