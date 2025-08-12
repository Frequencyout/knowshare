import { memo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function TagChip({ tag, isSelected, onClick, variant = 'default' }) {
  const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer';
  
  const variantClasses = {
    default: isSelected 
      ? 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200' 
      : 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200',
    removable: 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      title={tag.description || tag.name}
    >
      <span>{tag.name}</span>
      {tag.questions_count !== undefined && (
        <span className="ml-1 text-xs opacity-75">({tag.questions_count})</span>
      )}
      {variant === 'removable' && (
        <XMarkIcon className="w-4 h-4 ml-1" />
      )}
    </button>
  );
}

export default memo(TagChip);


