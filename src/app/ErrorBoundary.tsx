import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return { hasError: true, message };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
          <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--danger)' }}>
            Что-то пошло не так
          </p>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
            {this.state.message}
          </span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => window.location.href = '/'}
          >
            На главную
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
