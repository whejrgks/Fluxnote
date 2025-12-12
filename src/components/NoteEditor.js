import React, { useState, useEffect } from 'react';

const NoteEditor = ({ note, onUpdateNote }) => {
  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');

  useEffect(() => {
    setTitle(note.title || '');
    setContent(note.content || '');
  }, [note.id]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdateNote({ ...note, title: newTitle });
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdateNote({ ...note, content: newContent });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          className="w-full text-3xl md:text-4xl font-bold border-0 border-b-2 border-primary-500 focus:outline-none focus:border-primary-600 pb-2 transition-colors duration-200 bg-transparent"
          value={title}
          onChange={handleTitleChange}
          placeholder="제목을 입력하세요..."
        />
        {note.updatedAt && (
          <div className="flex items-center mt-3 text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            수정됨: {formatDate(note.updatedAt)}
          </div>
        )}
      </div>
      <textarea
        className="flex-1 w-full text-lg leading-relaxed border-0 focus:outline-none resize-none bg-transparent placeholder-gray-400"
        style={{ 
          minHeight: '400px',
          fontSize: '1.1rem',
          lineHeight: '1.8'
        }}
        value={content}
        onChange={handleContentChange}
        placeholder="내용을 입력하세요..."
      />
    </div>
  );
};

export default NoteEditor;

