import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listTags, getPopularTags } from '../api/tags.service';

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
    loadPopularTags();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTags();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadTags = async () => {
    try {
      const data = await listTags(search);
      setTags(data.data || []);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPopularTags = async () => {
    try {
      const data = await getPopularTags();
      setPopularTags(data || []);
    } catch (error) {
      console.error('Failed to load popular tags:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tags</h1>
        <p className="text-gray-600 mb-6">
          Browse questions by tags. Click on a tag to see all related questions.
        </p>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Popular Tags */}
      {!search && popularTags.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Popular Tags</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTags.map(tag => (
              <Link
                key={tag.id}
                to={`/tags/${tag.slug}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {tag.name}
                    </h3>
                    {tag.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {tag.description}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {tag.questions_count || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Tags */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          {search ? 'Search Results' : 'All Tags'}
        </h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading tags...</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            {search ? 'No tags found matching your search.' : 'No tags available.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tags.map(tag => (
              <Link
                key={tag.id}
                to={`/tags/${tag.slug}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {tag.name}
                    </h3>
                    {tag.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {tag.description}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {tag.questions_count || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;
