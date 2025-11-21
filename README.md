# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

```
coopera-frontend
├─ .hintrc
├─ README.md
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ public
│  └─ vite.svg
├─ src
│  ├─ app
│  │  ├─ App.tsx
│  │  ├─ providers
│  │  │  └─ router.tsx
│  │  └─ styles
│  │     └─ index.css
│  ├─ assets
│  │  └─ react.svg
│  ├─ entities
│  │  ├─ column
│  │  │  ├─ index.ts
│  │  │  └─ types.ts
│  │  ├─ task
│  │  │  ├─ index.ts
│  │  │  ├─ model
│  │  │  │  └─ task-store.ts
│  │  │  └─ types.ts
│  │  ├─ team
│  │  │  ├─ index.ts
│  │  │  └─ types.ts
│  │  └─ user
│  │     ├─ index.ts
│  │     └─ model
│  │        ├─ auth-service.ts
│  │        ├─ types.ts
│  │        └─ user-store.ts
│  ├─ features
│  │  ├─ auth-by-telegram
│  │  │  ├─ index.ts
│  │  │  ├─ model
│  │  │  │  └─ use-telegram-auth.ts
│  │  │  └─ ui
│  │  │     ├─ telegram-login-button.css
│  │  │     └─ telegram-login-button.tsx
│  │  ├─ task
│  │  │  ├─ index.ts
│  │  │  └─ ui
│  │  │     ├─ create-task-form.css
│  │  │     ├─ create-task-form.tsx
│  │  │     ├─ kanban-board.css
│  │  │     └─ kanban-board.tsx
│  │  ├─ task-management
│  │  │  ├─ index.ts
│  │  │  ├─ model
│  │  │  │  └─ use-task-actions.ts
│  │  │  ├─ types.ts
│  │  │  └─ ui
│  │  │     └─ task-card.tsx
│  │  ├─ team
│  │  │  ├─ create-team-form.css
│  │  │  ├─ create-team-form.tsx
│  │  │  ├─ model
│  │  │  │  └─ use-team-management.ts
│  │  │  └─ types.ts
│  │  └─ user
│  ├─ main.tsx
│  ├─ pages
│  │  ├─ dashboard
│  │  │  ├─ index.ts
│  │  │  └─ ui
│  │  │     ├─ dashboard-page.css
│  │  │     └─ dashboard-page.tsx
│  │  ├─ landing
│  │  │  ├─ index.ts
│  │  │  └─ ui
│  │  │     ├─ landing-page.css
│  │  │     └─ landing-page.tsx
│  │  ├─ login
│  │  │  ├─ index.ts
│  │  │  └─ ui
│  │  │     ├─ login-page.css
│  │  │     └─ login-page.tsx
│  │  ├─ team-detail-page
│  │  │  ├─ index.ts
│  │  │  └─ ui
│  │  │     ├─ team-detail-page.css
│  │  │     └─ team-detail-page.tsx
│  │  └─ teams-page
│  │     ├─ index.ts
│  │     └─ ui
│  │        ├─ teams-page.css
│  │        └─ teams-page.tsx
│  ├─ shared
│  │  ├─ api
│  │  ├─ lib
│  │  └─ ui
│  └─ widgets
│     ├─ header
│     │  ├─ index.ts
│     │  └─ ui
│     │     ├─ header.css
│     │     └─ header.tsx
│     └─ sidebar
│        ├─ index.ts
│        └─ ui
│           ├─ sidebar.css
│           └─ sidebar.tsx
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts

```
