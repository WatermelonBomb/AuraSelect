"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Settings, Plus, Edit, Trash2, Eye, Package, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

// ==== 型定義（必要なら /components/types に切り出しOK） ====
export type CategoryId = "skincare" | "shampoo" | "treatment" | "styling"

export type Category = {
  id: CategoryId
  name: string
  icon?: React.ReactNode
  description?: string
}

export type Product = {
  id: string
  name: string
  price: number
  category: CategoryId
  description: string
  ingredients: string
  fragrance: string
  tags: string[]
  stock: number
  image: string
  rating: number
  isActive: boolean
  isNew?: boolean
  isPopular?: boolean
  isLimited?: boolean
}

interface AdminDashboardProps {
  products: Product[]
  categories: Category[]
  onAddProduct: (product: Omit<Product, "id" | "rating" | "isActive" | "isNew" | "isPopular" | "isLimited">) => void
  onUpdateProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
  onToggleStatus: (productId: string) => void
  editingProduct: Product | null
  setEditingProduct: (product: Product | null) => void
  showAddProduct: boolean
  setShowAddProduct: (show: boolean) => void
  onBackToCustomer: () => void
}

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

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center"

export default function AdminDashboard({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus,
  editingProduct,
  setEditingProduct,
  showAddProduct,
  setShowAddProduct,
  onBackToCustomer,
}: AdminDashboardProps) {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    price: "",
    category: "",
    description: "",
    ingredients: "",
    fragrance: "",
    tags: "",
    stock: "",
    image: DEFAULT_IMAGE,
  })

  const resetForm = () =>
    setFormData({
      name: "",
      price: "",
      category: "",
      description: "",
      ingredients: "",
      fragrance: "",
      tags: "",
      stock: "",
      image: DEFAULT_IMAGE,
    })

  // ---- 送信 ----
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

    // 送信後はフォームを閉じたい場合 ↓ の2行を有効化
    setShowAddProduct(false)
    setEditingProduct(null)

    resetForm()
  }

  // ---- 編集開始 ----
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
      image: product.image || DEFAULT_IMAGE,
    })
    setShowAddProduct(true)
  }

  const handleCancel = () => {
    setEditingProduct(null)
    setShowAddProduct(false)
    resetForm()
  }

  // ---- 統計（0件ガード + メモ化）----
  const { totalProducts, activeProducts, totalStock, averagePrice } = useMemo(() => {
    const totalProducts = products.length
    const activeProducts = products.filter((p) => p.isActive).length
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
    const avg = totalProducts ? products.reduce((s, p) => s + (p.price || 0), 0) / totalProducts : 0
    return { totalProducts, activeProducts, totalStock, averagePrice: Math.round(avg) }
  }, [products])

  return (
    <div className="min-h-screen luxury-gradient font-inter">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rose-gold-gradient rounded-2xl flex items-center justify-center luxury-shadow">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-playfair luxury-text-gradient">AuraSelect</h1>
              <p className="text-gray-600 font-medium">商品管理システム</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onBackToCustomer}
            className="border-2 border-amber-200 hover:bg-amber-50 font-medium px-6 py-3 rounded-xl bg-transparent"
          >
            顧客画面へ戻る
          </Button>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Package className="w-6 h-6 text-blue-600" />} title="総商品数" value={totalProducts} color="blue" />
          <StatCard icon={<Eye className="w-6 h-6 text-green-600" />} title="公開中" value={activeProducts} color="green" />
          <StatCard icon={<TrendingUp className="w-6 h-6 text-purple-600" />} title="総在庫数" value={totalStock} color="purple" />
          <StatCard icon={<DollarSign className="w-6 h-6 text-yellow-600" />} title="平均価格" value={`¥${averagePrice.toLocaleString()}`} color="yellow" />
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-2 border-amber-100 rounded-2xl p-2 luxury-shadow">
            <TabsTrigger value="products" className="data-[state=active]:rose-gold-gradient data-[state=active]:text-white rounded-xl font-medium py-3">
              <Package className="w-5 h-5 mr-2" /> 商品管理
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:rose-gold-gradient data-[state=active]:text-white rounded-xl font-medium py-3">
              <TrendingUp className="w-5 h-5 mr-2" /> 分析・レポート
            </TabsTrigger>
          </TabsList>

          {/* 商品管理タブ */}
          <TabsContent value="products" className="mt-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-playfair text-gray-800">商品一覧</h2>
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
              </div>

              {/* フォーム */}
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
                        <LabeledInput
                          label="商品名"
                          value={formData.name}
                          onChange={(v) => setFormData({ ...formData, name: v })}
                          required
                        />
                        <LabeledInput
                          label="価格（円）"
                          type="number"
                          value={formData.price}
                          onChange={(v) => setFormData({ ...formData, price: v })}
                          required
                          min="1"
                        />
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">カテゴリ</label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value as CategoryId })}
                          >
                            <SelectTrigger className="border-2 border-amber-200 focus:border-amber-400 rounded-xl">
                              <SelectValue placeholder="カテゴリを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  <span className="inline-flex items-center gap-2">
                                    {c.icon} {c.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <LabeledInput
                          label="在庫数"
                          type="number"
                          value={formData.stock}
                          onChange={(v) => setFormData({ ...formData, stock: v })}
                          required
                          min="0"
                        />
                      </div>

                      <LabeledTextarea
                        label="商品説明"
                        value={formData.description}
                        onChange={(v) => setFormData({ ...formData, description: v })}
                        rows={3}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LabeledTextarea
                          label="主要成分"
                          value={formData.ingredients}
                          onChange={(v) => setFormData({ ...formData, ingredients: v })}
                          rows={2}
                        />
                        <LabeledInput
                          label="香り"
                          value={formData.fragrance}
                          onChange={(v) => setFormData({ ...formData, fragrance: v })}
                        />
                      </div>

                      <LabeledInput
                        label="タグ（カンマ区切り）"
                        value={formData.tags}
                        onChange={(v) => setFormData({ ...formData, tags: v })}
                        placeholder="例: プレミアム, エイジングケア, 24金配合"
                      />

                      <div className="flex gap-4">
                        <Button type="submit" className="rose-gold-gradient text-white font-semibold px-8 py-3 rounded-xl luxury-shadow">
                          {editingProduct ? "更新" : "追加"}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancel} className="border-2 border-gray-300 px-8 py-3 rounded-xl">
                          キャンセル
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* 商品一覧 */}
              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="glass-effect luxury-shadow hover:luxury-shadow-lg transition-all border-0 rounded-3xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <img
                          src={product.image || DEFAULT_IMAGE}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-2xl"
                        />

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold font-playfair text-gray-800">{product.name}</h3>
                              <p className="text-gray-600">
                                {categories.find((c) => c.id === product.category)?.name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch checked={product.isActive} onCheckedChange={() => onToggleStatus(product.id)} />
                              <span className="text-sm text-gray-600">{product.isActive ? "公開中" : "非公開"}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <Info label="価格" value={`¥${product.price.toLocaleString()}`} accent />
                            <Info label="在庫" value={`${product.stock}個`} />
                            <Info
                              label="評価"
                              value={
                                <span className="inline-flex items-center gap-1">
                                  <span className="font-bold text-gray-800">{product.rating}</span>
                                  <span className="text-yellow-400">★</span>
                                </span>
                              }
                            />
                            <div>
                              <p className="text-sm text-gray-600">ステータス</p>
                              <div className="flex gap-1">
                                {product.isNew && <Badge className="bg-green-100 text-green-800 text-xs">NEW</Badge>}
                                {product.isPopular && <Badge className="bg-pink-100 text-pink-800 text-xs">人気</Badge>}
                                {product.isLimited && <Badge className="bg-purple-100 text-purple-800 text-xs">限定</Badge>}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              編集
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDeleteProduct(product.id)}
                              className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              削除
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 分析タブ（プレースホルダ） */}
          <TabsContent value="analytics" className="mt-8">
            <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 luxury-shadow">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-playfair font-semibold text-gray-800 mb-2">分析・レポート機能</h3>
                <p className="text-gray-600">売上分析、人気商品ランキング、在庫アラートなどの機能を近日公開予定です</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/* ====== 小さな表示用コンポーネント ====== */

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode
  title: string
  value: React.ReactNode
  color: "blue" | "green" | "purple" | "yellow"
}) {
  const bg = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    yellow: "bg-yellow-100",
  }[color]
  const text = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    yellow: "text-yellow-600",
  }[color]

  return (
    <Card className="glass-effect luxury-shadow border-0 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className={`text-2xl font-bold text-gray-800 ${text}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  min,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: "text" | "number"
  placeholder?: string
  required?: boolean
  min?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-2">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
      />
    </div>
  )
}

function LabeledTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-2">{label}</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="border-2 border-amber-200 focus:border-amber-400 rounded-xl resize-none"
      />
    </div>
  )
}
function Info({
  label,
  value,
  accent = false,
}: {
  label: string
  value: React.ReactNode
  accent?: boolean
}) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`font-bold ${accent ? "luxury-text-gradient" : "text-gray-800"}`}>
        {value}
      </p>
    </div>
  )
}

