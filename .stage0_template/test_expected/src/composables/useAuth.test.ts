import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth, getStoredRoles, hasStoredRole } from './useAuth'
import { api } from '@/api/client'

vi.mock('@/api/client', () => ({
  api: {
    devLogin: vi.fn(),
    getConfig: vi.fn()
  }
}))

vi.mock('./useConfig', () => ({
  useConfig: () => ({
    loadConfig: vi.fn().mockResolvedValue({})
  })
}))

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('isAuthenticated', () => {
    it('should return false when no token is stored', () => {
      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(false)
    })

    it('should return false when token is expired', () => {
      const pastDate = new Date(Date.now() - 1000).toISOString()
      localStorage.setItem('access_token', 'test-token')
      localStorage.setItem('token_expires_at', pastDate)

      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(false)
    })

    it('should return true when token is valid and not expired', async () => {
      const futureDate = new Date(Date.now() + 100000).toISOString()
      
      const { isAuthenticated } = useAuth()
      
      // Set token after getting the composable to trigger reactivity
      localStorage.setItem('access_token', 'test-token')
      localStorage.setItem('token_expires_at', futureDate)
      
      // Login to update the reactive refs
      const mockResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_at: futureDate,
        subject: 'test-user',
        roles: ['admin']
      }
      vi.mocked(api.devLogin).mockResolvedValueOnce(mockResponse)
      await useAuth().login('test-user', ['admin'])
      
      expect(isAuthenticated.value).toBe(true)
    })
  })

  describe('login', () => {
    it('should login successfully and store token', async () => {
      const mockResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_at: '2026-12-31T23:59:59Z',
        subject: 'test-user',
        roles: ['admin']
      }

      vi.mocked(api.devLogin).mockResolvedValueOnce(mockResponse)

      const { login, isAuthenticated } = useAuth()
      await login('test-user', ['admin'])

      expect(localStorage.getItem('access_token')).toBe('test-token')
      expect(localStorage.getItem('token_expires_at')).toBe('2026-12-31T23:59:59Z')
      expect(isAuthenticated.value).toBe(true)
    })

    it('should handle login failure', async () => {
      vi.mocked(api.devLogin).mockRejectedValueOnce(new Error('Login failed'))

      const { login } = useAuth()
      await expect(login('test-user', ['admin'])).rejects.toThrow('Login failed')
    })
  })

  describe('logout', () => {
    it('should clear token and auth state', () => {
      localStorage.setItem('access_token', 'test-token')
      localStorage.setItem('token_expires_at', '2026-12-31T23:59:59Z')
      localStorage.setItem('user_roles', JSON.stringify(['admin']))

      const { logout, isAuthenticated } = useAuth()
      logout()

      expect(localStorage.getItem('access_token')).toBeNull()
      expect(localStorage.getItem('token_expires_at')).toBeNull()
      expect(localStorage.getItem('user_roles')).toBeNull()
      expect(isAuthenticated.value).toBe(false)
    })
  })

  describe('roles', () => {
    it('should store roles on login', async () => {
      const mockResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_at: '2026-12-31T23:59:59Z',
        subject: 'test-user',
        roles: ['admin', 'developer']
      }

      vi.mocked(api.devLogin).mockResolvedValueOnce(mockResponse)

      const { login, roles } = useAuth()
      await login('test-user', ['admin', 'developer'])

      expect(localStorage.getItem('user_roles')).toBe(JSON.stringify(['admin', 'developer']))
      expect(roles.value).toEqual(['admin', 'developer'])
    })

    it('should handle login without roles', async () => {
      const mockResponse = {
        access_token: 'test-token',
        token_type: 'bearer',
        expires_at: '2026-12-31T23:59:59Z',
        subject: 'test-user',
        roles: []
      }

      vi.mocked(api.devLogin).mockResolvedValueOnce(mockResponse)

      const { login, roles } = useAuth()
      await login('test-user')

      expect(localStorage.getItem('user_roles')).toBe(JSON.stringify([]))
      expect(roles.value).toEqual([])
    })
  })
})

describe('getStoredRoles', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return empty array when no roles stored', () => {
    expect(getStoredRoles()).toEqual([])
  })

  it('should return stored roles', () => {
    localStorage.setItem('user_roles', JSON.stringify(['admin', 'user']))
    expect(getStoredRoles()).toEqual(['admin', 'user'])
  })
})

describe('hasStoredRole', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return true when user has role', () => {
    localStorage.setItem('user_roles', JSON.stringify(['admin', 'user']))
    expect(hasStoredRole('admin')).toBe(true)
    expect(hasStoredRole('user')).toBe(true)
  })

  it('should return false when user does not have role', () => {
    localStorage.setItem('user_roles', JSON.stringify(['user']))
    expect(hasStoredRole('admin')).toBe(false)
  })

  it('should return false when no roles stored', () => {
    expect(hasStoredRole('admin')).toBe(false)
  })
})
