import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // FSD правила для архитектуры
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['**/src/pages/*/ui/*'],
            message: 'Import pages components through public API - use @/pages/page-name',
          },
          {
            group: ['**/src/features/*/ui/*'], 
            message: 'Import features components through public API - use @/features/feature-name',
          },
          {
            group: ['**/src/widgets/*/ui/*'],
            message: 'Import widgets components through public API - use @/widgets/widget-name',
          },
          {
            group: ['**/src/entities/*/ui/*'],
            message: 'Import entities components through public API - use @/entities/entity-name',
          },
          {
            group: ['**/src/shared/*/ui/*'],
            message: 'Import shared components through public API - use @/shared/ui',
          }
        ],
      }],
    },
  },
])