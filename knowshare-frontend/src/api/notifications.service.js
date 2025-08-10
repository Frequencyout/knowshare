import api from './axios';

export const getNotifications = (unread = false) => {
    const params = unread ? { unread: true } : {};
    return api.get('/notifications', { params });
};

export const markNotificationRead = (id) => {
    return api.post(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = () => {
    return api.post('/notifications/read-all');
};

export const getUnreadCount = async () => {
    try {
        const response = await api.get('/notifications', { params: { unread: true } });
        return response.data.length;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
};
