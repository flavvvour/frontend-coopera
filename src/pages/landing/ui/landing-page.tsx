import React from 'react';
import { useState } from 'react';
import './landing-page.css';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('telegram');
  const [billingPeriod, setBillingPeriod] = useState('month');

  return (
    <div className="landing-page">

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

      <section className="landing-main">
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
              <p className="header-main-p">Доверяют более 1000+ команд</p>
            </div>
            <h1>Платформа для командной работы</h1>
            <p className="main-content-p">
              Попробуй и открой для себя новую платформу с автоматизацией
            </p>
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

      <section className="landing-crossplatform">
        <p>Кроссплатформенность</p>
        <h2>Работайте из любого места, будьте в курсе событий</h2>

        <div className="image-slider-container">
          <div className="image-wrapper">
            <img
              className={`slide-image ${activeTab === 'telegram' ? 'active' : ''}`}
              src="src/assets/telegram-bot.png"
              alt="Telegram bot"
            />
            <img
              className={`slide-image ${activeTab === 'web' ? 'active' : ''}`}
              src="src/assets/web-app.png"
              alt="Web application"
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

      <section className="landing-steps">
        <div className="header-steps">
          <h1>Ваша идеальная платформа, для экономии личного времени</h1>
          <div className="header-steps-column">
            <p>
              От продвинутых инструментов до автоматизации - мы разработали все, чтобы улучшить ваш
              опыт работы в команде
            </p>
            <button>
              Начать прямо сейчас
              <div className="rect-steps">
                <img src="src\assets\arrow.svg" alt="arrow" />
              </div>
            </button>
          </div>
        </div>
        <div className="steps-blocks">
          <div className="blocks">
            <div className="first-block">
              <div className="background-block">
                <img
                  src="src/assets/first-block.svg"
                  alt="authorization"
                  onContextMenu={e => e.preventDefault()}
                  draggable="false"
                />
                <div className="background-block-text">
                  <h2>Авторизация</h2>
                  <p>Войдите через Telegram за 2 клика</p>
                </div>
              </div>
            </div>
            <div className="second-block">
              <div className="background-block">
                <img src="src/assets/second-block.svg" alt="creating-a-team" />
                <div className="background-block-text">
                  <h2>Создание своей первой команды</h2>
                  <p>Дайте название вашей команде и добавьте участников</p>
                </div>
              </div>
            </div>
            <div className="third-block">
              <div className="background-block">
                <img src="src/assets/third-block.svg" alt="adding-participants" />
                <div className="background-block-text">
                  <h2>Добавление участников в команду</h2>
                  <p>Пригласите участников по никнейму в Telegram</p>
                </div>
              </div>
            </div>
            <div className="fourth-block">
              <div className="background-block">
                <img src="src/assets/fourth-block.svg" alt="creating-a-tasks" />
                <div className="background-block-text">
                  <h2>Создание первых задач</h2>
                  <p>Заполните поля с названием и описанием</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-price">
        <p className="landing-price-p">Ценообразование</p>
        <h2 className="landing-price-h2">Настрой платформу под себя</h2>
        <div className={`month-year-tabs ${billingPeriod === 'year' ? 'year-active' : ''}`}>
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
                  <li>
                    <img src="src/assets/check-mark.svg" alt="" />1 команда (до 4-х человек)
                  </li>
                  <li>
                    <img src="src/assets/check-mark.svg" alt="" />
                    Ручное назначение задач
                  </li>
                  <li>
                    <img src="src/assets/check-mark.svg" alt="" />
                    Базовая аналитика
                  </li>
                </ul>
              </div>
              <button className="plan-button">Попробуй сейчас</button>
            </div>
          </div>

          <div className="plan-card">
            <div className="premium-plan">
              <div className="plan-content">
                <h3>Премиум тариф</h3>
                <h4>{billingPeriod === 'month' ? '199 руб/месяц' : '2 099 руб/год'}</h4>
                <p>Что входит в тариф:</p>
                <ul>
                  <li>
                    <img src="src/assets/check-mark.svg" alt="" />
                    10 команд (до 8-х человек)
                  </li>
                  <li>
                    <img src="src/assets/check-mark.svg" alt="" />
                    Авто-распределение задач
                  </li>
                  <li>
                    <img src="src/assets/check-mark.svg" alt="" />
                    Уведомления о назначении
                  </li>
                  <li>
                    <img src="src/assets/check-mark.svg" alt="" />
                    Расширенная аналитика
                  </li>
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

      <section className="landing-main">
        <div className="container">
          <div className="main-content-end">
            <div className="header-main">
              <div className="stars">
                <img src="src/assets/star.svg" alt="" />
                <img src="src/assets/star.svg" alt="" />
                <img src="src/assets/star.svg" alt="" />
                <img src="src/assets/star.svg" alt="" />
                <img src="src/assets/star.svg" alt="" />
              </div>
              <p className="header-main-p">Доверяют более 1000+ команд</p>
            </div>
            <h1>Продаем не доступ, а решение конфликтов и экономию нервов.</h1>
            <p className="main-content-p">
              Попробуй и открой для себя новую платформу с автоматизацией
            </p>
            <div className="button-container">
              <button className="get-started-btn" onClick={() => (window.location.href = '/login')}>
                Начать прямо сейчас
                <div className="rect">
                  <img src="src\assets\arrow.svg" alt="arrow" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <h1>Coopera</h1>
        <p>© 2026 Университет им. Н.И. Лобачевского</p>
        <div className="icons">
          <img src="src/assets/telegram-icon.svg" alt="telegram-icon" />
          <img src="src/assets/github-icon.svg" alt="github-icon" />
        </div>
      </footer>
    </div>
  );
};
