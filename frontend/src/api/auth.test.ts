    import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, checkAuth, logout } from './auth'

describe('auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should return token on successful login', async () => {
      const mockToken = 'test-token-123'
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ token: mockToken }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await login('password123')

      expect(result).toEqual({ token: mockToken })
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'password123' }),
      })
    })

    it('should return error on failed login', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ error: 'Invalid password' }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await login('wrong-password')

      expect(result).toEqual({ error: 'Invalid password' })
    })
  })

  describe('checkAuth', () => {
    it('should return authenticated status', async () => {
      const token = 'test-token-123'
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ authenticated: true }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await checkAuth(token)

      expect(result).toEqual({ authenticated: true })
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
    })

    it('should return false when not authenticated', async () => {
      const token = 'invalid-token'
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({ authenticated: false }),
      })
      vi.stubGlobal('fetch', mockFetch)

      const result = await checkAuth(token)

      expect(result).toEqual({ authenticated: false })
    })
  })

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      const token = 'test-token-123'
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({}),
      })
      vi.stubGlobal('fetch', mockFetch)

      await logout(token)

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
    })
  })
})

