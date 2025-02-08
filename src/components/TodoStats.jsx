import PropTypes from 'prop-types';

const TodoStats = ({ todos, isDarkMode, t }) => {
  const totalTasks = todos.length;
  const completedTasks = todos.filter(todo => todo.completed).length;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityStats = todos.reduce(
    (acc, todo) => {
      acc[todo.priority] = (acc[todo.priority] || 0) + 1;
      return acc;
    },
    { high: 0, normal: 0, low: 0 }
  );

  const overdueTasks = todos.filter(todo => {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date().setHours(0, 0, 0, 0);
  }).length;

  const upcomingTasks = todos.filter(todo => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    return dueDate >= today && dueDate <= threeDaysFromNow;
  }).length;

  return (
    <div className={`rounded-lg p-6 mb-6 transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-800'
      }`}>
        {t.stats.title}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tamamlanma Oranı */}
        <div className={`p-4 rounded-lg shadow-sm transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t.stats.completionRate}
            </span>
            <span className="text-lg font-semibold text-blue-500">
              {completionRate}%
            </span>
          </div>
          <div className={`w-full rounded-full h-2.5 ${
            isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
          }`}>
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Öncelik Dağılımı */}
        <div className={`p-4 rounded-lg shadow-sm transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <span className={`text-sm block mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {t.stats.priorityDistribution}
          </span>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-red-500">{t.stats.priorities.high}</span>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {priorityStats.high}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-blue-500">{t.stats.priorities.normal}</span>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {priorityStats.normal}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-green-500">{t.stats.priorities.low}</span>
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {priorityStats.low}
              </span>
            </div>
          </div>
        </div>

        {/* Geciken Görevler */}
        <div className={`p-4 rounded-lg shadow-sm transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t.stats.overdueTasks}
            </span>
            <span className={`text-lg font-semibold ${
              overdueTasks > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              {overdueTasks}
            </span>
          </div>
        </div>

        {/* Yaklaşan Görevler */}
        <div className={`p-4 rounded-lg shadow-sm transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {t.stats.upcomingTasks}
            </span>
            <span className="text-lg font-semibold text-orange-500">
              {upcomingTasks}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

TodoStats.propTypes = {
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      text: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      priority: PropTypes.oneOf(['low', 'normal', 'high']),
      dueDate: PropTypes.string
    })
  ).isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  t: PropTypes.object.isRequired
};

export default TodoStats; 