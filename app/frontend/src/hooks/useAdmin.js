import { useEffect, useState } from 'react'
import api from '../services/api'

export default function useAdmin() {
  const [metrics, setMetrics] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAdmin() {
      try {
        setLoading(true)
        // Admin endpoints - adjust based on actual backend implementation
        const [metricsData, reportsData] = await Promise.all([
          api.get('/auth/admin/metrics').catch(() => null),
          api.get('/auth/admin/reports').catch(() => null),
        ])

        if (metricsData?.metrics) {
          setMetrics(metricsData.metrics)
        } else if (metricsData) {
          setMetrics([
            { label: 'Total users', value: String(metricsData.totalUsers ?? 0) },
            { label: 'Active today', value: String(metricsData.activeToday ?? 0) },
            { label: 'AI requests/day', value: String(metricsData.aiRequests ?? 0) },
            { label: 'Flagged chats', value: String(metricsData.flaggedChats ?? 0) },
          ])
        }

        if (reportsData?.reports) {
          setReports(reportsData.reports)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAdmin()
  }, [])

  return { metrics, reports, loading, error }
}
