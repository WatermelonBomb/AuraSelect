"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Package, CheckCircle, XCircle } from "lucide-react"
import type { TrialRequest } from "@/lib/types"

type ActivityFeedProps = {
  requests: TrialRequest[]
  maxItems?: number
}

export default function ActivityFeed({ requests, maxItems = 5 }: ActivityFeedProps) {
  const recentRequests = requests
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxItems)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "対応待ち"
      case "completed":
        return "完了"
      case "cancelled":
        return "キャンセル"
      default:
        return status
    }
  }

  return (
    <Card className="glass-effect border-0 rounded-3xl luxury-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-playfair">
          <Clock className="w-5 h-5" />
          最近の活動
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>最近の活動はありません</p>
          </div>
        ) : (
          recentRequests.map((request) => (
            <div key={request.id} className="flex items-start gap-3 p-3 bg-white/60 rounded-2xl">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(request.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {request.products.length}個の商品リクエスト
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {request.timestamp}
                    </p>
                    {request.memo && (
                      <p className="text-xs text-gray-700 mt-1 bg-gray-50 p-2 rounded-lg italic">
                        "{request.memo.length > 50 ? request.memo.slice(0, 50) + '...' : request.memo}"
                      </p>
                    )}
                  </div>
                  <Badge className={`text-xs ${getStatusColor(request.status)} border-0`}>
                    {getStatusText(request.status)}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {request.products.slice(0, 2).map((product: any) => (
                    <div key={product.id} className="flex items-center gap-1 text-xs bg-amber-50 px-2 py-1 rounded-full">
                      <Package className="w-3 h-3" />
                      <span className="truncate max-w-20">{product.name}</span>
                    </div>
                  ))}
                  {request.products.length > 2 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{request.products.length - 2}個
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}