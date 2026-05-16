import React from 'react';
import { useState } from 'react';
import './landing-page.css';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('telegram');
  const [billingPeriod, setBillingPeriod] = useState('month');

  return (
    <div className="landing-page">

      {/* ===== HEADER ===== */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <h1>Coop<span>era</span></h1>
          </div>
          <nav className="header-nav">
            <a href="#crossplatform">Возможности</a>
            <a href="#steps">Как работает</a>
            <a href="#pricing">Тарифы</a>
          </nav>
          <button className="login-btn" onClick={() => (window.location.href = '/login')}>
            Войти
          </button>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="landing-main">
        <div className="container">
          <div className="main-content">
            <div className="header-main">
              <div className="stars">
                <img src="/src/assets/star.svg" alt="" />
                <img src="/src/assets/star.svg" alt="" />
                <img src="/src/assets/star.svg" alt="" />
                <img src="/src/assets/star.svg" alt="" />
                <img src="/src/assets/star.svg" alt="" />
              </div>
              <p className="header-main-p">Доверяют более 1000+ команд</p>
            </div>
            <h1>Платформа для командной работы</h1>
            <p className="main-content-p">
              Попробуй и открой для себя новую платформу с автоматизацией
            </p>
            <div className="button-container">
              <button className="get-started-btn" onClick={() => (window.location.href = '/login')}>
                Начать прямо сейчас
              </button>
              <button className="get-about-btn" onClick={() => {
                document.getElementById('steps')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Узнать больше
              </button>
            </div>
            <div className="main-demo">
              <img src="/src/assets/demo-main-section.png" alt="Демонстрация платформы" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CROSSPLATFORM ===== */}
      <section id="crossplatform" className="landing-crossplatform">
        <p>Кроссплатформенность</p>
        <h2>Работайте из любого места, будьте в курсе событий</h2>

        <div className="image-slider-container">
          <div className="image-wrapper">
            <img
              className={`slide-image ${activeTab === 'telegram' ? 'active' : ''}`}
              src="/src/assets/telegram-bot.png"
              alt="Telegram бот"
            />
            <img
              className={`slide-image ${activeTab === 'web' ? 'active' : ''}`}
              src="/src/assets/web-app.png"
              alt="Веб-приложение"
            />
          </div>
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === 'telegram' ? 'active' : ''}`}
              onClick={() => setActiveTab('telegram')}
            >
              Telegram-бот
            </button>
            <button
              className={`tab-btn ${activeTab === 'web' ? 'active' : ''}`}
              onClick={() => setActiveTab('web')}
            >
              Web-приложение
            </button>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="steps" className="landing-steps">
        <div className="header-steps">
          <h1>Ваша идеальная платформа для экономии личного времени</h1>
          <div className="header-steps-column">
            <p>
              От продвинутых инструментов до автоматизации — мы разработали всё, чтобы улучшить ваш опыт работы в команде
            </p>
            <button onClick={() => (window.location.href = '/login')}>
              Начать прямо сейчас
            </button>
          </div>
        </div>
        <div className="steps-blocks">
          <div className="blocks">
            <div className="first-block">
              <div className="background-block">
                <img
                  src="/src/assets/first-block.svg"
                  alt="Авторизация"
                  onContextMenu={e => e.preventDefault()}
                  draggable={false}
                />
                <div className="background-block-text">
                  <h2>Авторизация</h2>
                  <p>Войдите через Telegram за 2 клика</p>
                </div>
              </div>
            </div>
            <div className="second-block">
              <div className="background-block">
                <img src="/src/assets/second-block.svg" alt="Создание команды" />
                <div className="background-block-text">
                  <h2>Создание своей первой команды</h2>
                  <p>Дайте название вашей команде и добавьте участников</p>
                </div>
              </div>
            </div>
            <div className="third-block">
              <div className="background-block">
                <img src="/src/assets/third-block.svg" alt="Добавление участников" />
                <div className="background-block-text">
                  <h2>Добавление участников в команду</h2>
                  <p>Пригласите участников по никнейму в Telegram</p>
                </div>
              </div>
            </div>
            <div className="fourth-block">
              <div className="background-block">
                <img src="/src/assets/fourth-block.svg" alt="Создание задач" />
                <div className="background-block-text">
                  <h2>Создание первых задач</h2>
                  <p>Заполните поля с названием и описанием</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="landing-price">
        <p className="landing-price-p">Ценообразование</p>
        <h2 className="landing-price-h2">Настрой платформу под себя</h2>
        <div className="month-year-tabs">
          <button
            className={billingPeriod === 'month' ? 'active' : ''}
            onClick={() => setBillingPeriod('month')}
          >
            Месяц
          </button>
          <button
            className={billingPeriod === 'year' ? 'active' : ''}
            onClick={() => setBillingPeriod('year')}
          >
            Год
          </button>
        </div>
        <div className="tariff-plan">
          <div className="plan-card">
            <div className="base-plan">
              <div className="plan-content">
                <h3>Базовый тариф</h3>
                <h4>Бесплатно</h4>
                <p>Что входит в тариф:</p>
                <ul>
                  <li><img src="/src/assets/check-mark.svg" alt="" />1 команда (до 4-х человек)</li>
                  <li><img src="/src/assets/check-mark.svg" alt="" />Ручное назначение задач</li>
                  <li><img src="/src/assets/check-mark.svg" alt="" />Базовая аналитика</li>
                </ul>
              </div>
              <button className="plan-button" onClick={() => (window.location.href = '/login')}>
                Попробуй сейчас
              </button>
            </div>
          </div>

          <div className="plan-card">
            <div className="premium-plan">
              <div className="plan-content">
                <h3>Премиум тариф</h3>
                <h4>{billingPeriod === 'month' ? '199 ₽/мес' : '2 099 ₽/год'}</h4>
                <p>Что входит в тариф:</p>
                <ul>
                  <li><img src="/src/assets/check-mark.svg" alt="" />10 команд (до 8-х человек)</li>
                  <li><img src="/src/assets/check-mark.svg" alt="" />Авто-распределение задач</li>
                  <li><img src="/src/assets/check-mark.svg" alt="" />Уведомления о назначении</li>
                  <li><img src="/src/assets/check-mark.svg" alt="" />Расширенная аналитика</li>
                </ul>
              </div>
              <button className="plan-button">
                {billingPeriod === 'month' ? 'Оплатить месяц' : 'Оплатить год'}
              </button>
            </div>
          </div>

          <div className="plan-card">
            <div className="custom-plan">
              <div className="plan-content">
                <h3>Настраиваемый тариф</h3>
                <h4>Для бизнеса</h4>
                <p>Идеально подходит для малого бизнеса, начинающего с автоматизации</p>
              </div>
              <button className="plan-button">Связаться с нами</button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="landing-main">
        <div className="container">
          <div className="main-content-end">
            <div className="header-main">
              <div className="stars">
                <img src="/src/assets/star.svg" alt="" />
                <img src="/src/assets/star.svg" alt="" />
                <img src="/src/assets/star.svg" alt="" />
                <img src="/src/assets/star.svg" alt="" />
                <img src="/src/assets/star.svg" alt="" />
              </div>
              <p className="header-main-p">Доверяют более 1000+ команд</p>
            </div>
            <h1>Продаём не доступ, а решение конфликтов и экономию нервов.</h1>
            <p className="main-content-p">
              Попробуй и открой для себя новую платформу с автоматизацией
            </p>
            <div className="button-container">
              <button className="get-started-btn" onClick={() => (window.location.href = '/login')}>
                Начать прямо сейчас
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <h1>Coopera</h1>
        <p>© 2026 Университет им. Н.И. Лобачевского</p>
        <div className="icons">
          <img src="/src/assets/telegram-icon.svg" alt="Telegram" />
          <img src="/src/assets/github-icon.svg" alt="GitHub" />
        </div>
      </footer>

    </div>
  );
};
