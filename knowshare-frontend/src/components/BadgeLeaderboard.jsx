import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const BadgeLeaderboard = ({ limit = 5 }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      // We'll need to create this endpoint
      const response = await api.get('/users/leaderboard/badges', {
        params: { limit }
      });
      setLeaders(response.data);
    } catch (error) {
      console.error('Error loading badge leaderboard:', error);
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Badge Leaders</h3>
        <div className="space-y-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Badge Leaders</h3>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Badge Leaders</h3>
      <div className="space-y-3">
        {leaders.map((user, index) => (
          <div key={user.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-6 text-center font-medium text-gray-500">
              {getRankIcon(index + 1)}
            </div>
            <div className="flex-shrink-0">
              <img
                src={user.avatar_url || 'https://via.placeholder.com/32'}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                to={`/user/${user.id}`}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
              >
                {user.name}
              </Link>
              <p className="text-xs text-gray-500">
                {user.reputation} reputation
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {user.badges_count} badges
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <Link
          to="/badges"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all badges →
        </Link>
      </div>
    </div>
  );
};

export default BadgeLeaderboard;
