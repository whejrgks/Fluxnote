import React from 'react';

const NoteList = ({ notes, selectedNote, onSelectNote, onDeleteNote }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
  };

  const getPreview = (content) => {
    if (!content) return '내용 없음';
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full p-4 text-center text-gray-500">
        <div className="text-5xl mb-3">📭</div>
        <p className="text-lg font-medium mb-1">노트가 없습니다</p>
        <p className="text-sm">새 노트를 만들어보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2">
      {notes.map(note => (
        <div
          key={note.id}
          className={`mb-2 rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 hover:translate-x-1 hover:shadow-md ${
            selectedNote?.id === note.id
              ? 'border-primary-500 bg-primary-50 shadow-md'
              : 'border-gray-200 bg-white shadow-sm hover:border-primary-300'
          }`}
          onClick={() => onSelectNote(note)}
        >
          <div className="flex justify-between items-start mb-2">
            <h6 className="text-base font-semibold text-gray-800 truncate flex-1 mr-2">
              {note.title || '제목 없음'}
            </h6>
            <button
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded p-1 transition-colors duration-200 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
              title="삭제"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {getPreview(note.content)}
          </p>
          <div className="flex items-center text-xs text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(note.updatedAt)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoteList;

