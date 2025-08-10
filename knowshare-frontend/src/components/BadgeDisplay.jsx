import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const BadgeDisplay = ({ userId = null, size = 'sm' }) => {
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBadges();
    }, [userId]);

    const loadBadges = async () => {
        try {
            setLoading(true);
            const response = userId 
                ? await api.get(`/users/${userId}/badges`)  // Public endpoint (if we add it)
                : await api.get('/me/badges');              // Current user's badges
            setBadges(response.data);
        } catch (error) {
            console.error('Error loading badges:', error);
            setBadges([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>;
    }

    if (badges.length === 0) {
        return null;
    }

    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const badgeTypeColors = {
        bronze: 'bg-amber-100 text-amber-800 border-amber-200',
        silver: 'bg-gray-100 text-gray-800 border-gray-200', 
        gold: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };

    return (
        <div className="flex flex-wrap gap-1">
            {badges.slice(0, 5).map(badge => (
                <div
                    key={badge.id}
                    className={`
                        inline-flex items-center px-2 py-1 border rounded-full font-medium
                        ${sizeClasses[size]}
                        ${badgeTypeColors[badge.type] || badgeTypeColors.bronze}
                    `}
                    title={`${badge.name}: ${badge.description}`}
                >
                    {badge.icon && <span className="mr-1">{badge.icon}</span>}
                    <span>{badge.name}</span>
                </div>
            ))}
            {badges.length > 5 && (
                <div
                    className={`
                        inline-flex items-center px-2 py-1 border rounded-full font-medium
                        ${sizeClasses[size]}
                        bg-gray-50 text-gray-600 border-gray-200
                    `}
                    title={`${badges.length - 5} more badges`}
                >
                    +{badges.length - 5}
                </div>
            )}
        </div>
    );
};

export default BadgeDisplay;
