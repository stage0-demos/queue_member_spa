import { ref, computed } from 'vue'
import { api } from '@/api/client'
import { useConfig } from './useConfig'

const accessToken = ref<string | null>(localStorage.getItem('access_token'))
const tokenExpiresAt = ref<string | null>(localStorage.getItem('token_expires_at'))
const storedRoles = localStorage.getItem('user_roles')
const roles = ref<string[]>(storedRoles ? JSON.parse(storedRoles) : [])

export function useAuth() {
  const { loadConfig } = useConfig()

  const isAuthenticated = computed(() => {
    if (!accessToken.value || !tokenExpiresAt.value) {
      return false
    }
    const expiresAt = new Date(tokenExpiresAt.value)
    return expiresAt > new Date()
  })

  async function login(subject?: string, rolesInput?: string[]) {
    try {
      const response = await api.devLogin({ subject, roles: rolesInput })
      accessToken.value = response.access_token
      tokenExpiresAt.value = response.expires_at
      roles.value = response.roles || []
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('token_expires_at', response.expires_at)
      localStorage.setItem('user_roles', JSON.stringify(response.roles || []))
      
      // Load config after successful login
      try {
        await loadConfig()
      } catch (configError) {
        console.warn('Failed to load config after login:', configError)
        // Don't fail login if config load fails
      }
      
      return response
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  function logout() {
    accessToken.value = null
    tokenExpiresAt.value = null
    roles.value = []
    localStorage.removeItem('access_token')
    localStorage.removeItem('token_expires_at')
    localStorage.removeItem('user_roles')
  }

  return {
    isAuthenticated,
    roles: computed(() => roles.value),
    login,
    logout,
  }
}

// Helper function for router guards (can't use composables directly)
export function getStoredRoles(): string[] {
  const stored = localStorage.getItem('user_roles')
  return stored ? JSON.parse(stored) : []
}

export function hasStoredRole(role: string): boolean {
  return getStoredRoles().includes(role)
}

