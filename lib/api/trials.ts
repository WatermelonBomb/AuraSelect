import { apiClient } from './client'
import type { TrialRequest, CreateTrialRequest } from '@/lib/schemas/trial'

export interface TrialFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'completed'
  user_id?: string
  product_id?: string
  skip?: number
  limit?: number
  sort_by?: 'created_at' | 'updated_at' | 'status'
}

export interface TrialStats {
  total_requests: number
  pending_requests: number
  approved_requests: number
  completed_requests: number
  success_rate: number
}

export interface UpdateTrialStatusData {
  status: 'approved' | 'rejected' | 'completed'
  staff_notes?: string
}

// Trial API functions
export const trialsApi = {
  // Get all trial requests with filters
  async getTrialRequests(filters?: TrialFilters): Promise<TrialRequest[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.append('status', filters.status)
      if (filters?.user_id) params.append('user_id', filters.user_id)
      if (filters?.product_id) params.append('product_id', filters.product_id)
      if (filters?.skip) params.append('skip', String(filters.skip))
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.sort_by) params.append('sort_by', filters.sort_by)

      const response = await apiClient.get(`/trial-requests?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch trial requests:', error)
      throw new Error('試用リクエストの取得に失敗しました')
    }
  },

  // Get user's own trial requests
  async getMyTrialRequests(): Promise<TrialRequest[]> {
    try {
      const response = await apiClient.get('/trial-requests/my')
      return response.data
    } catch (error) {
      console.error('Failed to fetch my trial requests:', error)
      throw new Error('試用リクエストの取得に失敗しました')
    }
  },

  // Get single trial request by ID
  async getTrialRequest(id: string): Promise<TrialRequest> {
    try {
      const response = await apiClient.get(`/trial-requests/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to fetch trial request:', error)
      throw new Error('試用リクエストの取得に失敗しました')
    }
  },

  // Create new trial request
  async createTrialRequest(data: CreateTrialRequest): Promise<TrialRequest> {
    try {
      const response = await apiClient.post('/trial-requests', data)
      return response.data
    } catch (error) {
      console.error('Failed to create trial request:', error)
      throw new Error('試用リクエストの作成に失敗しました')
    }
  },

  // Update trial request status (staff/admin only)
  async updateTrialStatus(id: string, data: UpdateTrialStatusData): Promise<TrialRequest> {
    try {
      const response = await apiClient.patch(`/trial-requests/${id}/status`, data)
      return response.data
    } catch (error) {
      console.error('Failed to update trial status:', error)
      throw new Error('試用ステータスの更新に失敗しました')
    }
  },

  // Approve trial request (staff/admin only)
  async approveTrialRequest(id: string, staffNotes?: string): Promise<TrialRequest> {
    return this.updateTrialStatus(id, {
      status: 'approved',
      staff_notes: staffNotes
    })
  },

  // Reject trial request (staff/admin only)
  async rejectTrialRequest(id: string, staffNotes?: string): Promise<TrialRequest> {
    return this.updateTrialStatus(id, {
      status: 'rejected',
      staff_notes: staffNotes
    })
  },

  // Complete trial request (staff/admin only)
  async completeTrialRequest(id: string, staffNotes?: string): Promise<TrialRequest> {
    return this.updateTrialStatus(id, {
      status: 'completed',
      staff_notes: staffNotes
    })
  },

  // Delete trial request
  async deleteTrialRequest(id: string): Promise<void> {
    try {
      await apiClient.delete(`/trial-requests/${id}`)
    } catch (error) {
      console.error('Failed to delete trial request:', error)
      throw new Error('試用リクエストの削除に失敗しました')
    }
  },

  // Get trial statistics (staff/admin only)
  async getTrialStats(): Promise<TrialStats> {
    try {
      const response = await apiClient.get('/trial-requests/stats')
      return response.data
    } catch (error) {
      console.error('Failed to fetch trial stats:', error)
      throw new Error('試用統計の取得に失敗しました')
    }
  }
}