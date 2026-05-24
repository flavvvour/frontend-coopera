import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AppErrorFallback } from './AppErrorFallback';

describe('AppErrorFallback', () => {
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders error message text', () => {
    render(<AppErrorFallback />);
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
  });

  it('renders a reload button', () => {
    render(<AppErrorFallback />);
    expect(screen.getByRole('button', { name: 'Перезагрузить' })).toBeInTheDocument();
  });

  it('calls window.location.reload when reload button is clicked', () => {
    render(<AppErrorFallback />);
    fireEvent.click(screen.getByRole('button', { name: 'Перезагрузить' }));
    expect(reloadMock).toHaveBeenCalledOnce();
  });
});
