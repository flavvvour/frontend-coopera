import React from 'react';
import { useState } from 'react';
import './landing-page.css';

export const LandingPage: React.FC = () => {

  const [activeTab, setActiveTab] = useState('telegram');

  return (
    <div className="landing-page">
      {/* Шапка */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>Coopera</h1>
            </div>
            <div className="header-nav">
              <a href="">Главная</a>
              <a href="">Разработка</a>
              <a href="">Сообщество</a>
              <a href="">О нас</a>
            </div>
            <button className="login-btn" onClick={() => (window.location.href = '/login')}>
              Регистрация
            </button>
          </div>
        </div>
      </header>

      <section className='landing-main'>
        <div className="container">
          <div className="main-content">
            <div className="header-main">
              <div className="stars">
                <img src="src/assets/star.svg" alt="" />
                <img src="src/assets/star.svg" alt="" />
                <img src="src/assets/star.svg" alt="" />
                <img src="src/assets/star.svg" alt="" />
                <img src="src/assets/star.svg" alt="" />
              </div>
              <p className='header-main-p'>Доверяют более 1000+ команд</p>
            </div>
            <h1>Платформа для командной работы</h1>
            <p className='main-content-p'>Попробуй и открой для себя новую платформу с автоматизацией</p>
            <div className="button-container">
              <button className="get-started-btn" onClick={() => (window.location.href = '/login')}>
                Начать прямо сейчас
                <div className="rect">
                  <img src="src\assets\arrow.svg" alt="arrow" />
                </div>
              </button>
              <button className="get-about-btn" onClick={() => (window.location.href = '/login')}>
                Узнать больше
              </button>
            </div>
            <div className="main-demo">
              <img src="src/assets/demo-main-section.png" alt="" />
            </div>
          </div>
        </div>
      </section>

      <section className='landing-crossplatform'>
        <p>кроссплатформенность</p>
        <h2>Работайте из любого места, будьте в курсе событий</h2>
        <div className="features-section">
          <div className="image-container">
            <img
              className={activeTab === 'telegram' ? 'slide-from-left' : 'slide-from-right'}
              src={activeTab === 'telegram' ? 'src/assets/telegram-bot.png' : 'src/assets/web-app.png'}
              alt={activeTab === 'telegram' ? 'Telegram bot' : 'Web application'} />
          </div>
          <div className="tabs">
            <button className={activeTab === 'telegram' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('telegram')}
            >
              Telegram-бот
            </button>
            <button className={activeTab === 'web' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('web')}
            >
              Web-приложение
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
