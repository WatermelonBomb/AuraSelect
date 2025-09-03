'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, ShoppingCart, Send, User, Mail, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTrialRequest } from '../lib/hooks/useTrials'
import type { Product } from '@/components/views/AdminDashboard'
import type { CreateTrialRequest } from '@/lib/schemas/trial'

interface TrialCartEnhancedProps {
  trialCart: Product[]
  memo: string
  onRemoveFromCart: (productId: string) => void
  onUpdateMemo: (memo: string) => void
  onClearCart: () => void
  fmtPrice: (price: number) => string
}

export default function TrialCartEnhanced({
  trialCart,
  memo,
  onRemoveFromCart,
  onUpdateMemo,
  onClearCart,
  fmtPrice,
}: TrialCartEnhancedProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createTrialRequestMutation = useCreateTrialRequest()

  // ローカルストレージから顧客情報を復元
  useEffect(() => {
    const savedName = localStorage.getItem('auraselect_customer_name')
    const savedEmail = localStorage.getItem('auraselect_customer_email')
    
    if (savedName) setCustomerName(savedName)
    if (savedEmail) setCustomerEmail(savedEmail)
  }, [])

  // 顧客情報をローカルストレージに保存
  const saveCustomerInfo = () => {
    if (customerName) localStorage.setItem('auraselect_customer_name', customerName)
    if (customerEmail) localStorage.setItem('auraselect_customer_email', customerEmail)
  }

  // バリデーション
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (trialCart.length === 0) {
      newErrors.products = 'トライアルする商品を選択してください'
    }

    if (showContactForm) {
      if (!customerName.trim()) {
        newErrors.customerName = 'お名前を入力してください'
      }

      if (!customerEmail.trim()) {
        newErrors.customerEmail = 'メールアドレスを入力してください'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        newErrors.customerEmail = '有効なメールアドレスを入力してください'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // トライアルリクエスト送信
  const handleSendTrialRequest = async () => {
    if (!validateForm()) return

    // 各商品に対して個別にトライアルリクエストを作成
    for (const product of trialCart) {
      const requestData: CreateTrialRequest = {
        product_id: Number(product.id),
        quantity: 1,
        trial_duration_days: 7,
        reason: memo.trim() || '',
        customer_notes: memo.trim() || '',
      }

      try {
        await createTrialRequestMutation.mutateAsync(requestData)
      } catch (error) {
        console.error('Trial request failed:', error)
        return
      }
    }
      
    // 成功時にフォームをリセット
    onClearCart()
    onUpdateMemo('')
    setShowContactForm(false)
    saveCustomerInfo()
      
    // 成功メッセージはフックで表示される
  }

  // 合計金額計算
  const totalPrice = trialCart.reduce((sum, product) => sum + product.price, 0)

  if (trialCart.length === 0) {
    return (
      <Card className="glass-effect luxury-shadow border-0 rounded-3xl">
        <CardContent className="p-8 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">トライアルカートが空です</h3>
          <p className="text-gray-500">気になる商品を選んでトライアルリクエストを送信しましょう</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-effect luxury-shadow-lg border-0 rounded-3xl">
      <CardHeader>
        <CardTitle className="font-playfair flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-600" />
          トライアルカート ({trialCart.length}点)
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* エラー表示 */}
        {errors.products && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-red-600 text-sm font-medium">{errors.products}</p>
          </div>
        )}

        {/* 商品一覧 */}
        <div className="space-y-3">
          {trialCart.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-16 h-16 object-cover rounded-xl shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center"
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{product.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {product.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFromCart(product.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl w-10 h-10 p-0"
                aria-label={`${product.name}をカートから削除`}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>


        {/* メモ入力 */}
        <div>
          <label htmlFor="trial-memo" className="block text-sm font-semibold text-gray-800 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            ご要望・メモ（任意）
          </label>
          <Textarea
            id="trial-memo"
            name="memo"
            value={memo}
            onChange={(e) => onUpdateMemo(e.target.value)}
            placeholder="香りの好み、肌質、アレルギー、気になることなど何でもお気軽にお書きください"
            className="border-2 border-amber-200 focus:border-amber-400 rounded-2xl resize-none"
            rows={4}
          />
        </div>

        {/* 連絡先入力フォーム */}
        {showContactForm && (
          <div className="space-y-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-200/50">
            <h4 className="font-semibold text-gray-800 mb-3">連絡先情報（任意）</h4>
            
            <div>
              <label htmlFor="customer-name" className="block text-sm font-semibold text-gray-800 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                お名前
              </label>
              <Input
                id="customer-name"
                name="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="山田太郎"
                className={`border-2 rounded-xl ${
                  errors.customerName ? 'border-red-300' : 'border-blue-200 focus:border-blue-400'
                }`}
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="customer-email" className="block text-sm font-semibold text-gray-800 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                メールアドレス
              </label>
              <Input
                id="customer-email"
                name="customerEmail"
                type="email"
                autoComplete="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="example@email.com"
                className={`border-2 rounded-xl ${
                  errors.customerEmail ? 'border-red-300' : 'border-blue-200 focus:border-blue-400'
                }`}
              />
              {errors.customerEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>
              )}
            </div>

            <p className="text-sm text-gray-600">
              連絡先を入力いただくと、トライアル結果やおすすめ商品のご案内をお送りできます
            </p>
          </div>
        )}

        {/* アクションボタン */}
        <div className="space-y-3">
          {!showContactForm && (
            <Button
              variant="outline"
              onClick={() => setShowContactForm(true)}
              className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-3 rounded-2xl"
            >
              <User className="w-5 h-5 mr-2" />
              連絡先を入力してリクエスト送信
            </Button>
          )}

          <Button
            onClick={handleSendTrialRequest}
            disabled={createTrialRequestMutation.isPending}
            className="w-full rose-gold-gradient hover:opacity-90 text-white font-semibold py-4 rounded-2xl luxury-shadow"
          >
            {createTrialRequestMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                送信中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                スタッフにお知らせ
              </>
            )}
          </Button>

          {showContactForm && (
            <Button
              variant="outline"
              onClick={() => setShowContactForm(false)}
              className="w-full border-2 border-gray-300 font-medium py-3 rounded-2xl"
            >
              連絡先入力をスキップ
            </Button>
          )}
        </div>

        {/* 注意事項 */}
        <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl">
          <h5 className="font-semibold mb-2">ご注意</h5>
          <ul className="space-y-1 list-disc list-inside">
            <li>トライアルは店舗での体験となります</li>
            <li>商品の在庫状況により、ご希望に添えない場合があります</li>
            <li>スタッフからのご連絡までお時間をいただく場合があります</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}