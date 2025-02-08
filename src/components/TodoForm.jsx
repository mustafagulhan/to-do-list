import { useState } from 'react';
import PropTypes from 'prop-types';

const TodoForm = ({ addTodo, existingTags, isDarkMode, t }) => {
  const [value, setValue] = useState('');
  const [priority, setPriority] = useState('normal'); // 'low', 'normal', 'high'
  const [dueDate, setDueDate] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    addTodo({
      text: value,
      priority,
      dueDate: dueDate || null,
      tags,
      subtasks: subtasks.map(st => st.text)
    });

    setValue('');
    setPriority('normal');
    setDueDate('');
    setSubtasks([]);
    setTags([]);
    setShowSubtasks(false);
    setShowTagInput(false);
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Date.now(), text: newSubtask }]);
    setNewSubtask('');
  };

  const removeSubtask = (id) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    const formattedTag = newTag.toLowerCase().replace(/\s+/g, '-');
    if (!tags.includes(formattedTag)) {
      setTags([...tags, formattedTag]);
    }
    setNewTag('');
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const priorityClasses = {
    low: isDarkMode
      ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
      : 'text-green-600 bg-green-50 hover:bg-green-100',
    normal: isDarkMode
      ? 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20'
      : 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    high: isDarkMode
      ? 'text-red-400 bg-red-500/10 hover:bg-red-500/20'
      : 'text-red-600 bg-red-50 hover:bg-red-100'
  };

  const toggleSubtasks = () => {
    setShowSubtasks(!showSubtasks);
    if (showTagInput) setShowTagInput(false);
  };

  const toggleTagInput = () => {
    setShowTagInput(!showTagInput);
    if (showSubtasks) setShowSubtasks(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
              : 'bg-white border-gray-200 text-gray-600 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
          }`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t.addTask}
        />
        <button
          type="submit"
          className="px-6 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 font-medium"
        >
          {t.add}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPriority('low')}
            className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
              priority === 'low'
                ? priorityClasses.low
                : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t.priority.low}
          </button>
          <button
            type="button"
            onClick={() => setPriority('normal')}
            className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
              priority === 'normal'
                ? priorityClasses.normal
                : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t.priority.normal}
          </button>
          <button
            type="button"
            onClick={() => setPriority('high')}
            className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
              priority === 'high'
                ? priorityClasses.high
                : isDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {t.priority.high}
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              const dateInput = document.querySelector('#dateInput');
              if (dateInput) {
                dateInput.showPicker();
              }
            }}
            className={`text-sm px-3 py-1 rounded-md transition-all duration-200 flex items-center gap-1.5 ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <svg 
              className="w-3.5 h-3.5"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM2 2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H2z"/>
              <path d="M2.5 4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H3a.5.5 0 0 1-.5-.5V4z"/>
            </svg>
            {dueDate ? new Intl.DateTimeFormat('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }).format(new Date(dueDate)) : t.selectDate}
          </button>
          <input
            id="dateInput"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="absolute top-full left-0 mt-1 opacity-0 -z-10"
          />
        </div>

        <button
          type="button"
          onClick={toggleSubtasks}
          className={`text-sm px-3 py-1 rounded-md transition-all duration-200 ${
            isDarkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {showSubtasks ? t.subtasks.hide : t.subtasks.add}
        </button>

        <button
          type="button"
          onClick={toggleTagInput}
          className={`text-sm px-3 py-1 rounded-md transition-all duration-200 ${
            isDarkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {showTagInput ? t.tags.hide : t.tags.add}
        </button>
      </div>

      {showSubtasks && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder={t.subtasks.placeholder}
              className={`flex-1 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-white border-gray-200 text-gray-600 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
            <button
              type="button"
              onClick={addSubtask}
              className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                isDarkMode
                  ? 'text-blue-400 hover:bg-blue-500/10'
                  : 'text-blue-500 hover:bg-blue-50'
              }`}
            >
              {t.add}
            </button>
          </div>
          {subtasks.length > 0 && (
            <ul className="space-y-1">
              {subtasks.map((subtask) => (
                <li
                  key={subtask.id}
                  className={`flex items-center justify-between px-3 py-1 rounded-md ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {subtask.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSubtask(subtask.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showTagInput && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder={t.tags.placeholder}
              className={`flex-1 px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all duration-200 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-white border-gray-200 text-gray-600 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
              }`}
              list="existing-tags"
            />
            <datalist id="existing-tags">
              {existingTags.map(tag => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <button
              type="button"
              onClick={addTag}
              className={`px-3 py-1 text-sm rounded-md transition-all duration-200 ${
                isDarkMode
                  ? 'text-blue-400 hover:bg-blue-500/10'
                  : 'text-blue-500 hover:bg-blue-50'
              }`}
            >
              {t.add}
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
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
      )}
    </form>
  );
};

TodoForm.propTypes = {
  addTodo: PropTypes.func.isRequired,
  existingTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  t: PropTypes.object.isRequired
};

export default TodoForm; 