import axios, { type AxiosRequestConfig } from "axios"

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

let accessToken: string | null = null

export const setAccessToken = (token: string | null): void => {
  accessToken = token
}

instance.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

export const customInstance = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  const { data } = await instance({ ...config })
  return data
}
