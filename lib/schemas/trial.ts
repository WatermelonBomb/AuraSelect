import type { Product } from '@/components/views/AdminDashboard'

export interface CreateTrialRequest {
  customerName: string
  customerEmail: string
  memo?: string
  products: Product[]
  totalAmount: number
}

export interface TrialRequest extends CreateTrialRequest {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: Date
  updatedAt: Date
  staffComments?: string
}

export interface TrialResponse {
  success: boolean
  data?: TrialRequest
  error?: string
}