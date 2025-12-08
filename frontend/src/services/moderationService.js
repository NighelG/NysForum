import { apiRequest } from './apiConfig'

const moderationService = {

    getAllReports: async (filters = {}) => {
        const params = new URLSearchParams()
        if (filters.status && filters.status !== 'all') params.append('status', filters.status)
        if (filters.type && filters.type !== 'all') params.append('type', filters.type)
        if (filters.category && filters.category !== 'all') params.append('category', filters.category)
        
        const queryString = params.toString()
        return await apiRequest(`/api/moderation/reports/all/${queryString ? `?${queryString}` : ''}`)
    },

    getStats: async () => {
        return await apiRequest('/api/moderation/reports/stats/')
    },

    resolveReport: async (reportType, reportId, data) => {
        return await apiRequest(`/api/moderation/reports/${reportType}/${reportId}/resolve/`, {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    getPostActions: async () => {
        return await apiRequest('/api/moderation/actions/posts/')
    },

    getCommentActions: async () => {
        return await apiRequest('/api/moderation/actions/comments/')
    },

    createPostAction: async (data) => {
        return await apiRequest('/api/moderation/actions/posts/', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    createCommentAction: async (data) => {
        return await apiRequest('/api/moderation/actions/comments/', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }
}

export default moderationService