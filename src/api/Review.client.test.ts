import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api, ApiError } from './client'
import type { ReviewInput, ReviewUpdate } from './types'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Review Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get all reviews', async () => {
    const mockReviews = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-review',
        description: 'Test description',
        status: 'active' as const,
        created: {
          from_ip: '127.0.0.1',
          by_user: 'user1',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        },
        saved: {
          from_ip: '127.0.0.1',
          by_user: 'user1',
          at_time: '2024-01-01T00:00:00Z',
          correlation_id: 'corr-123'
        }
      }
    ]

    const mockResponse = {
      items: mockReviews,
      limit: 20,
      has_more: false,
      next_cursor: null
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockResponse
    })

    const result = await api.getReviews()

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith('/api/review', expect.any(Object))
  })

  it('should get reviews with name query', async () => {
    const mockResponse = {
      items: [],
      limit: 20,
      has_more: false,
      next_cursor: null
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockResponse
    })

    await api.getReviews({ name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/review?name=test',
      expect.any(Object)
    )
  })

  it('should get a single review', async () => {
    const mockReview = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-review',
      status: 'active' as const,
      created: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123'
      },
      saved: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123'
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockReview
    })

    const result = await api.getReview('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockReview)
  })

  it('should create a review', async () => {
    const input: ReviewInput = {
      name: 'new-review',
      description: 'New description',
      status: 'active'
    }

    const mockResponse = { _id: '507f1f77bcf86cd799439011' }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockResponse
    })

    const result = await api.createReview(input)

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/review',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input)
      })
    )
  })

  it('should update a review', async () => {
    const update: ReviewUpdate = { name: 'updated-name' }

    const mockReview = {
      _id: '507f1f77bcf86cd799439011',
      name: 'updated-name',
      status: 'active' as const,
      created: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123'
      },
      saved: {
        from_ip: '127.0.0.1',
        by_user: 'user1',
        at_time: '2024-01-01T00:00:00Z',
        correlation_id: 'corr-123'
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: (name: string) => name === 'content-length' ? '100' : null },
      json: async () => mockReview
    })

    const result = await api.updateReview('507f1f77bcf86cd799439011', update)

    expect(result).toEqual(mockReview)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/review/507f1f77bcf86cd799439011',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(update)
      })
    )
  })

  it('should handle 404 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Resource not found' })
    })

    await expect(api.getReview('invalid-id')).rejects.toThrow(ApiError)
  })

  it('should handle 401 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Unauthorized' })
    })

    await expect(api.getReviews()).rejects.toThrow('Unauthorized')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(api.getReviews()).rejects.toThrow('Network error')
  })
})