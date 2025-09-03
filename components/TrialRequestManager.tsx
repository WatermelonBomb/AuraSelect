'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Archive,
  Loader2,
  MessageSquare,
  Eye,
  Filter,
  Search,
  AlertCircle,
  Calendar,
  User,
  Mail,
  Package,
  StickyNote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  useTrialRequests,
  useTrialStats,
  useApproveTrialRequest,
  useRejectTrialRequest,
  useCompleteTrialRequest,
} from '../lib/hooks/useTrials'
import type { TrialRequest } from '@/lib/schemas/trial'

export default function TrialRequestManager() {
  const [selectedRequest, setSelectedRequest] = useState<TrialRequest | null>(null)
  const [statusFilter, setStatusFilter] = useState<TrialRequest['status'] | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [staffNotes, setStaffNotes] = useState('')
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject' | 'complete' | null>(null)

  // API フック
  const { data: requestsData, isLoading, error } = useTrialRequests({
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort_by: 'created_at',
    sort_order: 'desc',
  })

  const { data: statsData } = useTrialStats()

  const approveRequestMutation = useApproveTrialRequest()
  const rejectRequestMutation = useRejectTrialRequest()
  const completeRequestMutation = useCompleteTrialRequest()

  // データ処理
  const requests = requestsData?.items || []
  const stats = statsData || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  }

  // 検索フィルター
  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests
    
    const query = searchQuery.toLowerCase()
    return requests.filter(request => 
      request.customer?.full_name?.toLowerCase().includes(query) ||
      request.customer?.email?.toLowerCase().includes(query) ||
      request.customer_notes?.toLowerCase().includes(query) ||
      request.product?.name.toLowerCase().includes(query)
    )
  }, [requests, searchQuery])

  // ステータス別のスタイル
  const getStatusBadge = (status: TrialRequest['status']) => {
    const styles = {
      pending: { className: 'bg-yellow-100 text-yellow-800', icon: Clock, text: '承認待ち' },
      approved: { className: 'bg-green-100 text-green-800', icon: CheckCircle, text: '承認済み' },
      rejected: { className: 'bg-red-100 text-red-800', icon: XCircle, text: '拒否' },
      in_progress: { className: 'bg-blue-100 text-blue-800', icon: Package, text: '進行中' },
      completed: { className: 'bg-purple-100 text-purple-800', icon: Archive, text: '完了' },
      cancelled: { className: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'キャンセル' },
    }
    
    const style = styles[status]
    const Icon = style.icon
    
    return (
      <Badge className={`${style.className} text-xs font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {style.text}
      </Badge>
    )
  }

  // アクション実行
  const handleAction = async () => {
    if (!selectedRequest || !currentAction) return

    try {
      switch (currentAction) {
        case 'approve':
          await approveRequestMutation.mutateAsync({ 
            id: selectedRequest.id, 
            staffNotes: staffNotes || undefined 
          })
          break
        case 'reject':
          await rejectRequestMutation.mutateAsync({ 
            id: selectedRequest.id, 
            reason: staffNotes || '' 
          })
          break
        case 'complete':
          await completeRequestMutation.mutateAsync({ 
            id: selectedRequest.id, 
            notes: staffNotes || undefined 
          })
          break
      }

      setShowNotesModal(false)
      setStaffNotes('')
      setCurrentAction(null)
      setSelectedRequest(null)
    } catch (error) {
      console.error(`${currentAction} action failed:`, error)
    }
  }

  // アクション開始
  const startAction = (request: TrialRequest, action: 'approve' | 'reject' | 'complete') => {
    setSelectedRequest(request)
    setCurrentAction(action)
    setStaffNotes(request.staff_notes || '')
    setShowNotesModal(true)
  }

  // エラー状態
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-600 mb-2">エラーが発生しました</h3>
        <p className="text-gray-600">トライアルリクエストの読み込みに失敗しました</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="全体"
          value={stats.total}
          icon={<Package className="w-5 h-5" />}
          color="gray"
        />
        <StatCard
          title="承認待ち"
          value={stats.pending}
          icon={<Clock className="w-5 h-5" />}
          color="yellow"
          highlight={stats.pending > 0}
        />
        <StatCard
          title="承認済み"
          value={stats.approved}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="拒否"
          value={stats.rejected}
          icon={<XCircle className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="完了"
          value={stats.completed}
          icon={<Archive className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* フィルター・検索 */}
      <Card className="glass-effect border-0 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search-trials" className="sr-only">トライアルリクエストを検索</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search-trials"
                  name="search"
                  placeholder="顧客名、メール、商品名で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-2 border-amber-200 rounded-xl"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <SelectTrigger className="border-2 border-amber-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="pending">承認待ち</SelectItem>
                  <SelectItem value="approved">承認済み</SelectItem>
                  <SelectItem value="rejected">拒否</SelectItem>
                  <SelectItem value="completed">完了</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* リクエスト一覧 */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-gray-600">トライアルリクエストを読み込んでいます...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="glass-effect border-0 rounded-2xl">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {statusFilter === 'all' ? 'トライアルリクエストがありません' : `${statusFilter}のリクエストがありません`}
            </h3>
            <p className="text-gray-500">新しいリクエストが届くとここに表示されます</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAction={startAction}
            />
          ))}
        </div>
      )}

      {/* アクションモーダル */}
      {showNotesModal && selectedRequest && currentAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {currentAction === 'approve' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {currentAction === 'reject' && <XCircle className="w-5 h-5 text-red-600" />}
                {currentAction === 'complete' && <Archive className="w-5 h-5 text-blue-600" />}
                {currentAction === 'approve' && 'リクエストを承認'}
                {currentAction === 'reject' && 'リクエストを拒否'}
                {currentAction === 'complete' && 'リクエストを完了'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="staff-notes" className="block text-sm font-semibold text-gray-800 mb-2">
                  スタッフメモ（任意）
                </label>
                <Textarea
                  id="staff-notes"
                  name="staffNotes"
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  placeholder="内部メモや顧客への連絡事項"
                  rows={3}
                  className="border-2 border-amber-200 rounded-xl resize-none"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleAction}
                  disabled={
                    approveRequestMutation.isPending ||
                    rejectRequestMutation.isPending ||
                    completeRequestMutation.isPending
                  }
                  className={`flex-1 font-semibold py-3 rounded-xl ${
                    currentAction === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : currentAction === 'reject'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {(approveRequestMutation.isPending || rejectRequestMutation.isPending || completeRequestMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  実行
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNotesModal(false)
                    setStaffNotes('')
                    setCurrentAction(null)
                    setSelectedRequest(null)
                  }}
                  className="flex-1 border-2 border-gray-300 rounded-xl"
                >
                  キャンセル
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// 統計カード
function StatCard({
  title,
  value,
  icon,
  color,
  highlight = false,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: 'gray' | 'yellow' | 'green' | 'red' | 'blue'
  highlight?: boolean
}) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
  }

  return (
    <Card className={`glass-effect border-0 rounded-2xl ${highlight ? 'ring-2 ring-yellow-400' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// リクエストカード
function RequestCard({
  request,
  onAction,
}: {
  request: TrialRequest
  onAction: (request: TrialRequest, action: 'approve' | 'reject' | 'complete') => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className="glass-effect luxury-shadow border-0 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-800">
                {request.customer?.full_name || '匿名顧客'}
              </h3>
              {getStatusBadge(request.status)}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(request.created_at), 'MM/dd HH:mm', { locale: ja })}
              </div>
              {request.customer?.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {request.customer.email}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700">商品:</span>
              <div className="flex flex-wrap gap-1">
                {request.product && (
                  <Badge className="bg-amber-100 text-amber-800 text-xs">
                    {request.product.name}
                  </Badge>
                )}
              </div>
            </div>

            {request.customer_notes && (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl mb-4">
                <StickyNote className="w-4 h-4 inline mr-1" />
                {request.customer_notes}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="border-gray-200 rounded-lg"
          >
            <Eye className="w-4 h-4 mr-1" />
            {showDetails ? '詳細を閉じる' : '詳細を見る'}
          </Button>

          <div className="flex gap-2">
            {request.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => onAction(request, 'reject')}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  拒否
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAction(request, 'approve')}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  承認
                </Button>
              </>
            )}
            
            {request.status === 'approved' && (
              <Button
                size="sm"
                onClick={() => onAction(request, 'complete')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Archive className="w-4 h-4 mr-1" />
                完了
              </Button>
            )}
          </div>
        </div>

        {/* 詳細表示 */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">選択商品一覧</h4>
              <div className="grid gap-2">
                {request.product && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={request.product.image_url || "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop&crop=center"}
                      alt={request.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{request.product.name}</p>
                      <p className="text-sm text-gray-600">¥{request.product.price.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {request.staff_notes && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">スタッフメモ</h4>
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  {request.staff_notes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  function getStatusBadge(status: TrialRequest['status']) {
    const styles = {
      pending: { className: 'bg-yellow-100 text-yellow-800', icon: Clock, text: '承認待ち' },
      approved: { className: 'bg-green-100 text-green-800', icon: CheckCircle, text: '承認済み' },
      rejected: { className: 'bg-red-100 text-red-800', icon: XCircle, text: '拒否' },
      in_progress: { className: 'bg-blue-100 text-blue-800', icon: Package, text: '進行中' },
      completed: { className: 'bg-purple-100 text-purple-800', icon: Archive, text: '完了' },
      cancelled: { className: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'キャンセル' },
    }
    
    const style = styles[status]
    const Icon = style.icon
    
    return (
      <Badge className={`${style.className} text-xs font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {style.text}
      </Badge>
    )
  }
}