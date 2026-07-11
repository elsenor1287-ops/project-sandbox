import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Layout';
import { describe, it, expect, vi } from 'vitest';
import type { PageRoute } from '../../types';

describe('Sidebar', () => {
  const defaultProps = {
    currentPage: '/dashboard' as PageRoute,
    onNavigate: vi.fn(),
    identityStatus: 'active',
  };

  it('renders all expected navigation links', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Identity Wallet')).toBeInTheDocument();
    expect(screen.getByText('RCV Sandbox')).toBeInTheDocument();
    expect(screen.getByText('Proposal Compiler')).toBeInTheDocument();
  });

  it('calls onNavigate with correct path when clicked', () => {
    const onNavigateMock = vi.fn();
    render(<Sidebar {...defaultProps} onNavigate={onNavigateMock} />);

    fireEvent.click(screen.getByText('RCV Sandbox'));
    expect(onNavigateMock).toHaveBeenCalledWith('/vote');

    fireEvent.click(screen.getByText('Proposal Compiler'));
    expect(onNavigateMock).toHaveBeenCalledWith('/compiler');
  });

  it('applies the correct active class based on currentPage', () => {
    render(<Sidebar {...defaultProps} currentPage="/vote" />);

    // RCV Sandbox is active
    const activeItem = screen.getByText('RCV Sandbox').closest('button');
    expect(activeItem).toHaveClass('nav-item-active');
    expect(activeItem).not.toHaveClass('nav-item');

    // Dashboard is inactive
    const inactiveItem = screen.getByText('Dashboard').closest('button');
    expect(inactiveItem).toHaveClass('nav-item');
    expect(inactiveItem).not.toHaveClass('nav-item-active');
  });

  describe('identityStatus indicator', () => {
    it('shows success styling for active status', () => {
      const { container } = render(<Sidebar {...defaultProps} identityStatus="active" />);
      expect(screen.getByText('active')).toBeInTheDocument();
      const dot = container.querySelector('.bg-success-400');
      expect(dot).toBeInTheDocument();
    });

    it('shows danger styling for frozen status', () => {
      const { container } = render(<Sidebar {...defaultProps} identityStatus="frozen" />);
      expect(screen.getByText('frozen')).toBeInTheDocument();
      const dot = container.querySelector('.bg-danger-400');
      expect(dot).toBeInTheDocument();
    });

    it('shows strong danger styling for deactivated status', () => {
      const { container } = render(<Sidebar {...defaultProps} identityStatus="deactivated" />);
      expect(screen.getByText('deactivated')).toBeInTheDocument();
      const dot = container.querySelector('.bg-danger-600');
      expect(dot).toBeInTheDocument();
    });

    it('shows warning styling for other statuses', () => {
      const { container } = render(<Sidebar {...defaultProps} identityStatus="pending" />);
      expect(screen.getByText('pending')).toBeInTheDocument();
      const dot = container.querySelector('.bg-warning-400');
      expect(dot).toBeInTheDocument();
    });
  });
});