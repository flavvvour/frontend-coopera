import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfirmModal } from './ConfirmModal';

function renderModal(overrides: Partial<React.ComponentProps<typeof ConfirmModal>> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmModal
      title="Удалить команду?"
      description="Это действие необратимо."
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />
  );
  return { onConfirm, onCancel };
}

describe('ConfirmModal', () => {
  it('renders title text', () => {
    renderModal();
    expect(screen.getByText('Удалить команду?')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderModal();
    expect(screen.getByText('Это действие необратимо.')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    renderModal({ description: undefined });
    expect(screen.queryByText('Это действие необратимо.')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const { onConfirm } = renderModal();
    fireEvent.click(screen.getByText('Удалить'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const { onCancel } = renderModal();
    fireEvent.click(screen.getByText('Отмена'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when the X close button is clicked', () => {
    const { onCancel } = renderModal();
    const closeBtn = document.querySelector('.cmodal-close') as HTMLElement;
    fireEvent.click(closeBtn);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when the overlay backdrop is clicked', () => {
    const { onCancel } = renderModal();
    const overlay = document.querySelector('.cmodal-overlay') as HTMLElement;
    fireEvent.click(overlay);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('does NOT call onCancel when clicking inside the modal card', () => {
    const { onCancel } = renderModal();
    const card = document.querySelector('.cmodal') as HTMLElement;
    fireEvent.click(card);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when Escape key is pressed', () => {
    const { onCancel } = renderModal();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('uses custom confirmLabel and cancelLabel', () => {
    renderModal({ confirmLabel: 'Да', cancelLabel: 'Нет' });
    expect(screen.getByText('Да')).toBeInTheDocument();
    expect(screen.getByText('Нет')).toBeInTheDocument();
  });
});
