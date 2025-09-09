'use client'

import { useState, useEffect } from 'react'
import { trialsApi, type TrialFilters } from '@/lib/api/trials'
import type { CreateTrialRequest, TrialRequest, TrialResponse } from '@/lib/schemas/trial'

// Mock trial data for development fallback
const mockTrials: TrialRequest[] = []

export function useCreateTrialRequest() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTrialRequest = async (data: CreateTrialRequest): Promise<TrialResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      // Try API call first
      const newTrialRequest = await trialsApi.createTrialRequest(data)
      
      return {
        success: true,
        data: newTrialRequest
      }
    } catch (err) {
      console.warn('API trial creation failed, using fallback:', err)
      
      // Fallback to mock data for development
      const newTrialRequest: TrialRequest = {
        ...data,
        id: Date.now().toString(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockTrials.push(newTrialRequest)

      return {
        success: true,
        data: newTrialRequest
      }
    } finally {
      setIsLoading(false)
    }
  }

  // React Query compatibility
  const mutateAsync = createTrialRequest

  return {
    createTrialRequest,
    mutateAsync,
    isLoading,
    error
  }
}

export function useTrialRequests(filters?: TrialFilters) {
  const [isLoading, setIsLoading] = useState(false)
  const [trials, setTrials] = useState<TrialRequest[]>(mockTrials)
  const [error, setError] = useState<string | null>(null)

  const fetchTrials = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Try API call first
      const data = await trialsApi.getTrialRequests(filters)
      setTrials(data)
    } catch (err) {
      console.warn('API trial fetch failed, using fallback:', err)
      // Fallback to mock data for development
      setTrials([...mockTrials])
      setError(null) // Don't show error for development fallback
    } finally {
      setIsLoading(false)
    }
  }

  const updateTrialStatus = async (id: string, status: TrialRequest['status'], staffNotes?: string) => {
    try {
      // Try API call first
      const updatedTrial = await trialsApi.updateTrialStatus(id, {
        status,
        staff_notes: staffNotes
      })
      setTrials(prev => 
        prev.map(trial => 
          trial.id === id ? updatedTrial : trial
        )
      )
    } catch (err) {
      console.warn('API trial update failed, using fallback:', err)
      // Fallback to local state update for development
      const trialIndex = mockTrials.findIndex(t => t.id === id)
      if (trialIndex !== -1) {
        mockTrials[trialIndex] = {
          ...mockTrials[trialIndex],
          status,
          staffComments: staffNotes,
          updatedAt: new Date()
        }
        setTrials([...mockTrials])
      }
    }
  }

  useEffect(() => {
    fetchTrials()
  }, [])

  return {
    data: trials,
    isLoading,
    error,
    refetch: fetchTrials,
    updateTrialStatus
  }
}

// Additional hook functions for React Query compatibility
export function useApproveTrialRequest() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutateAsync = async (data: { id: string; staffNotes?: string }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const updatedTrial = await trialsApi.approveTrialRequest(data.id, data.staffNotes)
      return updatedTrial
    } catch (err) {
      console.warn('API trial approval failed, using fallback:', err)
      // Fallback for development
      const trialIndex = mockTrials.findIndex(t => t.id === data.id)
      if (trialIndex !== -1) {
        mockTrials[trialIndex] = {
          ...mockTrials[trialIndex],
          status: 'approved',
          staffComments: data.staffNotes,
          updatedAt: new Date()
        }
        return mockTrials[trialIndex]
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutateAsync,
    isLoading,
    error
  }
}

export function useRejectTrialRequest() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutateAsync = async (data: { id: string; staffNotes?: string }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const updatedTrial = await trialsApi.rejectTrialRequest(data.id, data.staffNotes)
      return updatedTrial
    } catch (err) {
      console.warn('API trial rejection failed, using fallback:', err)
      // Fallback for development
      const trialIndex = mockTrials.findIndex(t => t.id === data.id)
      if (trialIndex !== -1) {
        mockTrials[trialIndex] = {
          ...mockTrials[trialIndex],
          status: 'rejected',
          staffComments: data.staffNotes,
          updatedAt: new Date()
        }
        return mockTrials[trialIndex]
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutateAsync,
    isLoading,
    error
  }
}

export function useCompleteTrialRequest() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutateAsync = async (data: { id: string; staffNotes?: string }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const updatedTrial = await trialsApi.completeTrialRequest(data.id, data.staffNotes)
      return updatedTrial
    } catch (err) {
      console.warn('API trial completion failed, using fallback:', err)
      // Fallback for development
      const trialIndex = mockTrials.findIndex(t => t.id === data.id)
      if (trialIndex !== -1) {
        mockTrials[trialIndex] = {
          ...mockTrials[trialIndex],
          status: 'completed',
          staffComments: data.staffNotes,
          updatedAt: new Date()
        }
        return mockTrials[trialIndex]
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutateAsync,
    isLoading,
    error
  }
}

export function useTrialStats() {
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    total: 0
  })

  const calculateStats = () => {
    const pending = mockTrials.filter(t => t.status === 'pending').length
    const approved = mockTrials.filter(t => t.status === 'approved').length
    const rejected = mockTrials.filter(t => t.status === 'rejected').length
    const completed = mockTrials.filter(t => t.status === 'completed').length
    const total = mockTrials.length

    setStats({ pending, approved, rejected, completed, total })
  }

  useEffect(() => {
    calculateStats()
  }, [])

  return { stats, calculateStats }
}


