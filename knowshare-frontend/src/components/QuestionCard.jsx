import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftIcon, UserIcon, TrashIcon } from '@heroicons/react/24/outline';
import VoteButton from './VoteButton';
import TagChip from './TagChip';
import MarkdownContent from './MarkdownContent';
import { deleteQuestion } from '../api/questions.service';

export default function QuestionCard({ question, onVote, onDelete, showExcerpt = true, currentUser = null }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleVote = async (action) => {
    if (onVote) {
      await onVote(question.id, action);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteQuestion(question.id);
      if (onDelete) {
        onDelete(question.id);
      }
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Create excerpt from markdown (simple approach - first 200 chars)
  const excerpt = question.body_markdown 
    ? question.body_markdown.slice(0, 200) + (question.body_markdown.length > 200 ? '...' : '')
    : '';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex-shrink-0">
          <VoteButton
            score={question.score || 0}
            myVote={question.my_vote || 0}
            onVote={handleVote}
            size="sm"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex-1">
              <Link 
                to={`/question/${question.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {question.title}
              </Link>
            </h3>
            
            {/* Delete button for question author */}
            {currentUser && question.user && currentUser.id === question.user.id && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Delete question"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin"></div>
                ) : (
                  <TrashIcon className="w-5 h-5" />
                )}
              </button>
            )}
          </div>

          {/* Excerpt */}
          {showExcerpt && excerpt && (
            <div className="text-gray-600 text-sm mb-3 line-clamp-3">
              <MarkdownContent className="prose-sm">
                {excerpt}
              </MarkdownContent>
            </div>
          )}

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {question.tags.map(tag => (
                <TagChip
                  key={tag.slug}
                  tag={tag}
                  isSelected={false}
                  onClick={() => {
                    // Navigate to tag filter
                    window.location.href = `/?tag=${tag.slug}`;
                  }}
                />
              ))}
            </div>
          )}

          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <ChatBubbleLeftIcon className="w-4 h-4 mr-1" />
                {question.answers_count || 0} answers
              </span>
              <span className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                {question.user?.name || 'Anonymous'}
              </span>
            </div>
            <time dateTime={question.created_at}>
              {new Date(question.created_at).toLocaleDateString()}
            </time>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex-shrink-0 text-right">
          {question.accepted_answer_id && (
            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-2">
              Solved
            </div>
          )}
          {question.is_closed && (
            <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
              Closed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


