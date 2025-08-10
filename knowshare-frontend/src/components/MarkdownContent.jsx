import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownContent = ({ children, bodyHtml, className = '' }) => {
  // If we have pre-processed HTML from the server, use it for better performance
  if (bodyHtml) {
    return (
      <div 
        className={`prose prose-gray max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
        style={{
          // Add custom CSS for server-rendered HTML
          '--prose-headings': '#111827',
          '--prose-body': '#374151',
          '--prose-bold': '#111827',
          '--prose-links': '#2563eb',
          '--prose-code': '#111827',
          '--prose-pre-code': '#374151',
          '--prose-pre-bg': '#f3f4f6',
        }}
      />
    );
  }

  // Fallback to client-side markdown rendering
  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          // Custom renderers for better styling
          h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-gray-900 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium text-gray-900 mb-2">{children}</h3>,
          p: ({ children }) => <p className="text-gray-700 mb-3 leading-relaxed">{children}</p>,
          code: ({ inline, children }) => 
            inline ? (
              <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <code className="block bg-gray-100 text-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                {children}
              </code>
            ),
          pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded overflow-x-auto mb-3">{children}</pre>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-700">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-blue-600 hover:text-blue-800 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
