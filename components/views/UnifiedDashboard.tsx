'use client'

import { User, Sparkles, TrendingUp, Package, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TrialRequestManager from "@/components/TrialRequestManager"
import ProductManager from "@/components/ProductManager"
import { useAuth } from '../../lib/hooks/useAuth'

type Props = {
  onBackToCustomer: () => void
  products?: any[]
  categories?: any[]
  onAddProduct?: (product: any) => void
  onUpdateProduct?: (product: any) => void
  onDeleteProduct?: (productId: string) => void
  onToggleStatus?: (productId: string) => void
}

export default function UnifiedDashboard({ 
  onBackToCustomer, 
  products = [],
  categories = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus
}: Props) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isStaff = ['manager', 'stylist', 'admin'].includes(user?.role || '') // 管理者もスタッフ機能を利用

  return (
    <div className="min-h-screen luxury-gradient font-inter">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rose-gold-gradient rounded-2xl flex items-center justify-center luxury-shadow">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-playfair luxury-text-gradient">AuraSelect</h1>
              <p className="text-gray-600 font-medium">
                {isAdmin ? '管理ダッシュボード' : 'スタッフダッシュボード'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBackToCustomer}
              className="border-2 border-amber-200 hover:bg-amber-50 font-medium px-6 py-3 rounded-xl bg-transparent"
            >
              顧客画面へ戻る
            </Button>
          </div>
        </div>

        {/* タブコンテンツ */}
        <Tabs defaultValue="trials" className="w-full">
          <TabsList className="inline-flex h-12 items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-amber-100 p-1 text-muted-foreground luxury-shadow">
            {/* 全ユーザー共通: トライアル管理 */}
            <TabsTrigger value="trials" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:rose-gold-gradient data-[state=active]:text-white data-[state=active]:shadow-sm">
              <Sparkles className="w-4 h-4 mr-2" /> トライアル管理
            </TabsTrigger>

            {/* 管理者のみ: 商品管理 */}
            {isAdmin && (
              <TabsTrigger value="products" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:rose-gold-gradient data-[state=active]:text-white data-[state=active]:shadow-sm">
                <Package className="w-4 h-4 mr-2" /> 商品管理
              </TabsTrigger>
            )}

            {/* 管理者のみ: ユーザー管理 */}
            {isAdmin && (
              <TabsTrigger value="users" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:rose-gold-gradient data-[state=active]:text-white data-[state=active]:shadow-sm">
                <Users className="w-4 h-4 mr-2" /> ユーザー管理
              </TabsTrigger>
            )}

            {/* スタッフ・管理者共通: 顧客管理 */}
            <TabsTrigger value="customers" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:rose-gold-gradient data-[state=active]:text-white data-[state=active]:shadow-sm">
              <User className="w-4 h-4 mr-2" /> 顧客管理
            </TabsTrigger>

            {/* 全ユーザー共通: 分析・レポート */}
            <TabsTrigger value="analytics" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:rose-gold-gradient data-[state=active]:text-white data-[state=active]:shadow-sm">
              <TrendingUp className="w-4 h-4 mr-2" /> 
              {isAdmin ? '高度な分析' : '基本分析'}
            </TabsTrigger>

            {/* 管理者のみ: システム設定 */}
            {isAdmin && (
              <TabsTrigger value="settings" className="inline-flex items-center justify-center whitespace-nowrap rounded-xl px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:rose-gold-gradient data-[state=active]:text-white data-[state=active]:shadow-sm">
                <Settings className="w-4 h-4 mr-2" /> システム設定
              </TabsTrigger>
            )}
          </TabsList>

          {/* トライアル管理タブ */}
          <TabsContent value="trials" className="mt-8">
            <TrialRequestManager />
          </TabsContent>

          {/* 商品管理タブ（管理者のみ） */}
          {isAdmin && (
            <TabsContent value="products" className="mt-8">
              <ProductManager
                products={products}
                categories={categories}
                onAddProduct={onAddProduct || (() => {})}
                onUpdateProduct={onUpdateProduct || (() => {})}
                onDeleteProduct={onDeleteProduct || (() => {})}
                onToggleStatus={onToggleStatus || (() => {})}
              />
            </TabsContent>
          )}

          {/* ユーザー管理タブ（管理者のみ） */}
          {isAdmin && (
            <TabsContent value="users" className="mt-8">
              <div className="text-center py-12">
                <div className="w-20 h-20 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 luxury-shadow">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-playfair font-semibold text-gray-800 mb-2">ユーザー管理機能</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  スタッフ・顧客アカウントの管理、権限設定などの機能を近日公開予定です
                </p>
              </div>
            </TabsContent>
          )}

          {/* 顧客管理タブ */}
          <TabsContent value="customers" className="mt-8">
            <div className="text-center py-12">
              <div className="w-20 h-20 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 luxury-shadow">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-gray-800 mb-2">顧客管理機能</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                顧客プロファイル、試用履歴、好み分析などの機能を近日公開予定です
              </p>
            </div>
          </TabsContent>

          {/* 分析・レポートタブ */}
          <TabsContent value="analytics" className="mt-8">
            <div className="text-center py-12">
              <div className="w-20 h-20 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 luxury-shadow">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-gray-800 mb-2">
                {isAdmin ? '高度な分析・レポート機能' : '基本分析機能'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {isAdmin 
                  ? 'ビジネスインサイト、売上分析、在庫予測、ROI分析などの高度な機能を近日公開予定です'
                  : 'トライアル成功率、人気商品分析、顧客傾向レポートなどの機能を近日公開予定です'
                }
              </p>
            </div>
          </TabsContent>

          {/* システム設定タブ（管理者のみ） */}
          {isAdmin && (
            <TabsContent value="settings" className="mt-8">
              <div className="text-center py-12">
                <div className="w-20 h-20 rose-gold-gradient rounded-full flex items-center justify-center mx-auto mb-6 luxury-shadow">
                  <Settings className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-playfair font-semibold text-gray-800 mb-2">システム設定機能</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  アプリケーション設定、セキュリティ設定、バックアップ管理などの機能を近日公開予定です
                </p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}