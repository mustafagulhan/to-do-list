import { useState, useEffect } from 'react'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import TodoStats from './components/TodoStats'
import SearchBar from './components/SearchBar'
import { translations } from './locales/translations'

function App() {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos')
    return savedTodos ? JSON.parse(savedTodos) : []
  })

  const [filter, setFilter] = useState('all') // 'all', 'active', 'completed'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [showStats, setShowStats] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language')
    return saved || 'tr'
  })

  const [editingTodo, setEditingTodo] = useState(null);

  const t = translations[language];

  // Tüm etiketleri topla
  const allTags = [...new Set(todos.flatMap(todo => todo.tags || []))]

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  const addTodo = ({ text, priority, dueDate, tags = [], subtasks = [] }) => {
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text,
        completed: false,
        priority,
        dueDate,
        tags,
        subtasks: subtasks.map(task => ({
          id: Date.now() + Math.random(),
          text: task,
          completed: false
        }))
      }
    ])
  }

  const toggleTodo = (id, subtaskId = null) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id !== id) return todo;
        
        if (subtaskId) {
          // Alt görev tamamlama
          const updatedSubtasks = todo.subtasks.map(subtask =>
            subtask.id === subtaskId
              ? { ...subtask, completed: !subtask.completed }
              : subtask
          );
          
          // Tüm alt görevler tamamlandıysa ana görevi de tamamla
          const allSubtasksCompleted = updatedSubtasks.every(st => st.completed);
          return {
            ...todo,
            subtasks: updatedSubtasks,
            completed: allSubtasksCompleted
          };
        }
        
        // Ana görev tamamlama
        return {
          ...todo,
          completed: !todo.completed,
          subtasks: todo.subtasks?.map(st => ({
            ...st,
            completed: !todo.completed
          }))
        };
      })
    )
  }

  const addSubtask = (todoId, subtaskText) => {
    setTodos(
      todos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: [
                ...(todo.subtasks || []),
                {
                  id: Date.now() + Math.random(),
                  text: subtaskText,
                  completed: false
                }
              ]
            }
          : todo
      )
    )
  }

  const deleteSubtask = (todoId, subtaskId) => {
    setTodos(
      todos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              subtasks: todo.subtasks.filter((st) => st.id !== subtaskId)
            }
          : todo
      )
    )
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed))
  }

  const sortTodos = (todos) => {
    return [...todos].sort((a, b) => {
      // Önce tamamlanmamış görevler
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      // Sonra önceliğe göre sırala
      const priorityOrder = { high: 0, normal: 1, low: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Sonra tarihe göre sırala
      if (a.dueDate || b.dueDate) {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        const dateA = new Date(a.dueDate)
        const dateB = new Date(b.dueDate)
        if (dateA < dateB) return -1
        if (dateA > dateB) return 1
      }

      // Son olarak ekleme sırasına göre sırala
      return b.id - a.id
    })
  }

  const filteredTodos = sortTodos(
    todos.filter((todo) => {
      // Temel filtreler
      if (filter === 'active' && todo.completed) return false
      if (filter === 'completed' && !todo.completed) return false

      // Arama filtresi
      if (searchTerm && !todo.text.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Etiket filtresi
      if (selectedTags.length > 0 && !selectedTags.every(tag => todo.tags?.includes(tag))) {
        return false
      }

      return true
    })
  )

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length
  const activeCount = totalCount - completedCount

  const editTodo = (id, newText, newPriority, newDueDate, newSubtasks, newTags) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { 
            ...todo, 
            text: newText.trim(),
            priority: newPriority || 'normal',
            dueDate: newDueDate || null,
            subtasks: Array.isArray(newSubtasks) ? newSubtasks.map(st => ({
              id: st.id || Date.now() + Math.random(),
              text: typeof st === 'string' ? st : (st.text || '').trim(),
              completed: Boolean(st.completed)
            })) : [],
            tags: Array.isArray(newTags) ? [...new Set(newTags.map(tag => tag.trim()))] : []
          }
        : todo
    ));
    setEditingTodo(null);
  };

  return (
    <div className={`min-h-screen py-8 px-4 transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Başlık ve Butonlar */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}>
              {t.title}
            </h1>
            {totalCount > 0 && (
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {completedCount} / {totalCount} {t.tasksCompleted}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
              className={`px-3 py-1 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {language === 'tr' ? 'EN' : 'TR'}
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className={`text-sm px-3 py-1 rounded-md transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-800 text-blue-400 hover:bg-gray-700'
                  : 'bg-white text-blue-600 hover:bg-gray-50'
              }`}
            >
              {showStats ? t.hideStats : t.showStats}
            </button>
          </div>
        </div>

        {showStats && <TodoStats todos={todos} isDarkMode={isDarkMode} t={t} />}

        {/* Görev Ekleme Kartı */}
        <div className={`rounded-xl shadow-lg p-6 transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <TodoForm addTodo={addTodo} existingTags={allTags} isDarkMode={isDarkMode} t={t} />
        </div>

        {/* Görev Listesi Kartı */}
        <div className={`rounded-xl shadow-lg p-6 transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="mb-6">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              tags={allTags}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              isDarkMode={isDarkMode}
              t={t}
            />
          </div>

          {totalCount > 0 && (
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                    filter === 'all'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                >
                  {t.filters.all} ({totalCount})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                    filter === 'active'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                >
                  {t.filters.active} ({activeCount})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                    filter === 'completed'
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 bg-white hover:bg-gray-50'
                  }`}
                >
                  {t.filters.completed} ({completedCount})
                </button>
              </div>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className={`text-sm px-3 py-1 rounded-md transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-gray-900 text-red-400 hover:bg-red-500/10'
                      : 'bg-white text-red-500 hover:bg-red-50'
                  }`}
                >
                  {t.clearCompleted}
                </button>
              )}
            </div>
          )}

          <TodoList
            todos={filteredTodos}
            toggleTodo={toggleTodo}
            deleteTodo={deleteTodo}
            editTodo={editTodo}
            editingTodo={editingTodo}
            setEditingTodo={setEditingTodo}
            addSubtask={addSubtask}
            deleteSubtask={deleteSubtask}
            isDarkMode={isDarkMode}
            t={t}
          />
        </div>
      </div>
    </div>
  )
}

export default App
