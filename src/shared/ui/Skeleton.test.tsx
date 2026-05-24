import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders without crashing', () => {
    render(<Skeleton />);
    expect(document.querySelector('.skeleton')).toBeInTheDocument();
  });

  it('applies the skeleton CSS class', () => {
    render(<Skeleton />);
    expect(document.querySelector('.skeleton')).toHaveClass('skeleton');
  });

  it('applies numeric width and height via inline style', () => {
    render(<Skeleton width={200} height={32} />);
    const el = document.querySelector('.skeleton') as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('32px');
  });

  it('applies string width and height via inline style', () => {
    render(<Skeleton width="50%" height="1rem" />);
    const el = document.querySelector('.skeleton') as HTMLElement;
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('1rem');
  });

  it('applies borderRadius via inline style', () => {
    render(<Skeleton borderRadius={4} />);
    const el = document.querySelector('.skeleton') as HTMLElement;
    expect(el.style.borderRadius).toBe('4px');
  });

  it('appends custom className alongside skeleton class', () => {
    render(<Skeleton className="my-extra" />);
    const el = document.querySelector('.skeleton');
    expect(el).toHaveClass('skeleton');
    expect(el).toHaveClass('my-extra');
  });

  it('uses default values when no props provided', () => {
    render(<Skeleton />);
    const el = document.querySelector('.skeleton') as HTMLElement;
    expect(el.style.width).toBe('100%');
    expect(el.style.height).toBe('16px');
  });
});
