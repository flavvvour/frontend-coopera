# 🛠️ Установленные инструменты

## ✅ Что установлено:

### 1. **Prettier** - Форматирование кода
- Конфигурация: `.prettierrc`
- Автоформат кода перед коммитом

**Использование:**
```bash
npm run format         # Отформатировать все файлы
npm run format:check   # Проверить форматирование
```

---

### 2. **TanStack Query (React Query)** - Управление серверным состоянием
- Кеширование API запросов
- Автоматические retry
- Оптимистичные обновления

**Использование:**
```tsx
import { useTasks, useUpdateTask } from '@/shared/api';

// В компоненте
const { data: tasks, isLoading } = useTasks(teamId);
const updateTask = useUpdateTask();

updateTask.mutate({
  taskId: 123,
  data: { status: 'completed' },
  teamId: 5
});
```

**Примеры хуков:** `src/shared/api/hooks.ts`

---

### 3. **Sentry** - Мониторинг ошибок
- Отслеживание ошибок в production
- Session replay
- Performance monitoring

**Настройка:**
1. Зарегистрируйся на [sentry.io](https://sentry.io)
2. Создай новый React проект
3. Скопируй DSN в `.env`:
   ```
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   ```

**Работает только в production** (`npm run build`)

---

## 📁 Новые файлы:

- `.prettierrc` - Настройки Prettier
- `.prettierignore` - Игнорируемые файлы
- `.env` - Переменные окружения (НЕ КОММИТИТЬ!)
- `.env.example` - Пример env файла (коммитить)
- `src/shared/api/hooks.ts` - React Query хуки

---

## 🚀 Следующие шаги (опционально):

### Husky + lint-staged
Автоматический lint и format перед коммитом:
```bash
npm install -D husky lint-staged
npx husky init
```

### Docker Compose
Поднять всю инфраструктуру одной командой.

### GitHub Actions
CI/CD pipeline для автоматического тестирования и деплоя.

---

## 💡 Рекомендации:

1. **Перед коммитом:** `npm run format && npm run lint`
2. **Используй React Query** вместо `useState` для серверных данных
3. **Проверь .env** - добавь свои значения
4. **Sentry DSN** - получи после регистрации

---

## 📚 Документация:

- [Prettier](https://prettier.io/docs/en/index.html)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview)
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)
