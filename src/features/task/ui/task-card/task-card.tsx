import type { Task } from '@/entities/task';

export const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    return (
      <div className="task-card">
        <div className="task-header">
          <span className="assignee">{task.assignee.first_name} {task.assignee.last_name}</span>
          <span className="priority">{task.priority}</span>
        </div>
        <p className="task-title">{task.title}</p>
        <div className="task-footer">
          <button className="take-task-btn">Взять задачу</button>
        </div>
      </div>
    );
};