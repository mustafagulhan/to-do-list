import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';

const TodoList = ({ todos, toggleTodo, deleteTodo, editTodo, editingTodo, setEditingTodo, isDarkMode, t }) => {
  const [expandedTodos, setExpandedTodos] = useState(new Set());
  const [openMenus, setOpenMenus] = useState(new Set());
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState('normal');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSubtasks, setEditSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const menuRefs = useRef({});

  useEffect(() => {
    todos.forEach(todo => {
      if (!menuRefs.current[todo.id]) {
        menuRefs.current[todo.id] = React.createRef();
      }
    });
  }, [todos]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const openMenuIds = Array.from(openMenus);
      openMenuIds.forEach(todoId => {
        if (menuRefs.current[todoId]?.current && !menuRefs.current[todoId].current.contains(event.target)) {
          setOpenMenus(prev => {
            const newMenus = new Set(prev);
            newMenus.delete(todoId);
            return newMenus;
          });
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenus]);

  useEffect(() => {
    if (editingTodo) {
      setEditText(editingTodo.text);
      setEditPriority(editingTodo.priority || 'normal');
      setEditDueDate(editingTodo.dueDate || '');
      setEditSubtasks(editingTodo.subtasks || []);
      setEditTags(editingTodo.tags || []);
    }
  }, [editingTodo]);

  const handleEdit = (e) => {
    e.preventDefault();
    if (!editText.trim() || !editingTodo) return;
    
    const updatedSubtasks = Array.isArray(editSubtasks) ? editSubtasks.map(st => ({
      id: st.id || Date.now() + Math.random(),
      text: typeof st === 'string' ? st.trim() : (st.text || '').trim(),
      completed: Boolean(st.completed)
    })) : [];

    const updatedTags = Array.isArray(editTags) ? [...new Set(editTags.map(tag => tag.trim()))] : [];

    editTodo(
      editingTodo.id, 
      editText.trim(), 
      editPriority || 'normal', 
      editDueDate || null, 
      updatedSubtasks,
      updatedTags
    );
    
    // Form alanlarını temizle
    setEditingTodo(null);
    setEditText('');
    setEditPriority('normal');
    setEditDueDate('');
    setEditSubtasks([]);
    setEditTags([]);
    setNewSubtask('');
    setNewTag('');
  };

  const addEditSubtask = () => {
    if (!newSubtask.trim()) return;
    const newSubtaskItem = {
      id: Date.now() + Math.random(),
      text: newSubtask.trim(),
      completed: false
    };
    setEditSubtasks(prev => Array.isArray(prev) ? [...prev, newSubtaskItem] : [newSubtaskItem]);
    setNewSubtask('');
  };

  const removeEditSubtask = (subtaskId) => {
    setEditSubtasks(prev => 
      Array.isArray(prev) ? prev.filter(st => st.id !== subtaskId) : []
    );
  };

  const addEditTag = () => {
    if (!newTag.trim()) return;
    const formattedTag = newTag.toLowerCase().replace(/\s+/g, '-').trim();
    if (!editTags.includes(formattedTag)) {
      setEditTags(prev => Array.isArray(prev) ? [...prev, formattedTag] : [formattedTag]);
    }
    setNewTag('');
  };

  const removeEditTag = (tag) => {
    setEditTags(prev => 
      Array.isArray(prev) ? prev.filter(t => t !== tag) : []
    );
  };

  const handleDelete = (todoId) => {
    if (window.confirm(t.confirmDelete)) {
      deleteTodo(todoId);
      setOpenMenus(new Set());
    }
  };

  if (todos.length === 0) {
    return (
      <div className={`text-center py-6 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {t.noTasks}
      </div>
    );
  }

  const priorityColors = {
    low: isDarkMode
      ? 'text-emerald-400'
      : 'text-emerald-500',
    normal: isDarkMode
      ? 'text-blue-400'
      : 'text-blue-500',
    high: isDarkMode
      ? 'text-red-400'
      : 'text-red-500'
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const toggleExpand = (todoId) => {
    const newExpanded = new Set(expandedTodos);
    if (newExpanded.has(todoId)) {
      newExpanded.delete(todoId);
    } else {
      newExpanded.add(todoId);
    }
    setExpandedTodos(newExpanded);
  };

  const toggleMenu = (todoId) => {
    setOpenMenus(prev => {
      const newMenus = new Set(prev);
      if (newMenus.has(todoId)) {
        newMenus.delete(todoId);
      } else {
        newMenus.clear();
        newMenus.add(todoId);
      }
      return newMenus;
    });
  };

  const toggleSubtask = (todoId, subtaskId) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    const updatedSubtasks = todo.subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    // Alt görev durumunu güncelle ama ana görevi etkileme
    const updatedTodo = {
      ...todo,
      subtasks: updatedSubtasks
    };

    editTodo(todoId, updatedTodo.text, updatedTodo.priority, updatedTodo.dueDate, updatedSubtasks);
  };

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div key={todo.id}>
          <div
            className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? `${todo.completed ? 'bg-gray-800/90' : 'bg-gray-900'} hover:bg-gray-700`
                : `${todo.completed ? 'bg-gray-50' : 'bg-gray-100'} hover:bg-gray-50 border border-gray-100`
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-5 h-5">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className={`peer absolute w-5 h-5 rounded cursor-pointer transition-all duration-200 appearance-none border-2 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 checked:border-blue-500'
                      : 'bg-white border-gray-300 checked:border-blue-500'
                  }`}
                />
                <div className={`absolute inset-0 rounded transition-colors duration-200 pointer-events-none ${
                  todo.completed ? 'bg-blue-500' : 'bg-transparent'
                }`} />
                <svg
                  className={`absolute top-0.5 left-0.5 w-4 h-4 transition-opacity duration-200 pointer-events-none ${
                    todo.completed ? 'opacity-100' : 'opacity-0'
                  } text-white`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span
                  className={`${
                    isDarkMode
                      ? todo.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-200'
                      : todo.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-700'
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex gap-2 mt-0.5 items-center">
                  {todo.priority && (
                    <span className={`text-xs ${priorityColors[todo.priority]}`}>
                      {todo.priority === 'low' && t.priority.low}
                      {todo.priority === 'normal' && t.priority.normal}
                      {todo.priority === 'high' && t.priority.high}
                    </span>
                  )}
                  {todo.dueDate && (
                    <span className={`text-xs flex items-center gap-1.5 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <svg 
                        className={`w-3.5 h-3.5 ${
                          isDarkMode ? 'text-gray-400' : 'text-blue-500'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
                        <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
                      </svg>
                      {formatDate(todo.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {todo.subtasks?.length > 0 && (
                <button
                  onClick={() => toggleExpand(todo.id)}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-white bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <svg 
                    className={`w-4 h-4 transform transition-transform duration-200 ${
                      expandedTodos.has(todo.id) ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              <div className="relative" ref={menuRefs.current[todo.id]}>
                <button
                  onClick={() => toggleMenu(todo.id)}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    isDarkMode
                      ? 'text-gray-400 hover:bg-gray-700'
                      : 'text-white bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
                {openMenus.has(todo.id) && (
                  <div className={`absolute right-0 mt-1 py-1 w-32 rounded-md shadow-lg z-50 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => {
                        setEditingTodo(todo);
                        toggleMenu(todo.id);
                      }}
                      className={`w-full px-4 py-1.5 text-left text-sm flex items-center gap-2 ${
                        isDarkMode
                          ? 'hover:bg-gray-700 text-gray-300'
                          : 'hover:bg-blue-50 text-blue-500'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      {t.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className={`w-full px-4 py-1.5 text-left text-sm flex items-center gap-2 ${
                        isDarkMode
                          ? 'hover:bg-gray-700 text-red-400'
                          : 'hover:bg-red-50 text-red-500'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {t.delete}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Düzenleme paneli */}
          {editingTodo?.id === todo.id && (
            <div className={`mt-2 p-4 rounded-lg transition-all duration-200 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="flex flex-col gap-4">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                        : 'bg-white border-gray-200 text-gray-600 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  <div className="flex gap-4">
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      <option value="low">Düşük Öncelik</option>
                      <option value="normal">Normal Öncelik</option>
                      <option value="high">Yüksek Öncelik</option>
                    </select>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    />
                  </div>

                  {/* Alt görev düzenleme */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Alt görev ekle..."
                        className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-200 text-gray-600 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={addEditSubtask}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-gray-700 text-blue-400 hover:bg-gray-600'
                            : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
                        }`}
                      >
                        Ekle
                      </button>
                    </div>
                    {editSubtasks.length > 0 && (
                      <div className="space-y-2">
                        {editSubtasks.map((subtask) => (
                          <div
                            key={subtask.id}
                            className={`flex items-center justify-between p-2 rounded-lg ${
                              isDarkMode ? 'bg-gray-700' : 'bg-white'
                            }`}
                          >
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {subtask.text}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeEditSubtask(subtask.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Etiket düzenleme */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Etiket ekle..."
                        className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-200 text-gray-600 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={addEditTag}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                          isDarkMode
                            ? 'bg-gray-700 text-blue-400 hover:bg-gray-600'
                            : 'bg-gray-200 text-blue-600 hover:bg-gray-300'
                        }`}
                      >
                        Ekle
                      </button>
                    </div>
                    {editTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editTags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                              isDarkMode
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            #{tag}
                            <button
                              type="button"
                              onClick={() => removeEditTag(tag)}
                              className={`${
                                isDarkMode
                                  ? 'text-gray-500 hover:text-gray-400'
                                  : 'text-gray-400 hover:text-gray-600'
                              }`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTodo(null)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
                  >
                    {t.save}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Alt görevler */}
          {todo.subtasks?.length > 0 && expandedTodos.has(todo.id) && (
            <div className={`ml-8 mt-2 space-y-2 ${
              isDarkMode ? 'text-gray-300 bg-gray-800/90 p-2 rounded-lg' : 'text-gray-600'
            }`}>
              {todo.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <div className="relative w-4 h-4">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleSubtask(todo.id, subtask.id)}
                      className={`peer absolute w-4 h-4 rounded cursor-pointer transition-all duration-200 appearance-none border-2 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 checked:border-blue-500'
                          : 'bg-white border-gray-300 checked:border-blue-500'
                      }`}
                    />
                    <div className={`absolute inset-0 rounded transition-colors duration-200 pointer-events-none ${
                      subtask.completed ? 'bg-blue-500' : 'bg-transparent'
                    }`} />
                    <svg
                      className={`absolute top-0.5 left-0.5 w-3 h-3 transition-opacity duration-200 pointer-events-none ${
                        subtask.completed ? 'opacity-100' : 'opacity-0'
                      } text-white`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className={subtask.completed ? 'line-through' : ''}>
                    {subtask.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

TodoList.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      priority: PropTypes.oneOf(['low', 'normal', 'high']),
      dueDate: PropTypes.string,
      subtasks: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          text: PropTypes.string.isRequired,
          completed: PropTypes.bool.isRequired
        })
      )
    })
  ).isRequired,
  toggleTodo: PropTypes.func.isRequired,
  deleteTodo: PropTypes.func.isRequired,
  editTodo: PropTypes.func.isRequired,
  editingTodo: PropTypes.object,
  setEditingTodo: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  t: PropTypes.object.isRequired
};

export default TodoList; 