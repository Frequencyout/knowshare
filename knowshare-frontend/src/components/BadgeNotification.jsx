import React, { useState, useEffect } from 'react';
import { getUserBadges } from '../api/badges.service';

const BadgeNotification = () => {
  const [newBadges, setNewBadges] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Check for new badges every 30 seconds
    const interval = setInterval(checkForNewBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkForNewBadges = async () => {
    try {
      const currentBadges = await getUserBadges();
      const storedBadgeCount = localStorage.getItem('badge_count') || 0;
      
      if (currentBadges.length > storedBadgeCount) {
        const newBadgeCount = currentBadges.length - storedBadgeCount;
        const latestBadges = currentBadges.slice(0, newBadgeCount);
        
        setNewBadges(latestBadges);
        setShowNotification(true);
        
        // Update stored count
        localStorage.setItem('badge_count', currentBadges.length);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
          setNewBadges([]);
        }, 5000);
      }
    } catch (error) {
      console.error('Error checking for new badges:', error);
    }
  };

  if (!showNotification || newBadges.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="text-2xl">🏆</div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-green-800">
              New Badge{newBadges.length > 1 ? 's' : ''} Earned!
            </h3>
            <div className="mt-2">
              {newBadges.map((badge) => (
                <div key={badge.id} className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{badge.icon}</span>
                  <span className="text-sm text-green-700">{badge.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => setShowNotification(false)}
              className="text-green-400 hover:text-green-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeNotification;
