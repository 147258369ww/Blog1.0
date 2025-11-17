import { http } from '@/services/http'

export const intentApi = {
  greeting(): Promise<{ success: boolean; data: { message: string; intent: string } }> {
    return http.get('/intent/greeting')
  },
  analyze(): Promise<{ success: boolean; data: { intent: string; confidence: number } }> {
    return http.get('/intent/analyze')
  },
}