import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMe, myQuestions, myAnswers } from '../api/account.service'

export default function DashboardPage() {
  const [me, setMe] = useState(null)
  const [qs, setQs] = useState([])
  const [as, setAs] = useState([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [meData, questionsData, answersData] = await Promise.all([
          getMe(),
          myQuestions(),
          myAnswers()
        ]);
        setMe(meData);
        setQs(questionsData.data || questionsData);
        setAs(answersData.data || answersData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };
    loadData();
  }, [])

  if (!me) return <div className="p-4">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <img src={me.avatar_url || 'https://via.placeholder.com/64'} alt="avatar" className="w-16 h-16 rounded-full" />
        <div>
          <div className="text-xl font-semibold">{me.name}</div>
          <div className="text-sm text-gray-600">Reputation: {me.reputation ?? 0}</div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">My Questions ({qs.length})</h2>
        {qs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">You haven't asked any questions yet.</p>
            <Link 
              to="/ask" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ask your first question
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {qs.map((q) => (
              <div key={q.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <Link 
                  to={`/question/${q.id}`}
                  className="block group"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {q.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Score: {q.score}</span>
                      <span>{q.answers_count} answers</span>
                      {q.accepted_answer_id && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Solved
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(q.tags || []).slice(0, 3).map(tag => (
                        <span key={tag.slug} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">My Answers ({as.length})</h2>
        {as.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't answered any questions yet.</p>
            <p className="text-sm mt-2">Browse questions to help others!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {as.map((a) => (
              <div key={a.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                <Link 
                  to={`/question/${a.question?.id}`}
                  className="block group"
                >
                  <div className="text-sm text-gray-500 mb-2">
                    Answer on question:
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {a.question?.title || 'Question not found'}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Score: {a.score}</span>
                      {a.is_accepted && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          ✓ Accepted Answer
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(a.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {a.body_markdown ? a.body_markdown.slice(0, 150) + '...' : 'No content'}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


