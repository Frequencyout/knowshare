import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showQuestion, voteQuestion } from '../api/questions.service'
import { getMe } from '../api/account.service'
import VoteButton from '../components/VoteButton'
import TagChip from '../components/TagChip'
import MarkdownContent from '../components/MarkdownContent'
import ReportModal from '../components/ReportModal'
import api from '../api/axios'

export default function QuestionDetailPage() {
  const { idOrSlug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // Local form state
  const [answer, setAnswer] = useState('')
  const [reportModal, setReportModal] = useState({ open: false, type: null, id: null, title: null })

  // Query for the specific question - this is the key cache entry!
  const { 
    data: q, 
    isLoading: questionLoading, 
    error: questionError 
  } = useQuery({
    queryKey: ['question', idOrSlug],
    queryFn: () => showQuestion(idOrSlug),
    staleTime: 2 * 60 * 1000, // Question details can be cached for 2 minutes
  })

  // Reuse the same user query from HomePage - automatic caching!
  const { data: currentUser } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: 2 * 60 * 1000,
  })

  // Mutation for submitting new answers
  const submitAnswerMutation = useMutation({
    mutationFn: (answerData) => api.post(`/questions/${q.id}/answers`, answerData),
    onSuccess: () => {
      // Invalidate and refetch the question to get the new answer
      queryClient.invalidateQueries(['question', idOrSlug])
      setAnswer('') // Clear the form
    }
  })

  // Optimistic question voting
  const questionVoteMutation = useMutation({
    mutationFn: ({ action }) => voteQuestion(q.id, action),
    onMutate: async ({ action }) => {
      await queryClient.cancelQueries(['question', idOrSlug])
      
      const previousQuestion = queryClient.getQueryData(['question', idOrSlug])
      
      queryClient.setQueryData(['question', idOrSlug], old => {
        if (!old) return old
        return {
          ...old,
          score: old.score + (action === 'up' ? 1 : action === 'down' ? -1 : 0),
          my_vote: action === 'up' ? 1 : action === 'down' ? -1 : 0
        }
      })
      
      return { previousQuestion }
    },
    onError: (err, variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(['question', idOrSlug], context.previousQuestion)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['question', idOrSlug])
    }
  })

  // Optimistic answer voting
  const answerVoteMutation = useMutation({
    mutationFn: ({ answerId, action }) => api.post(`/answers/${answerId}/vote`, { action }),
    onMutate: async ({ answerId, action }) => {
      await queryClient.cancelQueries(['question', idOrSlug])
      
      const previousQuestion = queryClient.getQueryData(['question', idOrSlug])
      
      queryClient.setQueryData(['question', idOrSlug], old => {
        if (!old) return old
        return {
          ...old,
          answers: old.answers.map(a => 
            a.id === answerId
              ? { 
                  ...a, 
                  score: a.score + (action === 'up' ? 1 : action === 'down' ? -1 : 0),
                  my_vote: action === 'up' ? 1 : action === 'down' ? -1 : 0
                }
              : a
          )
        }
      })
      
      return { previousQuestion }
    },
    onError: (err, variables, context) => {
      if (context?.previousQuestion) {
        queryClient.setQueryData(['question', idOrSlug], context.previousQuestion)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['question', idOrSlug])
    }
  })

  const handleReport = (type, id, title) => {
    setReportModal({ open: true, type, id, title })
  }

  const closeReportModal = () => {
    setReportModal({ open: false, type: null, id: null, title: null })
  }

  const submitAnswer = async () => {
    if (!answer.trim() || !q) return
    
    submitAnswerMutation.mutate(
      { body_markdown: answer },
      {
        onError: (error) => {
          console.error('Failed to submit answer:', error)
        }
      }
    )
  }

  const setBest = async (aid) => {
    try {
      await api.patch(`/questions/${q.id}/best`, { answer_id: aid })
      // Invalidate to refetch with updated best answer
      queryClient.invalidateQueries(['question', idOrSlug])
    } catch (error) {
      console.error('Failed to set best answer:', error)
    }
  }

  const handleQuestionVote = async (action) => {
    questionVoteMutation.mutate({ action })
  }

  const handleAnswerVote = async (answerId, action) => {
    answerVoteMutation.mutate({ answerId, action })
  }

  if (questionLoading) return (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="mt-2 text-gray-600">Loading question...</p>
    </div>
  )

  if (questionError) return (
    <div className="text-center py-8">
      <p className="text-red-600">Failed to load question. Please try again.</p>
    </div>
  )

  if (!q) return (
    <div className="text-center py-8">
      <p className="text-gray-600">Question not found.</p>
    </div>
  )

  const isQuestionOwner = currentUser && q.user && currentUser.id === q.user.id

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex gap-4">
          {/* Question Vote */}
          <div className="flex-shrink-0">
            <VoteButton
              score={q.score || 0}
              myVote={q.my_vote || 0}
              onVote={handleQuestionVote}
              disabled={isQuestionOwner}
            />
          </div>

          {/* Question Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{q.title}</h1>
            
            <div className="prose max-w-none mb-4">
              <MarkdownContent bodyHtml={q.body_html}>{q.body_markdown}</MarkdownContent>
            </div>

            {/* Tags */}
            {q.tags && q.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {q.tags.map(tag => (
                  <TagChip
                    key={tag.slug}
                    tag={tag}
                    isSelected={false}
                    onClick={() => navigate(`/?tag=${tag.slug}`)}
                  />
                ))}
              </div>
            )}

            {/* Author */}
            <div className="text-sm text-gray-600">
              Asked by{' '}
              {q.user ? (
                <span className="font-medium">{q.user.name}</span>
              ) : 'Anonymous'}
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {q.answers?.length || 0} {(q.answers?.length || 0) === 1 ? 'Answer' : 'Answers'}
        </h2>

        {q.answers && q.answers.length > 0 ? (
          <div className="space-y-4">
            {q.answers.map(answer => (
              <div 
                key={answer.id} 
                className={`bg-white border rounded-lg p-6 ${
                  q.accepted_answer_id === answer.id 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex gap-4">
                  {/* Answer Vote */}
                  <div className="flex-shrink-0">
                    <VoteButton
                      score={answer.score || 0}
                      myVote={answer.my_vote || 0}
                      onVote={(action) => handleAnswerVote(answer.id, action)}
                      disabled={currentUser && answer.user && currentUser.id === answer.user.id}
                    />
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1">
                    {q.accepted_answer_id === answer.id && (
                      <div className="mb-3">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          ✓ Accepted Answer
                        </span>
                      </div>
                    )}

                    <div className="prose max-w-none mb-4">
                      <MarkdownContent bodyHtml={answer.body_html}>{answer.body_markdown}</MarkdownContent>
                    </div>

                    {/* Answer Actions */}
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <span>Answered by <strong>{answer.user?.name || 'Anonymous'}</strong></span>
                        <span>{new Date(answer.created_at).toLocaleDateString()}</span>
                        
                        {/* Mark as Best Answer - only question owner can do this */}
                        {isQuestionOwner && q.accepted_answer_id !== answer.id && (
                          <button
                            onClick={() => setBest(answer.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            Mark as best answer
                          </button>
                        )}
                        
                        {/* Report Answer */}
                        {currentUser && (
                          <button
                            onClick={() => handleReport('answer', answer.id, `Answer to "${q.title}"`)}
                            className="text-gray-400 hover:text-red-600 text-xs"
                            title="Report this answer"
                          >
                            Report
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No answers yet. Be the first to answer!</p>
          </div>
        )}
      </div>

      {/* Add Answer */}
      {currentUser ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          
          {submitAnswerMutation.isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-sm">
                {submitAnswerMutation.error?.response?.data?.message || 'Failed to submit answer'}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <textarea
              rows={8}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your answer using Markdown..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Supports Markdown formatting</p>
              <button
                onClick={submitAnswer}
                disabled={submitAnswerMutation.isLoading || !answer.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitAnswerMutation.isLoading ? 'Posting...' : 'Post Answer'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">You need to be logged in to answer questions.</p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Answer
          </Link>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.open}
        onClose={closeReportModal}
        reportableType={reportModal.type}
        reportableId={reportModal.id}
        title={reportModal.title}
      />
    </div>
  )
}


