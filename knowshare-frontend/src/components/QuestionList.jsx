import { useEffect, useMemo, useState } from 'react'
import { listQuestions, voteQuestion } from '../api/questions.service'
import { listTags } from '../api/tags.service'
import TagChip from './TagChip'
import SortToggle from './SortToggle'
import QuestionCard from './QuestionCard'

export default function QuestionList() {
  const [tags, setTags] = useState([])
  const [activeTags, setActiveTags] = useState([])
  const [sort, setSort] = useState('new')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listTags().then((res) => setTags(res.data || res))
  }, [])

  const tagParam = useMemo(() => activeTags.join(','), [activeTags])

  useEffect(() => {
    setLoading(true)
    listQuestions({ tag: tagParam, sort }).then((res) => {
      setItems(res.data || res)
      setLoading(false)
    })
  }, [tagParam, sort])

  const toggleTag = (slug) => {
    setActiveTags((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]))
  }

  const doVote = async (q, action) => {
    const optimistic = items.map((it) =>
      it.id === q.id
        ? {
            ...it,
            my_vote: action === 'up' ? 1 : action === 'down' ? -1 : 0,
            score:
              action === 'up' ? it.score + (it.my_vote === 1 ? 0 : 1 - (it.my_vote === -1 ? -1 : 0)) :
              action === 'down' ? it.score - (it.my_vote === -1 ? 0 : 1 - (it.my_vote === 1 ? -1 : 0)) :
              it.score - (it.my_vote === 1 ? 1 : it.my_vote === -1 ? -1 : 0),
          }
        : it
    )
    setItems(optimistic)
    try {
      const res = await voteQuestion(q.id, action)
      setItems((prev) => prev.map((it) => (it.id === q.id ? { ...it, score: res.score, my_vote: res.my_vote } : it)))
    } catch (e) {
      // revert on error by refetch
      setLoading(true)
      listQuestions({ tag: tagParam, sort }).then((res) => {
        setItems(res.data || res)
        setLoading(false)
      })
    }
  }

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-3">
        {tags.map((t) => (
          <TagChip key={t.slug} active={activeTags.includes(t.slug)} onClick={() => toggleTag(t.slug)}>
            {t.name}
          </TagChip>
        ))}
      </div>

      <div className="mb-3">
        <SortToggle value={sort} onChange={setSort} />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {items.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              onUpvote={(item) => doVote(item, q.my_vote === 1 ? 'remove' : 'up')}
              onDownvote={(item) => doVote(item, q.my_vote === -1 ? 'remove' : 'down')}
            />
          ))}
        </div>
      )}
    </div>
  )
}


