import { describe, it, expect, beforeEach, vi } from 'vitest'
import { api, ApiError } from './client'
import type { CurriculumInput, CurriculumUpdate } from './types'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - Curriculum Endpoints', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
    localStorage.setItem('access_token', 'test-token')
  })

  it('should get all curriculums', async () => {
    const mockCurriculums = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'test-curriculum',
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
      items: mockCurriculums,
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

    const result = await api.getCurriculums()

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith('/api/curriculum', expect.any(Object))
  })

  it('should get curriculums with name query', async () => {
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

    await api.getCurriculums({ name: 'test' })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/curriculum?name=test',
      expect.any(Object)
    )
  })

  it('should get a single curriculum', async () => {
    const mockCurriculum = {
      _id: '507f1f77bcf86cd799439011',
      name: 'test-curriculum',
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
      json: async () => mockCurriculum
    })

    const result = await api.getCurriculum('507f1f77bcf86cd799439011')

    expect(result).toEqual(mockCurriculum)
  })

  it('should create a curriculum', async () => {
    const input: CurriculumInput = {
      name: 'new-curriculum',
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

    const result = await api.createCurriculum(input)

    expect(result).toEqual(mockResponse)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/curriculum',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input)
      })
    )
  })

  it('should update a curriculum', async () => {
    const update: CurriculumUpdate = { name: 'updated-name' }

    const mockCurriculum = {
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
      json: async () => mockCurriculum
    })

    const result = await api.updateCurriculum('507f1f77bcf86cd799439011', update)

    expect(result).toEqual(mockCurriculum)
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/curriculum/507f1f77bcf86cd799439011',
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

    await expect(api.getCurriculum('invalid-id')).rejects.toThrow(ApiError)
  })

  it('should handle 401 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Unauthorized' })
    })

    await expect(api.getCurriculums()).rejects.toThrow('Unauthorized')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(api.getCurriculums()).rejects.toThrow('Network error')
  })
})