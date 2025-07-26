"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Sparkles, User, Bell, History, ArrowLeft, Star, Heart, Crown, Settings, Search, Filter, X, Droplets, Sprout, Gem } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import AdminDashboard from "@/components/AdminDashboard"

// サンプルデータ
const categories = [
  { id: "skincare", name: "スキンケア", icon: "Droplets", description: "美しい肌へ", color: "from-emerald-400 to-emerald-500" },
  { id: "shampoo", name: "シャンプー", icon: "Sprout", description: "髪に優しく", color: "from-blue-400 to-blue-500" },
  { id: "treatment", name: "トリートメント", icon: "Gem", description: "極上のケア", color: "from-purple-400 to-purple-500" },
  { id: "styling", name: "スタイリング", icon: "Crown", description: "理想のスタイル", color: "from-pink-400 to-pink-500" },
]

// initialProducts を定数として定義
const initialProducts = [
  // スキンケア商品
  {
    id: "1",
    name: "ラグジュアリー セラム",
    price: 12800,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1702471896938-6ca42213ab1c?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "24金ナノ粒子配合の最高級美容液。肌の奥深くまで浸透し、極上のハリと輝きを与えます。",
    ingredients: "24金ナノ粒子、プラチナコロイド、ヒアルロン酸、コラーゲンペプチんpド",
    fragrance: "ホワイトティー & ベルガモット",
    tags: ["プレミアム", "エイジングケア", "24金配合"],
    rating: 4.9,
    isNew: true,
    stock: 15,
    isActive: true,
  },
  {
    id: "2",
    name: "オーガニック シャンプー プレミアム",
    price: 8900,
    category: "shampoo",
    image: "https://images.unsplash.com/photo-1702471896938-6ca42213ab1c?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "希少なアルガンオイルとモロッコ産クレイを贅沢に配合。髪に自然な輝きと滑らかさを。",
    ingredients: "オーガニックアルガンオイル、モロッコ産クレイ、ローズヒップオイル",
    fragrance: "ダマスクローズ & サンダルウッド",
    tags: ["オーガニック", "無添加", "サロン専用"],
    rating: 4.8,
    isPopular: true,
    stock: 8,
    isActive: true,
  },
  {
    id: "3",
    name: "プラチナ リペア トリートメント",
    price: 15200,
    category: "treatment",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center",
    description: "プラチナナノ粒子が髪の内部まで浸透。ダメージを根本から修復し、シルクのような手触りに。",
    ingredients: "プラチナナノ粒子、ケラチン、シルクプロテイン、椿オイル",
    fragrance: "ジャスミン & ホワイトムスク",
    tags: ["プラチナ配合", "集中補修", "サロン限定"],
    rating: 5.0,
    isLimited: true,
    stock: 3,
    isActive: true,
  },
  // 追加のスキンケア商品
  {
    id: "4",
    name: "ヴェルヴェット モイスチャー クリーム",
    price: 9800,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center",
    description: "24時間保湿効果を持つ贅沢なクリーム。肌を包み込むような潤いと滑らかさを実現。",
    ingredients: "シアバター、ヒアルロン酸、セラミド、ビタミンE",
    fragrance: "ラベンダー & バニラ",
    tags: ["保湿", "敏感肌対応", "24時間効果"],
    rating: 4.7,
    isNew: false,
    stock: 25,
    isActive: true,
  },
  {
    id: "5",
    name: "ゴールド リフト マスク",
    price: 15800,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
    description: "24金とコラーゲン配合のリフトアップマスク。使用後は即座にハリと弾力を実感。",
    ingredients: "24金ナノ粒子、コラーゲン、エラスチン、ヒアルロン酸",
    fragrance: "ローズ & ジャスミン",
    tags: ["リフトアップ", "24金配合", "即効性"],
    rating: 4.9,
    isPopular: true,
    stock: 12,
    isActive: true,
  },
  {
    id: "6",
    name: "ピュア クレンザー ジェル",
    price: 6800,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center",
    description: "肌に優しい天然成分配合のクレンザー。毛穴の汚れを優しく落とし、透明感のある肌に。",
    ingredients: "天然クレイ、グリセリン、アロエベラ、ビタミンC",
    fragrance: "グリーンティー & ミント",
    tags: ["クレンジング", "天然成分", "敏感肌対応"],
    rating: 4.6,
    isNew: false,
    stock: 30,
    isActive: true,
  },
  // 追加のシャンプー商品 - 画像URLを多様化
  {
    id: "7",
    name: "シルク プロテイン シャンプー",
    price: 7500,
    category: "shampoo",
    image: "https://images.unsplash.com/photo-1610705267928-1b9f2fa7f1c5?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "シルクプロテイン配合で髪を包み込むような洗い上がり。ダメージヘアに最適。",
    ingredients: "シルクプロテイン、アミノ酸、セラミド、椿オイル",
    fragrance: "ピーチ & ホワイトティー",
    tags: ["シルク配合", "ダメージケア", "アミノ酸"],
    rating: 4.8,
    isNew: false,
    stock: 18,
    isActive: true,
  },
  {
    id: "8",
    name: "ボリューム アップ シャンプー",
    price: 8200,
    category: "shampoo",
    image: "https://images.unsplash.com/photo-1702471896938-6ca42213ab1c?q=80&w=1335&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "細毛・薄毛の方に最適なボリュームアップ効果。髪の根元から立ち上がる豊かな髪を。",
    ingredients: "ビオチン、パントテン酸、ニコチン酸、カフェイン",
    fragrance: "シトラス & ローズマリー",
    tags: ["ボリュームアップ", "細毛対応", "育毛サポート"],
    rating: 4.5,
    isNew: false,
    stock: 22,
    isActive: true,
  },
  {
    id: "9",
    name: "カラー プロテクト シャンプー",
    price: 7800,
    category: "shampoo",
    image: "https://images.unsplash.com/photo-1694101395622-65100ea10a0c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "カラーリング後の髪を保護し、色持ちを長く保つ。紫外線からも髪を守ります。",
    ingredients: "UVプロテクター、アミノ酸、セラミド、ビタミンE",
    fragrance: "ベルガモット & ラベンダー",
    tags: ["カラー保護", "UVカット", "色持ち"],
    rating: 4.7,
    isNew: false,
    stock: 15,
    isActive: true,
  },
  // 追加のトリートメント商品
  {
    id: "10",
    name: "ケラチン リペア マスク",
    price: 12800,
    category: "treatment",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
    description: "高濃度ケラチン配合で髪の内部構造を修復。パサつきや枝毛を根本から改善。",
    ingredients: "高濃度ケラチン、アミノ酸、セラミド、椿オイル",
    fragrance: "サンダルウッド & バニラ",
    tags: ["ケラチン配合", "集中修復", "パサつき改善"],
    rating: 4.8,
    isNew: false,
    stock: 10,
    isActive: true,
  },
  {
    id: "11",
    name: "モイスチャー バースト マスク",
    price: 9800,
    category: "treatment",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center",
    description: "水分を髪の奥深くまで浸透させる高保湿マスク。乾燥した髪に潤いを与えます。",
    ingredients: "ヒアルロン酸、セラミド、アミノ酸、グリセリン",
    fragrance: "ココナッツ & バニラ",
    tags: ["高保湿", "乾燥対策", "潤い補給"],
    rating: 4.6,
    isNew: false,
    stock: 20,
    isActive: true,
  },
  {
    id: "12",
    name: "スムース ストレート マスク",
    price: 11200,
    category: "treatment",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
    description: "髪を滑らかに整え、ストレート効果を実現。熱ダメージからも髪を保護。",
    ingredients: "ケラチン、アミノ酸、シリコン、熱保護成分",
    fragrance: "フレンチバニラ & ホワイトムスク",
    tags: ["ストレート効果", "熱保護", "滑らか"],
    rating: 4.7,
    isNew: false,
    stock: 14,
    isActive: true,
  },
  // スタイリング商品
  {
    id: "13",
    name: "ボリューム スプレー",
    price: 5800,
    category: "styling",
    image: "https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop&crop=center",
    description: "軽やかなボリュームを演出するスプレー。自然な立ち上がりで豊かな髪を実現。",
    ingredients: "ポリマー、アミノ酸、ビタミンB5、熱保護成分",
    fragrance: "シトラス & フローラル",
    tags: ["ボリューム", "軽やか", "自然な仕上がり"],
    rating: 4.5,
    isNew: false,
    stock: 25,
    isActive: true,
  },
  {
    id: "14",
    name: "シルク セラム",
    price: 7200,
    category: "styling",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
    description: "髪を包み込むようなシルクセラム。ツヤと滑らかさを演出し、スタイルを長持ち。",
    ingredients: "シルクプロテイン、アミノ酸、セラミド、椿オイル",
    fragrance: "ローズ & ジャスミン",
    tags: ["シルク配合", "ツヤ", "滑らか"],
    rating: 4.8,
    isPopular: true,
    stock: 16,
    isActive: true,
  },
  {
    id: "15",
    name: "カール ホールド ジェル",
    price: 6500,
    category: "styling",
    image: "https://images.unsplash.com/photo-1522338140269-f46f5913618a?w=400&h=400&fit=crop&crop=center",
    description: "自然なカールを美しくホールド。髪に重さを感じさせない軽やかな仕上がり。",
    ingredients: "ポリマー、アミノ酸、保湿成分、熱保護成分",
    fragrance: "ベルガモット & ラベンダー",
    tags: ["カールホールド", "軽やか", "自然な仕上がり"],
    rating: 4.6,
    isNew: false,
    stock: 20,
    isActive: true,
  },
  {
    id: "16",
    name: "ヒート プロテクション スプレー",
    price: 6800,
    category: "styling",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
    description: "熱ダメージから髪を保護しながらスタイリング。髪の健康を保ちながら美しい仕上がりを。",
    ingredients: "熱保護成分、アミノ酸、セラミド、ビタミンE",
    fragrance: "ココナッツ & バニラ",
    tags: ["熱保護", "スタイリング", "髪の健康"],
    rating: 4.7,
    isNew: false,
    stock: 18,
    isActive: true,
  },
  // 追加のスキンケア商品
  {
    id: "17",
    name: "ブライトニング エッセンス",
    price: 13800,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center",
    description: "ビタミンC配合で透明感のある肌を実現。シミ・くすみを改善し、明るい肌に導きます。",
    ingredients: "ビタミンC、アルブチン、ニコチン酸、ヒアルロン酸",
    fragrance: "オレンジ & ベルガモット",
    tags: ["美白", "ビタミンC", "透明感"],
    rating: 4.8,
    isNew: true,
    stock: 12,
    isActive: true,
  },
  {
    id: "18",
    name: "アンチエイジング クリーム",
    price: 16800,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center",
    description: "レチノールとペプチド配合で若々しい肌を維持。シワ・たるみを改善し、ハリのある肌に。",
    ingredients: "レチノール、ペプチド、ヒアルロン酸、ビタミンE",
    fragrance: "ローズ & サンダルウッド",
    tags: ["アンチエイジング", "レチノール", "シワ改善"],
    rating: 4.9,
    isLimited: true,
    stock: 8,
    isActive: true,
  },
  {
    id: "19",
    name: "ピーリング ジェル",
    price: 7800,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center",
    description: "肌に優しい天然成分配合のピーリングジェル。古い角質を優しく除去し、透明感のある肌に。",
    ingredients: "天然フルーツ酸、グリコール酸、サリチル酸、保湿成分",
    fragrance: "グリーンティー & レモン",
    tags: ["ピーリング", "天然成分", "透明感"],
    rating: 4.6,
    isNew: false,
    stock: 15,
    isActive: true,
  },
  {
    id: "20",
    name: "ナイト リペア セラム",
    price: 14200,
    category: "skincare",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&crop=center",
    description: "夜間の肌修復をサポートする高濃度セラム。睡眠中に肌を再生し、翌朝の美しい肌を実現。",
    ingredients: "ペプチド、セラミド、ヒアルロン酸、ビタミンB3",
    fragrance: "ラベンダー & カモミール",
    tags: ["ナイトリペア", "肌再生", "睡眠サポート"],
    rating: 4.8,
    isPopular: true,
    stock: 10,
    isActive: true,
  },
]

export default function AuraSelectLuxury() {
  // useState の初期値に管理画面用の状態を追加
  const [currentView, setCurrentView] = useState<"customer" | "staff" | "admin">("customer")

  // 商品管理用の状態を追加
  const [products, setProducts] = useState(initialProducts)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [trialCart, setTrialCart] = useState<any[]>([])
  const [memo, setMemo] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating">("name")
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // 試用リクエストの状態を修正 - 初期データを追加
  const [trialRequests, setTrialRequests] = useState<any[]>([
    // デモ用の初期データ
    {
      id: "demo_1",
      products: [
        {
          id: "1",
          name: "ラグジュアリー セラム",
          price: 12800,
          image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center",
          rating: 4.9,
        },
      ],
      memo: "乾燥肌なので保湿力の高いものを希望します",
      timestamp: "2024/01/18 14:30",
      userId: "demo_user_001",
      status: "pending",
    },
  ])

  // ローディング状態のシミュレーション
  useEffect(() => {
    if (selectedCategory) {
      setIsLoading(true)
      setTimeout(() => setIsLoading(false), 500)
    }
  }, [selectedCategory])

  const addToTrialCart = (product: any) => {
    if (!trialCart.find((item) => item.id === product.id)) {
      setTrialCart([...trialCart, product])
      
      // すべてのカテゴリの商品が選択された場合、ホームに戻る
      if (product.category === "skincare" || product.category === "shampoo" || product.category === "treatment" || product.category === "styling") {
        // 少し遅延を入れてからホームに戻る（アニメーション効果のため）
        setTimeout(() => {
          setSelectedProduct(null)
          setSelectedCategory(null)
        }, 500)
      }
    }
  }

  const removeFromTrialCart = (productId: string) => {
    setTrialCart(trialCart.filter((item) => item.id !== productId))
  }

  const sendTrialRequest = () => {
    if (trialCart.length === 0) {
      alert("商品を選択してください")
      return
    }

    const request = {
      id: Date.now().toString(),
      products: trialCart.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        rating: product.rating,
      })),
      memo,
      timestamp: new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      userId: "customer_" + Math.random().toString(36).substr(2, 9),
      status: "pending",
    }

    setTrialRequests((prevRequests) => [request, ...prevRequests])
    setTrialCart([])
    setMemo("")

    // 成功メッセージを表示
    alert("スタッフに通知いたしました！\n\nスタッフ画面（人型アイコン）で確認できます。")
  }

  // リクエスト処理用の関数を追加：
  const handleRequestAction = (requestId: string, action: "complete" | "cancel") => {
    setTrialRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId ? { ...request, status: action === "complete" ? "completed" : "cancelled" } : request,
      ),
    )
  }

  const deleteRequest = (requestId: string) => {
    if (confirm("このリクエストを削除しますか？")) {
      setTrialRequests((prevRequests) => prevRequests.filter((request) => request.id !== requestId))
    }
  }

  // 検索とフィルタリング機能
  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory ? product.category === selectedCategory : true
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        default:
          return a.name.localeCompare(b.name)
      }
    })

  // 商品管理用の関数を追加
  const addProduct = (productData: any) => {
    const newProduct = {
      ...productData,
      id: Date.now().toString(),
      rating: 0,
      isNew: false,
      isPopular: false,
      isLimited: false,
      isActive: true,
    }
    setProducts([...products, newProduct])
    setShowAddProduct(false)
  }

  const updateProduct = (productData: any) => {
    setProducts(products.map((p) => (p.id === productData.id ? productData : p)))
    setEditingProduct(null)
  }

  const deleteProduct = (productId: string) => {
    if (confirm("この商品を削除しますか？")) {
      setProducts(products.filter((p) => p.id !== productId))
    }
  }

  const toggleProductStatus = (productId: string) => {
    setProducts(products.map((p) => (p.id === productId ? { ...p, isActive: !p.isActive } : p)))
  }

  if (currentView === "staff") {
    return (
      <div className="min-h-screen luxury-gradient font-inter">
        <div className="container mx-auto p-4 md:p-6 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rose-gold-gradient rounded-2xl flex items-center justify-center luxury-shadow">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-playfair luxury-text-gradient">AuraSelect</h1>
                <p className="text-gray-600 font-medium">Staff Dashboard</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentView("customer")}
              className="border-2 border-amber-200 hover:bg-amber-50 font-medium px-4 md:px-6 py-3 rounded-xl"
            >
              顧客画面へ戻る
            </Button>
          </div>

          <Tabs defaultValue="notifications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border-2 border-amber-100 rounded-2xl p-2 luxury-shadow">
              <TabsTrigger
                value="notifications"
                className="data-[state=active]:rose-gold-gradient data-[state=active]:text-white rounded-xl font-medium py-3"
              >
                <Bell className="w-5 h-5 mr-2" />
                試用リクエスト
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:rose-gold-gradient data-[state=active]:text-white rounded-xl font-medium py-3"
              >
                <History className="w-5 h-5 mr-2" />
                履歴管理
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications" className="mt-8">
              <div className="space-y-6">
                {trialRequests.length === 0 ? (
                  <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl overflow-hidden">
                    <CardContent className="p-8 md:p-12 text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 luxury-shadow">
                        <Bell className="w-8 h-8 md:w-10 md:h-10 text-white" />
                      </div>
                      <h3 className="text-lg md:text-xl font-playfair font-semibold text-gray-800 mb-2">
                        新しいリクエストをお待ちしています
                      </h3>
                      <p className="text-gray-600">お客様からの試用リクエストがここに表示されます</p>
                    </CardContent>
                  </Card>
                ) : (
                  trialRequests.map((request) => (
                    <Card
                      key={request.id}
                      className="glass-effect luxury-shadow-lg border-0 rounded-3xl overflow-hidden"
                    >
                      <CardHeader className="champagne-accent border-b border-amber-200/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rose-gold-gradient rounded-full flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg md:text-xl font-playfair text-gray-800">試用リクエスト</CardTitle>
                              <p className="text-sm text-gray-600 mt-1">
                                {request.status === "pending" && "お客様がお待ちです"}
                                {request.status === "completed" && "対応完了"}
                                {request.status === "cancelled" && "キャンセル済み"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`border-0 px-3 md:px-4 py-2 rounded-full font-medium text-xs md:text-sm ${
                                request.status === "pending"
                                  ? "rose-gold-gradient text-white"
                                  : request.status === "completed"
                                    ? "bg-gradient-to-r from-green-400 to-green-500 text-white"
                                    : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                              }`}
                            >
                              {request.timestamp}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 md:p-6">
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-playfair font-semibold text-gray-800 mb-4 text-lg">選択された商品</h4>
                            <div className="space-y-3">
                              {request.products.map((product: any) => (
                                <div
                                  key={product.id}
                                  className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl luxury-shadow"
                                >
                                  <img
                                    src={product.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center"}
                                    alt={product.name}
                                    className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-xl"
                                  />
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-800 text-sm md:text-base">{product.name}</p>
                                    <p className="text-amber-600 font-bold text-sm md:text-base">¥{product.price.toLocaleString()}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                      <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs md:text-sm text-gray-600">{product.rating}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {request.memo && (
                            <div>
                              <h4 className="font-playfair font-semibold text-gray-800 mb-2">お客様からのメモ</h4>
                              <div className="champagne-accent p-4 rounded-2xl border border-amber-200/50">
                                <p className="text-gray-700 italic text-sm md:text-base">"{request.memo}"</p>
                              </div>
                            </div>
                          )}

                          {/* アクションボタンを追加 */}
                          <div className="flex gap-3 pt-4 border-t border-amber-200/30">
                            {request.status === "pending" && (
                              <>
                                <Button
                                  onClick={() => handleRequestAction(request.id, "complete")}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl luxury-shadow"
                                >
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  対応完了
                                </Button>
                                <Button
                                  onClick={() => handleRequestAction(request.id, "cancel")}
                                  variant="outline"
                                  className="flex-1 border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-xl"
                                >
                                  キャンセル
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() => deleteRequest(request.id)}
                              variant="outline"
                              size="sm"
                              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl px-4"
                            >
                              削除
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-8">
              <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 luxury-shadow">
                    <History className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-playfair font-semibold text-gray-800 mb-2">履歴機能</h3>
                  <p className="text-gray-600">近日公開予定です</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // 管理画面の条件分岐を追加（staff画面の後に）
  if (currentView === "admin") {
    return (
      <AdminDashboard
        products={products}
        categories={categories}
        onAddProduct={addProduct}
        onUpdateProduct={updateProduct}
        onDeleteProduct={deleteProduct}
        onToggleStatus={toggleProductStatus}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        showAddProduct={showAddProduct}
        setShowAddProduct={setShowAddProduct}
        onBackToCustomer={() => setCurrentView("customer")}
      />
    )
  }

  return (
    <div className="min-h-screen luxury-gradient font-inter">
      <div className="container mx-auto p-4 md:p-6 max-w-2xl lg:max-w-4xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rose-gold-gradient rounded-2xl flex items-center justify-center luxury-shadow hover-lift">
              <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-playfair luxury-text-gradient">AuraSelect</h1>
              <p className="text-gray-600 font-medium text-sm md:text-base">Discover Your Beauty</p>
            </div>
          </div>
          {/* ヘッダーのボタンに管理画面ボタンを追加 */}
          <div className="flex gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView("staff")}
              className="border-2 border-amber-200 hover:bg-amber-50 rounded-xl w-10 h-10 md:w-12 md:h-12 p-0 relative hover-lift"
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
              {trialRequests.filter((r) => r.status === "pending").length > 0 && (
                <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center luxury-shadow animate-pulse">
                  <span className="text-white text-xs font-bold">
                    {trialRequests.filter((r) => r.status === "pending").length}
                  </span>
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView("admin")}
              className="border-2 border-amber-200 hover:bg-amber-50 rounded-xl w-10 h-10 md:w-12 md:h-12 p-0 hover-lift"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-amber-200 hover:bg-amber-50 rounded-xl w-10 h-10 md:w-12 md:h-12 p-0 relative bg-transparent hover-lift"
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

        {/* 商品詳細画面 */}
        {selectedProduct && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <Button
              variant="ghost"
              onClick={() => setSelectedProduct(null)}
              className="mb-4 hover:bg-amber-50 rounded-xl font-medium hover-lift"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              戻る
            </Button>

            <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={selectedProduct.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center"}
                    alt={selectedProduct.name}
                    className="w-full h-64 md:h-80 object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {selectedProduct.isNew && (
                      <Badge className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white border-0 rounded-full px-3 py-1 text-xs">
                        NEW
                      </Badge>
                    )}
                    {selectedProduct.isPopular && (
                      <Badge className="bg-gradient-to-r from-pink-400 to-pink-500 text-white border-0 rounded-full px-3 py-1 text-xs">
                        POPULAR
                      </Badge>
                    )}
                    {selectedProduct.isLimited && (
                      <Badge className="bg-gradient-to-r from-purple-400 to-purple-500 text-white border-0 rounded-full px-3 py-1 text-xs">
                        LIMITED
                      </Badge>
                    )}
                  </div>
                  <div className="absolute top-4 left-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white hover-lift"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold font-playfair text-gray-800 mb-2">{selectedProduct.name}</h2>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl md:text-3xl font-bold luxury-text-gradient">
                        ¥{selectedProduct.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-700">{selectedProduct.rating}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed text-sm md:text-base">{selectedProduct.description}</p>

                  <div className="space-y-4">
                    <div className="champagne-accent p-4 rounded-2xl border border-amber-200/50">
                      <h4 className="font-playfair font-semibold text-gray-800 mb-2">主要成分</h4>
                      <p className="text-sm text-gray-700">{selectedProduct.ingredients}</p>
                    </div>
                    <div className="champagne-accent p-4 rounded-2xl border border-amber-200/50">
                      <h4 className="font-playfair font-semibold text-gray-800 mb-2">香り</h4>
                      <p className="text-sm text-gray-700">{selectedProduct.fragrance}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map((tag: string) => (
                      <Badge
                        key={tag}
                        className="bg-white/80 text-gray-700 border border-amber-200 hover:bg-amber-50 rounded-full px-3 md:px-4 py-2 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => addToTrialCart(selectedProduct)}
                    className="w-full rose-gold-gradient hover:opacity-90 text-white font-semibold py-4 rounded-2xl luxury-shadow text-base md:text-lg hover-lift"
                    disabled={trialCart.find((item) => item.id === selectedProduct.id)}
                  >
                    {trialCart.find((item) => item.id === selectedProduct.id) ? (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        カートに追加済み
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        試してみる
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* カテゴリ選択画面 */}
        {!selectedProduct && !selectedCategory && (
          <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom duration-300">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-playfair text-gray-800 mb-2">カテゴリを選択</h2>
              <p className="text-gray-600 mb-6 text-sm md:text-base">あなたにぴったりの商品を見つけましょう</p>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {categories.map((category) => {
                  const getIconComponent = (iconName: string) => {
                    if (iconName === "Droplets") return <Droplets className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    if (iconName === "Sprout") return <Sprout className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    if (iconName === "Gem") return <Gem className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    return <Crown className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  }
                  
                  return (
                    <Card
                      key={category.id}
                      className="glass-effect luxury-shadow hover:luxury-shadow-lg transition-all duration-300 cursor-pointer border-0 rounded-3xl overflow-hidden group hover-lift"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardContent className="p-4 md:p-6 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 luxury-shadow">
                          {getIconComponent(category.icon)}
                        </div>
                        <h3 className="font-playfair font-semibold text-gray-800 mb-1 text-sm md:text-base">{category.name}</h3>
                        <p className="text-xs md:text-sm text-gray-600">{category.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* 試用カート */}
            {trialCart.length > 0 && (
              <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl overflow-hidden animate-in slide-in-from-bottom duration-300">
                <CardHeader className="champagne-accent border-b border-amber-200/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 rose-gold-gradient rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <CardTitle className="text-lg md:text-xl font-playfair text-gray-800">試用カート</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-6">
                  <div className="space-y-3">
                    {trialCart.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 md:p-4 bg-white/60 rounded-2xl luxury-shadow hover-lift"
                      >
                        <div className="flex items-center gap-3 md:gap-4">
                          <img
                            src={product.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center"}
                            alt={product.name}
                            className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-xl"
                          />
                          <div>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">{product.name}</p>
                            <p className="text-amber-600 font-bold text-sm md:text-base">¥{product.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromTrialCart(product.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-playfair font-semibold text-gray-800 mb-3">
                      ご要望・メモ（任意）
                    </label>
                    <Textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="香りの好み、肌質、気になることなど、お気軽にお書きください"
                      className="border-2 border-amber-200 focus:border-amber-400 rounded-2xl resize-none"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={sendTrialRequest}
                    className="w-full rose-gold-gradient hover:opacity-90 text-white font-semibold py-4 rounded-2xl luxury-shadow text-base md:text-lg hover-lift"
                  >
                    <Bell className="w-5 h-5 mr-2" />
                    スタッフにお知らせ
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 商品一覧画面 */}
        {!selectedProduct && selectedCategory && (
          <div className="space-y-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setSelectedCategory(null)}
                className="hover:bg-amber-50 rounded-xl font-medium hover-lift"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                カテゴリ一覧
              </Button>
              <h2 className="text-lg md:text-xl font-bold font-playfair text-gray-800">
                {categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
            </div>

            {/* 検索とフィルター */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="商品を検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-2 border-amber-200 focus:border-amber-400 rounded-xl"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-2 border-amber-200 hover:bg-amber-50 rounded-xl px-3 hover-lift"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              {showFilters && (
                <div className="glass-effect p-4 rounded-2xl border border-amber-200/50 animate-in slide-in-from-top duration-200">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={sortBy === "name" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("name")}
                      className="rose-gold-gradient text-white border-0 rounded-full px-4 py-2"
                    >
                      名前順
                    </Button>
                    <Button
                      variant={sortBy === "price" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("price")}
                      className="border-2 border-amber-200 hover:bg-amber-50 rounded-full px-4 py-2"
                    >
                      価格順
                    </Button>
                    <Button
                      variant={sortBy === "rating" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("rating")}
                      className="border-2 border-amber-200 hover:bg-amber-50 rounded-full px-4 py-2"
                    >
                      評価順
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* ローディング状態 */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
              </div>
            )}

            {/* 商品一覧 */}
            {!isLoading && (
              <div className="space-y-4">
                {filteredAndSortedProducts.length === 0 ? (
                  <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-4 luxury-shadow">
                        <Search className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">商品が見つかりません</h3>
                      <p className="text-gray-600">検索条件を変更してお試しください</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAndSortedProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="glass-effect luxury-shadow hover:luxury-shadow-lg transition-all duration-300 cursor-pointer border-0 rounded-3xl overflow-hidden group hover-lift"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <CardContent className="p-4 md:p-5">
                        <div className="flex gap-4 md:gap-5">
                          <div className="relative">
                            <img
                              src={product.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center"}
                              alt={product.name}
                              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.isNew && (
                              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white border-0 rounded-full px-2 py-1 text-xs">
                                NEW
                              </Badge>
                            )}
                            {product.isPopular && (
                              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white border-0 rounded-full px-2 py-1 text-xs">
                                POPULAR
                              </Badge>
                            )}
                            {product.isLimited && (
                              <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-400 to-purple-500 text-white border-0 rounded-full px-2 py-1 text-xs">
                                LIMITED
                              </Badge>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold font-playfair text-gray-800 mb-1 text-sm md:text-base">{product.name}</h3>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-lg md:text-xl font-bold luxury-text-gradient">¥{product.price.toLocaleString()}</p>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs md:text-sm font-semibold text-gray-700">{product.rating}</span>
                              </div>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {product.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  className="text-xs bg-white/80 text-gray-700 border border-amber-200 rounded-full px-2 py-1"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
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
