'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { trialsApi } from '@/lib/api/trials'
import type { Product } from '@/components/views/AdminDashboard'
import type { TrialRequest } from '@/lib/schemas/trial'

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  
  // Navigation
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // App settings
  notifications: boolean
  setNotifications: (enabled: boolean) => void

  // Product and filtering
  products: Product[]
  setProducts: (products: Product[]) => void
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
  selectedProduct: Product | null
  setSelectedProduct: (product: Product | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortBy: 'name' | 'price' | 'rating'
  setSortBy: (sortBy: 'name' | 'price' | 'rating') => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  isTrialLoading: boolean
  setIsTrialLoading: (loading: boolean) => void

  // Trial cart
  trialCart: Product[]
  addToTrialCart: (product: Product) => void
  removeFromTrialCart: (productId: string) => void
  clearTrialCart: () => void
  memo: string
  setMemo: (memo: string) => void

  // Trial requests
  trialRequests: TrialRequest[]
  sendTrialRequest: (data: { productIds: string[]; customerMessage: string }) => Promise<void>

  // Navigation
  currentView: string
  setCurrentView: (view: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      
      // Navigation
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      // App settings
      notifications: true,
      setNotifications: (notifications) => set({ notifications }),

      // Product and filtering
      products: [],
      setProducts: (products) => set({ products }),
      selectedCategory: null,
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      selectedProduct: null,
      setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
      searchQuery: '',
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      sortBy: 'name',
      setSortBy: (sortBy) => set({ sortBy }),
      showFilters: false,
      setShowFilters: (showFilters) => set({ showFilters }),
      isTrialLoading: false,
      setIsTrialLoading: (isTrialLoading) => set({ isTrialLoading }),

      // Trial cart
      trialCart: [],
      addToTrialCart: (product) => set((state) => ({
        trialCart: [...state.trialCart, product]
      })),
      removeFromTrialCart: (productId) => set((state) => ({
        trialCart: state.trialCart.filter(p => p.id !== productId)
      })),
      clearTrialCart: () => set({ trialCart: [] }),
      memo: '',
      setMemo: (memo) => set({ memo }),

      // Trial requests
      trialRequests: [],
      sendTrialRequest: async (data) => {
        try {
          // Create individual trial requests for each product
          const newRequests: TrialRequest[] = []
          
          for (const productId of data.productIds) {
            try {
              const newRequest = await trialsApi.createTrialRequest({
                productId,
                customerMessage: data.customerMessage
              })
              newRequests.push(newRequest)
            } catch (err) {
              console.warn('API trial request failed, using fallback:', err)
              // Fallback for development
              const mockRequest: TrialRequest = {
                id: Date.now().toString() + productId,
                userId: 'current-user',
                productId,
                customerMessage: data.customerMessage,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
              }
              newRequests.push(mockRequest)
            }
          }
          
          // Update state with new requests
          set((state) => ({
            trialRequests: [...state.trialRequests, ...newRequests]
          }))
          
        } catch (error) {
          console.error('Failed to send trial requests:', error)
          throw error
        }
      },

      // Navigation
      currentView: 'products',
      setCurrentView: (currentView) => set({ currentView }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        theme: state.theme,
        notifications: state.notifications,
      }),
    }
  )
)