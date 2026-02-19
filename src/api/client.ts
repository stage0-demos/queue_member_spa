import type { 
  Curriculum,
  CurriculumInput,
  CurriculumUpdate,

  Rating,
  RatingInput,
  RatingUpdate,

  Review,
  ReviewInput,
  ReviewUpdate,

  Event,
  EventInput,

  Resource,

  Path,

  DevLoginRequest, 
  DevLoginResponse,
  ConfigResponse,
  Error,
  InfiniteScrollParams,
  InfiniteScrollResponse
} from './types'

const API_BASE = '/api'

function getDevLoginUrl(): string {
  return '/dev-login'
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorData: Error | null = null
    try {
      errorData = await response.json()
    } catch {
      // Ignore JSON parse errors
    }
    
    // Handle 401 Unauthorized - clear invalid token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_expires_at')
      // Redirect to login page, preserving current path for post-login redirect
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
    }
    
    throw new ApiError(
      errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData || undefined
    )
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T
  }

  return response.json()
}

export const api = {
  // Authentication
  async devLogin(payload?: DevLoginRequest): Promise<DevLoginResponse> {
    const url = getDevLoginUrl()
    const token = localStorage.getItem('access_token')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload || {}),
    })

    if (!response.ok) {
      let errorData: Error | null = null
      try {
        errorData = await response.json()
      } catch {
        // Ignore JSON parse errors
      }
      throw new ApiError(
        errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData || undefined
      )
    }

    return response.json()
  },

  // Config
  async getConfig(): Promise<ConfigResponse> {
    return request<ConfigResponse>('/config')
  },

  // Control endpoints
  // 🎯 API methods use InfiniteScrollParams and InfiniteScrollResponse types
  // These types are compatible with spa_utils useInfiniteScroll composable

  async getCurriculums(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Curriculum>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Curriculum>>(`/curriculum${query ? `?${query}` : ''}`)
  },

  async getCurriculum(curriculumId: string): Promise<Curriculum> {
    return request<Curriculum>(`/curriculum/${curriculumId}`)
  },

  async createCurriculum(data: CurriculumInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/curriculum', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateCurriculum(curriculumId: string, data: CurriculumUpdate): Promise<Curriculum> {
    return request<Curriculum>(`/curriculum/${curriculumId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },


  async getRatings(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Rating>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Rating>>(`/rating${query ? `?${query}` : ''}`)
  },

  async getRating(ratingId: string): Promise<Rating> {
    return request<Rating>(`/rating/${ratingId}`)
  },

  async createRating(data: RatingInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/rating', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateRating(ratingId: string, data: RatingUpdate): Promise<Rating> {
    return request<Rating>(`/rating/${ratingId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },


  async getReviews(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Review>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Review>>(`/review${query ? `?${query}` : ''}`)
  },

  async getReview(reviewId: string): Promise<Review> {
    return request<Review>(`/review/${reviewId}`)
  },

  async createReview(data: ReviewInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/review', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateReview(reviewId: string, data: ReviewUpdate): Promise<Review> {
    return request<Review>(`/review/${reviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },



  // Create endpoints

  async getEvents(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Event>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Event>>(`/event${query ? `?${query}` : ''}`)
  },

  async getEvent(eventId: string): Promise<Event> {
    return request<Event>(`/event/${eventId}`)
  },

  async createEvent(data: EventInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/event', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },



  // Consume endpoints

  async getResources(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Resource>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Resource>>(`/resource${query ? `?${query}` : ''}`)
  },

  async getResource(resourceId: string): Promise<Resource> {
    return request<Resource>(`/resource/${resourceId}`)
  },


  async getPaths(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Path>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Path>>(`/path${query ? `?${query}` : ''}`)
  },

  async getPath(pathId: string): Promise<Path> {
    return request<Path>(`/path/${pathId}`)
  },


}

export { ApiError }
