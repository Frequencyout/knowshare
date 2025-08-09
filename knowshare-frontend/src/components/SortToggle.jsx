const options = [
  { key: 'new', label: 'New' },
  { key: 'top', label: 'Top' },
  { key: 'unanswered', label: 'Unanswered' },
]

export default function SortToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`px-3 py-1 text-sm ${
            value === o.key ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-600'
          } ${o.key !== 'unanswered' ? 'border-r border-gray-200' : ''}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}


