// src/features/auth-by-telegram/ui/telegram-login-button.tsx
import React, { useEffect, useRef } from 'react';

interface TelegramLoginButtonProps {
  botUsername: string; // Например: "mybot" (без @)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAuth: (userData: any) => void;
  buttonSize?: 'large' | 'medium' | 'small';
}

export const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  botUsername,
  onAuth,
  buttonSize = 'large',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Создаем глобальную функцию, которую вызовет Telegram
    window.onTelegramAuth = onAuth;

    // 2. Создаем скрипт виджета Telegram
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;

    // 3. Настраиваем атрибуты
    script.setAttribute('data-telegram-login', botUsername.replace('@', ''));
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write'); // Разрешения

    // 4. Вставляем в контейнер
    containerRef.current.appendChild(script);

    // 5. Очистка при размонтировании
    return () => {
      // Удаляем глобальную функцию
      delete window.onTelegramAuth;

      // Удаляем скрипт
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.innerHTML = '';
      }
    };
  }, [botUsername, buttonSize, onAuth]);

  // 6. Просто контейнер для виджета
  return <div ref={containerRef} />;
};
