import toast from 'react-hot-toast'

// Success toast with consistent styling
export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 4000,
    style: {
      background: '#10b981',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.25)',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#10b981',
    },
  })
}

// Error toast with consistent styling
export const showError = (message: string) => {
  toast.error(message, {
    duration: 5000,
    style: {
      background: '#ef4444',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.25)',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#ef4444',
    },
  })
}

// Loading toast
export const showLoading = (message: string) => {
  return toast.loading(message, {
    style: {
      background: '#3b82f6',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.25)',
    },
  })
}

// Info toast
export const showInfo = (message: string) => {
  toast(message, {
    duration: 4000,
    style: {
      background: '#6366f1',
      color: 'white',
      fontWeight: '500',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.25)',
    },
  })
}

// Dismiss toast
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId)
}

// Specific business logic toasts
export const showApiError = (error: unknown) => {
  const message = error instanceof Error ? error.message : '操作に失敗しました'
  showError(message)
}

export const showTrialSuccess = () => {
  showSuccess('試用リクエストを送信しました！スタッフからの連絡をお待ちください。')
}

export const showLoginSuccess = () => {
  showSuccess('ログインしました')
}

export const showLogoutSuccess = () => {
  showSuccess('ログアウトしました')
}

export const showRegistrationSuccess = () => {
  showSuccess('アカウントを作成しました')
}

export const showProductCreated = () => {
  showSuccess('商品を追加しました')
}

export const showProductUpdated = () => {
  showSuccess('商品を更新しました')
}

export const showProductDeleted = () => {
  showSuccess('商品を削除しました')
}

export const showTrialApproved = () => {
  showSuccess('試用リクエストを承認しました')
}

export const showTrialRejected = () => {
  showInfo('試用リクエストを却下しました')
}

export const showTrialCompleted = () => {
  showSuccess('試用を完了しました')
}