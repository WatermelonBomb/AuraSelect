"use client"

import { Bell, History, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { TrialRequest } from "@/app/page"

type Props = {
  trialRequests: TrialRequest[]
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  onDelete: (id: string) => void
  onBack: () => void
}

export default function StaffDashboard({ trialRequests, onComplete, onCancel, onDelete, onBack }: Props) {
  return (
    <div className="min-h-screen luxury-gradient font-inter">
      <div className="container mx-auto p-4 md:p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rose-gold-gradient rounded-2xl flex items-center justify-center luxury-shadow">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-playfair luxury-text-gradient">AuraSelect</h1>
              <p className="text-gray-600 font-medium">Staff Dashboard</p>
            </div>
          </div>
          <Button variant="outline" onClick={onBack} className="border-2 border-amber-200 hover:bg-amber-50 rounded-xl">
            顧客画面へ戻る
          </Button>
        </div>

        <div className="space-y-6">
          {trialRequests.length === 0 ? (
            <Card className="glass-effect border-0 rounded-3xl">
              <CardContent className="p-10 text-center text-gray-600">
                新しいリクエストはありません
              </CardContent>
            </Card>
          ) : (
            trialRequests.map((r) => (
              <Card key={r.id} className="glass-effect border-0 rounded-3xl overflow-hidden luxury-shadow-lg">
                <CardHeader className="champagne-accent border-b border-amber-200/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rose-gold-gradient rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg md:text-xl font-playfair text-gray-800">試用リクエスト</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {r.status === "pending" && "お客様がお待ちです"}
                          {r.status === "completed" && "対応完了"}
                          {r.status === "cancelled" && "キャンセル済み"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`border-0 px-3 md:px-4 py-2 rounded-full text-white ${
                        r.status === "pending"
                          ? "bg-gradient-to-r from-rose-400 to-pink-500"
                          : r.status === "completed"
                            ? "bg-gradient-to-r from-green-400 to-green-500"
                            : "bg-gradient-to-r from-gray-400 to-gray-500"
                      }`}
                    >
                      {r.timestamp}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  <div className="space-y-3">
                    {r.products.map((p) => (
                      <div key={p.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl">
                        <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-xl" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-amber-600 font-bold">¥{new Intl.NumberFormat("ja-JP").format(p.price)}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-700">{p.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {r.memo && (
                    <div className="champagne-accent p-4 rounded-2xl border border-amber-200/50">
                      <p className="text-gray-700 italic">"{r.memo}"</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-amber-200/30">
                    {r.status === "pending" && (
                      <>
                        <Button onClick={() => onComplete(r.id)} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl">
                          対応完了
                        </Button>
                        <Button onClick={() => onCancel(r.id)} variant="outline" className="flex-1 border-2 border-red-200 text-red-600 rounded-xl">
                          キャンセル
                        </Button>
                      </>
                    )}
                    <Button onClick={() => onDelete(r.id)} variant="outline" className="border-2 border-gray-300 text-gray-600 rounded-xl">
                      削除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
