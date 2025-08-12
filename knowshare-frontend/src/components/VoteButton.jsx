import React, { useState, memo } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

function VoteButton({ score, myVote, onVote, size = 'md', disabled = false }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (action) => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    try {
      // If clicking the same vote, remove it
      const finalAction = myVote === (action === 'up' ? 1 : -1) ? 'remove' : action;
      await onVote(finalAction);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizes = {
    sm: {
      container: 'flex flex-col items-center space-y-1',
      button: 'p-1',
      icon: 'w-4 h-4',
      score: 'text-sm font-medium'
    },
    md: {
      container: 'flex flex-col items-center space-y-2',
      button: 'p-2',
      icon: 'w-5 h-5',
      score: 'text-lg font-semibold'
    }
  };

  const currentSize = sizes[size];

  const upvoteClasses = `
    ${currentSize.button} rounded-md transition-colors
    ${myVote === 1 
      ? 'text-green-600 bg-green-50 hover:bg-green-100' 
      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  const downvoteClasses = `
    ${currentSize.button} rounded-md transition-colors
    ${myVote === -1 
      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
      : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  return (
    <div className={currentSize.container}>
      <button
        className={upvoteClasses}
        onClick={() => handleVote('up')}
        disabled={disabled || isLoading}
        aria-label="Upvote"
      >
        <ChevronUpIcon className={currentSize.icon} />
      </button>
      
      <span className={`${currentSize.score} text-gray-700 min-w-0`}>
        {isLoading ? '...' : score}
      </span>
      
      <button
        className={downvoteClasses}
        onClick={() => handleVote('down')}
        disabled={disabled || isLoading}
        aria-label="Downvote"
      >
        <ChevronDownIcon className={currentSize.icon} />
      </button>
    </div>
  );
}

export default memo(VoteButton);


