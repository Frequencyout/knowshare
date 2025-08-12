import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import QuestionCard from '../components/QuestionCard';
import TagChip from '../components/TagChip';
import SortToggle from '../components/SortToggle';
import { listQuestions, voteQuestion } from '../api/questions.service';
import { getPopularTags } from '../api/tags.service';
import { getMe } from '../api/account.service';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const queryClient = useQueryClient();
  
  // URL-synced state
  const search = searchParams.get('search') || '';
  const tagParam = searchParams.get('tag') || '';
  const selectedTags = tagParam ? tagParam.split(',') : [];
  const sort = searchParams.get('sort') || 'new';

  // Query for questions list with caching and background refetch
  const { 
    data: questionsData, 
    isLoading: questionsLoading, 
    error: questionsError 
  } = useQuery({
    queryKey: ['questions', { search, tag: tagParam, sort }],
    queryFn: () => {
      const params = {};
      if (search) params.search = search;
      if (tagParam) params.tag = tagParam;
      if (sort !== 'new') params.sort = sort;
      return listQuestions(params);
    },
    keepPreviousData: true, // Don't show loading when filters change
    staleTime: 30_000, // Consider fresh for 30 seconds
  });

  // Query for popular tags - rarely changes, cache for longer
  const { data: popularTags = [] } = useQuery({
    queryKey: ['tags', 'popular'],
    queryFn: () => getPopularTags().then(data => data.slice(0, 10)),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Query for current user
  const { data: currentUser } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    retry: false, // Don't retry if not logged in
    staleTime: 2 * 60 * 1000, // Cache user data for 2 minutes
  });

  // Optimistic voting mutation
  const voteMutation = useMutation({
    mutationFn: ({ questionId, action }) => voteQuestion(questionId, action),
    onMutate: async ({ questionId, action }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(['questions']);
      
      // Snapshot the previous value
      const previousQuestions = queryClient.getQueryData(['questions', { search, tag: tagParam, sort }]);
      
      // Optimistically update the cache
      queryClient.setQueryData(['questions', { search, tag: tagParam, sort }], old => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map(q => 
            q.id === questionId
              ? { 
                  ...q, 
                  score: q.score + (action === 'up' ? 1 : action === 'down' ? -1 : 0),
                  my_vote: action === 'up' ? 1 : action === 'down' ? -1 : 0
                }
              : q
          )
        };
      });
      
      return { previousQuestions };
    },
    onError: (err, variables, context) => {
      // If mutation fails, rollback to previous state
      if (context?.previousQuestions) {
        queryClient.setQueryData(['questions', { search, tag: tagParam, sort }], context.previousQuestions);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries(['questions']);
    },
  });

  // Initialize search input from URL
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Debounced search
  useEffect(() => {
    if (searchInput !== search) { // Only update if different from current URL
      const timer = setTimeout(() => {
        updateSearch(searchInput);
      }, 500); // 500ms delay
      return () => clearTimeout(timer);
    }
  }, [searchInput, search]);

  const updateSearch = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const updateSort = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== 'new') {
      newParams.set('sort', value);
    } else {
      newParams.delete('sort');
    }
    setSearchParams(newParams);
  };

  const toggleTag = (tagSlug) => {
    const newParams = new URLSearchParams(searchParams);
    const currentTags = selectedTags.slice();
    
    if (currentTags.includes(tagSlug)) {
      const updated = currentTags.filter(t => t !== tagSlug);
      if (updated.length > 0) {
        newParams.set('tag', updated.join(','));
      } else {
        newParams.delete('tag');
      }
    } else {
      currentTags.push(tagSlug);
      newParams.set('tag', currentTags.join(','));
    }
    
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const handleVote = useCallback(async (questionId, action) => {
    voteMutation.mutate({ questionId, action });
  }, [voteMutation]);

  const handleDelete = (questionId) => {
    // Invalidate questions cache to refetch fresh data
    queryClient.invalidateQueries(['questions']);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Latest Questions</h1>
        <Link
          to="/ask"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Ask Question
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-2">Popular Tags</h2>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(tag => (
              <TagChip
                key={tag.id}
                tag={tag}
                isSelected={selectedTags.includes(tag.slug)}
                onClick={() => toggleTag(tag.slug)}
              />
            ))}
            <Link to="/tags" className="text-sm text-blue-600 hover:underline">
              View all tags →
            </Link>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between">
        <SortToggle value={sort} onChange={updateSort} />
        
        {(search || selectedTags.length > 0 || sort !== 'new') && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filtered by:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagSlug => {
              const tag = popularTags.find(t => t.slug === tagSlug) || { slug: tagSlug, name: tagSlug };
              return (
                <TagChip
                  key={tagSlug}
                  tag={tag}
                  isSelected={true}
                  onClick={() => toggleTag(tagSlug)}
                  variant="removable"
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Questions */}
      {questionsLoading && !questionsData ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading questions...</p>
        </div>
      ) : questionsError ? (
        <div className="text-center py-8 text-red-600">
          <p>Failed to load questions. Please try again.</p>
        </div>
      ) : !questionsData?.data?.length ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {search || selectedTags.length > 0 
              ? 'No questions found matching your filters.' 
              : 'No questions yet.'
            }
          </p>
          <Link
            to="/ask"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Ask the first question
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {questionsData.data.map(question => (
            <QuestionCard 
              key={question.id} 
              question={question} 
              onVote={handleVote}
              onDelete={handleDelete}
              currentUser={currentUser}
            />
          ))}
        </div>
      )}
    </div>
  );
}


