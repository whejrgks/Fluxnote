import React, { useState, useEffect } from 'react';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import SearchBar from './components/SearchBar';

function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // localStorage에서 노트 불러오기
  useEffect(() => {
    const savedNotes = localStorage.getItem('fluxnote-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Failed to load notes:', error);
      }
    }
  }, []);

  // 노트가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem('fluxnote-notes')) {
      localStorage.setItem('fluxnote-notes', JSON.stringify(notes));
    }
  }, [notes]);

  // 검색 필터링된 노트
  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  // 새 노트 생성
  const handleCreateNote = () => {
    const newNote = {
      id: Date.now(),
      title: '새 노트',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
  };

  // 노트 업데이트
  const handleUpdateNote = (updatedNote) => {
    setNotes(notes.map(note =>
      note.id === updatedNote.id
        ? { ...updatedNote, updatedAt: new Date().toISOString() }
        : note
    ));
    setSelectedNote(updatedNote);
  };

  // 노트 삭제
  const handleDeleteNote = (noteId) => {
    if (window.confirm('이 노트를 삭제하시겠습니까?')) {
      setNotes(notes.filter(note => note.id !== noteId));
      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote(null);
      }
    }
  };

  // 노트 선택
  const handleSelectNote = (note) => {
    setSelectedNote(note);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-500">
            📝 FluxNote
          </h1>
          <button 
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 md:py-3 md:px-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            onClick={handleCreateNote}
          >
            + 새 노트
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="bg-white border-r border-gray-200 shadow-sm flex flex-col w-full md:w-96">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <NoteList
            notes={filteredNotes}
            selectedNote={selectedNote}
            onSelectNote={handleSelectNote}
            onDeleteNote={handleDeleteNote}
          />
        </aside>

        <main className="flex-1 bg-gray-50 overflow-auto p-4 md:p-8">
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onUpdateNote={handleUpdateNote}
            />
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-6xl md:text-8xl mb-4">📝</div>
                <p className="text-xl md:text-2xl">노트를 선택하거나 새 노트를 만들어보세요!</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

