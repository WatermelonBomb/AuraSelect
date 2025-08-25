"use client"

import type { LucideIcon } from "lucide-react"
import {
  ShoppingCart, Sparkles, User, Settings, ArrowLeft, Star, Search, Filter, X, Heart,
  Droplets, Sprout, Gem, Crown, // ← 文字列指定のときに使う
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import type { Product, CategoryId } from "@/app/page"

// icon は「文字列 or Lucide コンポーネント」の両対応
type Category = { id: CategoryId; name: string; icon?: string | LucideIcon; description?: string }

type Props = {
  products: Product[]
  categories: Category[]
  selectedCategory: CategoryId | null
  selectedProduct: Product | null
  trialCart: Product[]
  memo: string
  searchQuery: string
  sortBy: "name" | "price" | "rating"
  showFilters: boolean
  isLoading: boolean

  setSelectedCategory: (c: CategoryId | null) => void
  setSelectedProduct: (p: Product | null) => void
  addToTrialCart: (p: Product) => void
  removeFromTrialCart: (id: string) => void
  setMemo: (s: string) => void
  sendTrialRequest: () => void
  setSearchQuery: (s: string) => void
  setSortBy: (s: "name" | "price" | "rating") => void
  setShowFilters: (b: boolean) => void

  goStaff: () => void
  goAdmin: () => void

  pendingCount: number
  fmtPrice: (n: number) => string
}

// 文字列→アイコンのマップ（必要なものだけ追加）
const iconMap = {
  Droplets,
  Sprout,
  Gem,
  Crown,
} as const

function CategoryIcon({ icon }: { icon?: string | LucideIcon }) {
  let Comp: LucideIcon | undefined
  if (typeof icon === "string") {
    Comp = iconMap[icon as keyof typeof iconMap]
  } else if (icon) {
    Comp = icon
  }
  // 見つからない場合は Sparkles をフォールバック表示
  const Fallback = Sparkles
  const IconComp = Comp ?? Fallback
  return <IconComp className="w-8 h-8 md:w-10 md:h-10 text-white" />
}

export default function CustomerView(props: Props) {
  const {
    products, categories, selectedCategory, selectedProduct, trialCart, memo,
    searchQuery, sortBy, showFilters, isLoading,
    setSelectedCategory, setSelectedProduct, addToTrialCart, removeFromTrialCart,
    setMemo, sendTrialRequest, setSearchQuery, setSortBy, setShowFilters,
    goStaff, goAdmin, pendingCount, fmtPrice,
  } = props

  return (
    <div className="min-h-screen luxury-gradient font-inter">
      <div className="container mx-auto p-4 md:p-6 max-w-2xl lg:max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rose-gold-gradient rounded-2xl flex items-center justify-center luxury-shadow">
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-playfair luxury-text-gradient">AuraSelect</h1>
              <p className="text-gray-600 font-medium text-sm md:text-base">Discover Your Beauty</p>
            </div>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goStaff}
              aria-label="スタッフ画面へ"
              className="border-2 border-amber-200 hover:bg-amber-50 rounded-xl w-10 h-10 md:w-12 md:h-12 p-0 relative"
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
              {pendingCount > 0 && (
                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center luxury-shadow">
                  <span className="text-white text-xs font-bold">{pendingCount}</span>
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goAdmin}
              aria-label="管理画面へ"
              className="border-2 border-amber-200 hover:bg-amber-50 rounded-xl w-10 h-10 md:w-12 md:h-12 p-0"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="試用カート"
              className="border-2 border-amber-200 hover:bg-amber-50 rounded-xl w-10 h-10 md:w-12 md:h-12 p-0 relative bg-transparent"
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              {trialCart.length > 0 && (
                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 rose-gold-gradient rounded-full flex items-center justify-center luxury-shadow">
                  <span className="text-white text-xs font-bold">{trialCart.length}</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* 商品詳細 */}
        {selectedProduct && (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedProduct(null)} className="mb-2 rounded-xl">
              <ArrowLeft className="w-5 h-5 mr-2" /> 戻る
            </Button>

            <Card className="glass-effect border-0 rounded-3xl overflow-hidden luxury-shadow-lg">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Button variant="ghost" size="sm" aria-label="お気に入り" className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm">
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold font-playfair text-gray-800">{selectedProduct.name}</h2>
                      <p className="text-gray-700 mt-2">{selectedProduct.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl md:text-3xl font-bold luxury-text-gradient">¥{fmtPrice(selectedProduct.price)}</p>
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-700">{selectedProduct.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Card className="champagne-accent border-0 rounded-2xl">
                      <CardHeader><CardTitle className="text-base">主要成分</CardTitle></CardHeader>
                      <CardContent className="pt-0 text-sm text-gray-700">{selectedProduct.ingredients}</CardContent>
                    </Card>
                    <Card className="champagne-accent border-0 rounded-2xl">
                      <CardHeader><CardTitle className="text-base">香り</CardTitle></CardHeader>
                      <CardContent className="pt-0 text-sm text-gray-700">{selectedProduct.fragrance}</CardContent>
                    </Card>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map((t) => (
                      <Badge key={t} className="bg-white/80 text-gray-700 border border-amber-200 rounded-full px-3 py-2 text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => addToTrialCart(selectedProduct)}
                    disabled={trialCart.some((i) => i.id === selectedProduct.id)}
                    className="w-full rose-gold-gradient text-white font-semibold py-4 rounded-2xl"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    {trialCart.some((i) => i.id === selectedProduct.id) ? "カートに追加済み" : "試してみる"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* カテゴリ一覧（デフォルト） */}
        {!selectedProduct && !selectedCategory && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-playfair text-gray-800 mb-2">カテゴリを選択</h2>
              <p className="text-gray-600 mb-6 text-sm md:text-base">あなたにぴったりの商品を見つけましょう</p>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {categories.map((c) => (
                  <Card
                    key={c.id}
                    className="glass-effect luxury-shadow hover:luxury-shadow-lg border-0 rounded-3xl cursor-pointer"
                    onClick={() => setSelectedCategory(c.id)}
                  >
                    <CardContent className="p-5 text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-3 luxury-shadow">
                        <CategoryIcon icon={c.icon} />
                      </div>
                      <h3 className="font-playfair font-semibold text-gray-800 mb-1 text-sm md:text-base">{c.name}</h3>
                      <p className="text-xs md:text-sm text-gray-600">{c.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* 試用カート */}
            {trialCart.length > 0 && (
              <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl">
                <CardHeader><CardTitle className="font-playfair">試用カート</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {trialCart.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-white/60 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-xl" />
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                            <p className="text-amber-600 font-bold text-sm">¥{fmtPrice(p.price)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removeFromTrialCart(p.id)} className="text-red-500 rounded-xl">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">ご要望・メモ（任意）</label>
                    <Textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="香りの好み、肌質、気になることなど"
                      className="border-2 border-amber-200 rounded-2xl resize-none"
                      rows={3}
                    />
                  </div>

                  <Button onClick={sendTrialRequest} className="w-full rose-gold-gradient text-white font-semibold py-4 rounded-2xl">
                    <Sparkles className="w-5 h-5 mr-2" />
                    スタッフにお知らせ
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 商品一覧（カテゴリ選択時） */}
        {!selectedProduct && selectedCategory && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setSelectedCategory(null)} className="rounded-xl">
                <ArrowLeft className="w-5 h-5 mr-2" /> カテゴリ一覧
              </Button>
              <h2 className="text-lg md:text-xl font-bold font-playfair text-gray-800">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
            </div>

            {/* 検索とフィルタ */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="商品を検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-amber-200 rounded-xl"
                  />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-2 border-amber-200 rounded-xl px-3">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              {showFilters && (
                <div className="glass-effect p-4 rounded-2xl border border-amber-200/50">
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => setSortBy("name")} className="rounded-full px-4 py-2"
                      variant={sortBy === "name" ? "default" : "outline"}>
                      名前順
                    </Button>
                    <Button size="sm" onClick={() => setSortBy("price")} className="rounded-full px-4 py-2"
                      variant={sortBy === "price" ? "default" : "outline"}>
                      価格順
                    </Button>
                    <Button size="sm" onClick={() => setSortBy("rating")} className="rounded-full px-4 py-2"
                      variant={sortBy === "rating" ? "default" : "outline"}>
                      評価順
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* ローディング */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              </div>
            )}

            {/* 一覧 */}
            {!isLoading && (
              <div className="space-y-4">
                {products.length === 0 ? (
                  <Card className="glass-effect border-0 rounded-3xl">
                    <CardContent className="p-8 text-center text-gray-600">商品が見つかりません</CardContent>
                  </Card>
                ) : (
                  products
                    .filter((p) => p.category === selectedCategory)
                    .map((p) => (
                      <Card key={p.id} onClick={() => setSelectedProduct(p)}
                        className="glass-effect luxury-shadow hover:luxury-shadow-lg transition-all cursor-pointer border-0 rounded-3xl">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <img src={p.image} alt={p.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl" />
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-800 mb-1 text-sm md:text-base">{p.name}</h3>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-lg md:text-xl font-bold luxury-text-gradient">¥{fmtPrice(p.price)}</p>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm font-semibold text-gray-700">{p.rating}</span>
                                </div>
                              </div>
                              <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{p.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
