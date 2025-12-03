import React from 'react';
import './landing-page.css'; // Импортируем стили

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Шапка */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>Coopera</h1>
              {/* <p>Трекер задач с системой баллов</p> */}
            </div>

            <button className="login-btn" onClick={() => (window.location.href = '/login')}>
              Войти через Telegram
            </button>
          </div>
        </div>
      </header>

      {/* Герой-секция */}
      <section className="hero-section">
        <div className="container">
          <h2 className="hero-title">
            Управляйте задачами
            <br />с мотивацией
          </h2>

          <p className="hero-description">
            Создавайте команды, назначайте задачи и зарабатывайте баллы за выполнение. Просто как
            канбан, но с игровыми элементами.
          </p>

          <div className="hero-actions">
            <button className="cta-button primary">Начать использовать</button>

            <button className="cta-button secondary">Узнать больше</button>
          </div>
        </div>
      </section>

      {/* Mockup канбан-доски */}
      <section className="kanban-section">
        <div className="container">
          <div className="kanban-mockup">
            {/* Колонка To Do */}
            <div className="kanban-column">
              <h3 className="column-title">To Do</h3>

              <div className="task-card todo">
                <div className="task-title">Создать дизайн</div>
                <div className="task-points">10 баллов</div>
              </div>

              <div className="task-card todo">
                <div className="task-title">Написать документацию</div>
                <div className="task-points">5 баллов</div>
              </div>
            </div>

            {/* Колонка In Progress */}
            <div className="kanban-column">
              <h3 className="column-title">In Progress</h3>

              <div className="task-card in-progress">
                <div className="task-title">Разработать API</div>
                <div className="task-points">15 баллов</div>
              </div>
            </div>

            {/* Колонка Done */}
            <div className="kanban-column">
              <h3 className="column-title">Done</h3>

              <div className="task-card done">
                <div className="task-title">Прототип интерфейса</div>
                <div className="task-points">20 баллов</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
