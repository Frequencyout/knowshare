import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { createQuestion } from '../api/questions.service';
import { listTags } from '../api/tags.service';
import TagChip from '../components/TagChip';

export default function AskQuestionPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    // Filter tags based on search
    if (tagSearch.trim()) {
      const filtered = allTags.filter(tag => 
        tag.name.toLowerCase().includes(tagSearch.toLowerCase()) ||
        tag.slug.toLowerCase().includes(tagSearch.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      // Show popular tags first
      setFilteredTags(allTags.slice(0, 20));
    }
  }, [tagSearch, allTags]);

  const loadTags = async () => {
    try {
      const data = await listTags();
      setAllTags(data.data || data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.slug === tag.slug);
      if (isSelected) {
        return prev.filter(t => t.slug !== tag.slug);
      } else {
        return [...prev, tag];
      }
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const questionData = {
        title,
        body_markdown: body,
        tags: selectedTags.map(t => t.slug)
      };
      const question = await createQuestion(questionData);
      navigate(`/question/${question.id}`);
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to post question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ask a Question</h1>
        <p className="text-gray-600 mt-2">
          Share your question with the community to get help and answers.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Be specific and imagine you're asking a question to another person"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Details
          </label>
          <textarea
            required
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Provide all the details someone would need to understand your problem. You can use Markdown formatting."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Supports Markdown formatting
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags ({selectedTags.length}/5)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Add tags to describe what your question is about. Maximum 5 tags.
          </p>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <TagChip
                    key={tag.slug}
                    tag={tag}
                    isSelected={true}
                    onClick={() => toggleTag(tag)}
                    variant="removable"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tag Search */}
          <div className="relative mb-3">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Available Tags */}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <div className="flex flex-wrap gap-2">
              {filteredTags.map(tag => (
                <TagChip
                  key={tag.slug}
                  tag={tag}
                  isSelected={selectedTags.some(t => t.slug === tag.slug)}
                  onClick={() => selectedTags.length < 5 || selectedTags.some(t => t.slug === tag.slug) ? toggleTag(tag) : null}
                />
              ))}
              {filteredTags.length === 0 && tagSearch && (
                <p className="text-sm text-gray-500">No tags found</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !title.trim() || !body.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </form>
    </div>
  );
}


