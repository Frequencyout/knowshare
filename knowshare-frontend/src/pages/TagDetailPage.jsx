import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTagDetails } from '../api/tags.service';
import { voteQuestion } from '../api/questions.service';
import { getMe } from '../api/account.service';
import QuestionCard from '../components/QuestionCard';

const TagDetailPage = () => {
  const { slug } = useParams();
  const [tagData, setTagData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadTagDetails();
    loadCurrentUser();
  }, [slug]);

  const loadCurrentUser = async () => {
    try {
      const user = await getMe();
      setCurrentUser(user);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const loadTagDetails = async () => {
    try {
      setLoading(true);
      const data = await getTagDetails(slug);
      setTagData(data);
    } catch (error) {
      console.error('Failed to load tag details:', error);
      setError('Failed to load tag details');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (questionId, action) => {
    try {
      const result = await voteQuestion(questionId, action);
      // Update the question in the list with new score and vote
      setTagData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: {
            ...prev.questions,
            data: prev.questions.data.map(q => 
              q.id === questionId 
                ? { ...q, score: result.score, my_vote: result.my_vote }
                : q
            )
          }
        };
      });
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleDelete = (questionId) => {
    // Remove the question from the list
    setTagData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        questions: {
          ...prev.questions,
          data: prev.questions.data.filter(q => q.id !== questionId)
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading tag details...</p>
      </div>
    );
  }

  if (error || !tagData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || 'Tag not found'}</p>
        <Link to="/tags" className="text-blue-600 hover:underline mt-2 inline-block">
          ← Back to tags
        </Link>
      </div>
    );
  }

  const { tag, questions } = tagData;

  return (
    <div className="space-y-6">
      {/* Tag Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tag.name}</h1>
            {tag.description && (
              <p className="text-gray-600 mt-2">{tag.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{tag.questions_count}</p>
            <p className="text-sm text-gray-600">questions</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <Link
            to="/tags"
            className="text-blue-600 hover:underline text-sm"
          >
            ← All tags
          </Link>
          <Link
            to={`/?tag=${tag.slug}`}
            className="text-blue-600 hover:underline text-sm"
          >
            Filter home by this tag
          </Link>
        </div>
      </div>

      {/* Questions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Questions tagged with "{tag.name}"
        </h2>

        {questions.data.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>No questions found for this tag yet.</p>
            <Link
              to="/ask"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Be the first to ask a question with this tag
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.data.map(question => (
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

        {/* Pagination would go here */}
        {questions.next_page_url && (
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:underline">
              Load more questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagDetailPage;
