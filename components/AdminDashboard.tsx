"use client"

import type React from "react"

import { useState } from "react"
import { Settings, Plus, Edit, Trash2, Eye, Package, TrendingUp, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface AdminDashboardProps {
  products: any[]
  categories: any[]
  onAddProduct: (product: any) => void
  onUpdateProduct: (product: any) => void
  onDeleteProduct: (productId: string) => void
  onToggleStatus: (productId: string) => void
  editingProduct: any
  setEditingProduct: (product: any) => void
  showAddProduct: boolean
  setShowAddProduct: (show: boolean) => void
  onBackToCustomer: () => void
}

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
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    ingredients: "",
    fragrance: "",
    tags: "",
    stock: "",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
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
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const productData = {
      ...formData,
      price: Number.parseInt(formData.price),
      stock: Number.parseInt(formData.stock),
      tags: formData.tags.split(",").map((tag) => tag.trim()),
    }

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...productData })
    } else {
      onAddProduct(productData)
    }
    resetForm()
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      ingredients: product.ingredients,
      fragrance: product.fragrance,
      tags: product.tags.join(", "),
      stock: product.stock.toString(),
      image: product.image,
    })
    setShowAddProduct(true)
  }

  const handleCancel = () => {
    setEditingProduct(null)
    setShowAddProduct(false)
    resetForm()
  }

  // 統計データ
  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.isActive).length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const averagePrice = products.reduce((sum, p) => sum + p.price, 0) / products.length

  return (
    <div className="min-h-screen luxury-gradient font-inter">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 champagne-gradient rounded-2xl flex items-center justify-center luxury-shadow">
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
          <Card className="glass-effect luxury-shadow border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">総商品数</p>
                  <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect luxury-shadow border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">公開中</p>
                  <p className="text-2xl font-bold text-gray-800">{activeProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect luxury-shadow border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">総在庫数</p>
                  <p className="text-2xl font-bold text-gray-800">{totalStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect luxury-shadow border-0 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">平均価格</p>
                  <p className="text-2xl font-bold text-gray-800">¥{Math.round(averagePrice).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-2 border-amber-100 rounded-2xl p-2 luxury-shadow">
            <TabsTrigger
              value="products"
              className="data-[state=active]:champagne-gradient data-[state=active]:text-white rounded-xl font-medium py-3"
            >
              <Package className="w-5 h-5 mr-2" />
              商品管理
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:champagne-gradient data-[state=active]:text-white rounded-xl font-medium py-3"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              分析・レポート
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-8">
            <div className="space-y-6">
              {/* 商品追加ボタン */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-playfair text-gray-800">商品一覧</h2>
                <Button
                  onClick={() => setShowAddProduct(true)}
                  className="champagne-gradient hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl luxury-shadow"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  新商品追加
                </Button>
              </div>

              {/* 商品追加・編集フォーム */}
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
                          <label className="block text-sm font-semibold text-gray-800 mb-2">商品名</label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="商品名を入力"
                            required
                            className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">価格（円）</label>
                          <Input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            placeholder="価格を入力"
                            required
                            className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">カテゴリ</label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger className="border-2 border-amber-200 focus:border-amber-400 rounded-xl">
                              <SelectValue placeholder="カテゴリを選択" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.icon} {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">在庫数</label>
                          <Input
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            placeholder="在庫数を入力"
                            required
                            className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">商品説明</label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="商品の説明を入力"
                          rows={3}
                          className="border-2 border-amber-200 focus:border-amber-400 rounded-xl resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">主要成分</label>
                          <Textarea
                            value={formData.ingredients}
                            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                            placeholder="主要成分を入力"
                            rows={2}
                            className="border-2 border-amber-200 focus:border-amber-400 rounded-xl resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">香り</label>
                          <Input
                            value={formData.fragrance}
                            onChange={(e) => setFormData({ ...formData, fragrance: e.target.value })}
                            placeholder="香りの説明を入力"
                            className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">タグ（カンマ区切り）</label>
                        <Input
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="例: プレミアム, エイジングケア, 24金配合"
                          className="border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="submit"
                          className="champagne-gradient hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl luxury-shadow"
                        >
                          {editingProduct ? "更新" : "追加"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-xl bg-transparent"
                        >
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
                  <Card
                    key={product.id}
                    className="glass-effect luxury-shadow hover:luxury-shadow-lg transition-all duration-300 border-0 rounded-3xl overflow-hidden"
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-6">
                        <img
                          src={product.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center"}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-2xl"
                        />

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold font-playfair text-gray-800">{product.name}</h3>
                              <p className="text-gray-600">{categories.find((c) => c.id === product.category)?.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch checked={product.isActive} onCheckedChange={() => onToggleStatus(product.id)} />
                              <span className="text-sm text-gray-600">{product.isActive ? "公開中" : "非公開"}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">価格</p>
                              <p className="font-bold luxury-text-gradient">¥{product.price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">在庫</p>
                              <p className="font-bold text-gray-800">{product.stock}個</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">評価</p>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-gray-800">{product.rating}</span>
                                <span className="text-yellow-400">★</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">ステータス</p>
                              <div className="flex gap-1">
                                {product.isNew && <Badge className="bg-green-100 text-green-800 text-xs">NEW</Badge>}
                                {product.isPopular && <Badge className="bg-pink-100 text-pink-800 text-xs">人気</Badge>}
                                {product.isLimited && (
                                  <Badge className="bg-purple-100 text-purple-800 text-xs">限定</Badge>
                                )}
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

          <TabsContent value="analytics" className="mt-8">
            <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 champagne-gradient rounded-full flex items-center justify-center mx-auto mb-6 luxury-shadow">
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
