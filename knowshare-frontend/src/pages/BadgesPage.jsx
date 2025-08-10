import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMe } from '../api/account.service';
import { getAllBadges, getUserBadges } from '../api/badges.service';

const BadgesPage = () => {
  const [user, setUser] = useState(null);
  const [allBadges, setAllBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, earned, unearned

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, badgesData, userBadgesData] = await Promise.all([
        getMe(),
        getAllBadges(),
        getUserBadges()
      ]);
      
      setUser(userData);
      setAllBadges(badgesData);
      setUserBadges(userBadgesData);
    } catch (error) {
      console.error('Failed to load badges data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEarnedBadgeIds = () => {
    return userBadges.map(badge => badge.id);
  };

  const getFilteredBadges = () => {
    const earnedIds = getEarnedBadgeIds();
    
    switch (filter) {
      case 'earned':
        return allBadges.filter(badge => earnedIds.includes(badge.id));
      case 'unearned':
        return allBadges.filter(badge => !earnedIds.includes(badge.id));
      default:
        return allBadges;
    }
  };

  const getBadgeTypeColor = (type) => {
    switch (type) {
      case 'bronze':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'silver':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBadgeTypeIcon = (type) => {
    switch (type) {
      case 'bronze':
        return '🥉';
      case 'silver':
        return '🥈';
      case 'gold':
        return '🥇';
      default:
        return '🏅';
    }
  };

  const formatRequirements = (requirements) => {
    const reqs = [];
    if (requirements.questions_count) {
      reqs.push(`${requirements.questions_count} questions asked`);
    }
    if (requirements.answers_count) {
      reqs.push(`${requirements.answers_count} answers posted`);
    }
    if (requirements.accepted_answers_count) {
      reqs.push(`${requirements.accepted_answers_count} answers accepted`);
    }
    if (requirements.total_votes) {
      reqs.push(`${requirements.total_votes} total upvotes received`);
    }
    if (requirements.reputation) {
      reqs.push(`${requirements.reputation} reputation points`);
    }
    if (requirements.days_registered) {
      reqs.push(`Member for ${requirements.days_registered} days`);
    }
    return reqs.join(', ');
  };

  const getUserProgress = (badge) => {
    if (!user) return null;
    
    const requirements = badge.requirements;
    const earnedIds = getEarnedBadgeIds();
    const isEarned = earnedIds.includes(badge.id);
    
    if (isEarned) {
      return { progress: 100, status: 'earned' };
    }

    // Calculate progress based on requirements
    let progress = 0;
    let totalRequirements = 0;
    let metRequirements = 0;

    if (requirements.questions_count) {
      totalRequirements++;
      if (user.questions_count >= requirements.questions_count) {
        metRequirements++;
      }
    }
    if (requirements.answers_count) {
      totalRequirements++;
      if (user.answers_count >= requirements.answers_count) {
        metRequirements++;
      }
    }
    if (requirements.accepted_answers_count) {
      totalRequirements++;
      if (user.accepted_answers_count >= requirements.accepted_answers_count) {
        metRequirements++;
      }
    }
    if (requirements.reputation) {
      totalRequirements++;
      if (user.reputation >= requirements.reputation) {
        metRequirements++;
      }
    }

    progress = totalRequirements > 0 ? (metRequirements / totalRequirements) * 100 : 0;
    
    return { progress: Math.round(progress), status: 'in-progress' };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredBadges = getFilteredBadges();
  const earnedCount = getEarnedBadgeIds().length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Badges</h1>
          <div className="text-sm text-gray-600">
            {earnedCount} of {allBadges.length} badges earned
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-amber-400 via-gray-400 to-yellow-400 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(earnedCount / allBadges.length) * 100}%` }}
          ></div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({allBadges.length})
          </button>
          <button
            onClick={() => setFilter('earned')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'earned' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Earned ({earnedCount})
          </button>
          <button
            onClick={() => setFilter('unearned')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'unearned' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unearned ({allBadges.length - earnedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge) => {
          const progress = getUserProgress(badge);
          const isEarned = progress?.status === 'earned';
          
          return (
            <div
              key={badge.id}
              className={`relative p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                isEarned 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Badge Type Icon */}
              <div className="absolute top-4 right-4 text-2xl">
                {getBadgeTypeIcon(badge.type)}
              </div>

              {/* Badge Icon */}
              <div className="text-4xl mb-4">{badge.icon}</div>

              {/* Badge Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {badge.name}
              </h3>

              {/* Badge Description */}
              <p className="text-gray-600 text-sm mb-4">
                {badge.description}
              </p>

              {/* Requirements */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Requirements
                </h4>
                <p className="text-sm text-gray-700">
                  {formatRequirements(badge.requirements)}
                </p>
              </div>

              {/* Progress Bar */}
              {progress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isEarned ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isEarned 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isEarned ? '✓ Earned' : 'In Progress'}
                </div>
                
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeTypeColor(badge.type)}`}>
                  {badge.type.charAt(0).toUpperCase() + badge.type.slice(1)}
                </div>
              </div>

              {/* Earned Date */}
              {isEarned && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-green-600">
                    Earned on {new Date(badge.pivot?.earned_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'earned' ? 'No badges earned yet' : 'No badges found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'earned' 
              ? 'Start asking questions and helping others to earn your first badge!'
              : 'Keep contributing to the community to unlock more badges!'
            }
          </p>
          {filter === 'earned' && (
            <Link 
              to="/ask" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ask Your First Question
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default BadgesPage;
