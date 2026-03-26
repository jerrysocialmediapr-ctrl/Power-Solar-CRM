import React, { useState } from 'react';
import { MessageSquare, Trash2, Edit2, Plus, Clock, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';

export function NotesManager({ notesRaw, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [newNote, setNewNote] = useState('');

  const parseNotes = (raw) => {
    try {
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [{ id: 'legacy', text: String(raw), date: new Date().toISOString() }];
    } catch (e) {
      return raw ? [{ id: 'legacy', text: String(raw), date: new Date().toISOString() }] : [];
    }
  };

  const notes = parseNotes(notesRaw);

  const handleAdd = () => {
    if (!newNote.trim()) return;
    const updated = [
      {
        id: Date.now().toString(),
        text: newNote.trim(),
        date: new Date().toISOString(),
      },
      ...notes,
    ];
    onUpdate(JSON.stringify(updated));
    setNewNote('');
  };

  const handleDelete = (id) => {
    const updated = notes.filter(n => n.id !== id);
    onUpdate(JSON.stringify(updated));
  };

  const handleStartEdit = (note) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  const handleSaveEdit = () => {
    const updated = notes.map(n => n.id === editingId ? { ...n, text: editingText } : n);
    onUpdate(JSON.stringify(updated));
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Notas y Seguimiento</h4>
      </div>

      {/* Add Note Input */}
      <div className="flex gap-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribe una nueva nota..."
          className="flex-1 bg-background border border-border rounded-xl p-3 text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-none"
        />
        <button
          onClick={handleAdd}
          disabled={!newNote.trim()}
          className="btn btn-primary px-4 self-end h-[80px] disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {notes.length === 0 ? (
          <p className="text-center py-6 text-slate-500 text-sm italic">No hay notas registradas.</p>
        ) : notes.map((note) => (
          <div key={note.id} className="bg-slate-800/40 border border-border rounded-xl p-3 group animate-in slide-in-from-top-2">
            {editingId === note.id ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="w-full bg-background border border-primary/50 rounded-lg p-2 text-sm text-white outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingId(null)} className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={handleSaveEdit} className="p-1.5 bg-primary text-white rounded-md">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <Clock className="w-3 h-3" />
                    {format(new Date(note.date), "d 'de' MMM, p", { locale: es })}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{note.text}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
