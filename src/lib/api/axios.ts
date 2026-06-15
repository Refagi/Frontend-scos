import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { useAuthStore } from '@/store/authStore'


const API_BASE = import.meta.env.VITE_APP_URL ?? 'http://localhost:3000/v1'

export const api = axios.create({
  baseURL:         API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})


api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // kalau pake Bearer header daripada cookie:
    // const token = localStorage.getItem('accessToken')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject:  (reason?: unknown)  => void
}> = []

function processQueue(error: AxiosError | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else       resolve(undefined)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    
    const isAuthEndpoint = ['/auth/refresh-token', '/auth/login', '/auth/logout'].some(
      (path) => originalRequest?.url?.includes(path)
    );

    if (isAuthEndpoint) {
      if (originalRequest?.url?.includes('/auth/refresh-token')) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh-token')
        processQueue(null)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)



export const apiUpload = axios.create({
  baseURL:         API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 30_000,
})

apiUpload.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

apiUpload.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    return Promise.reject(error)
  },
)

export default api