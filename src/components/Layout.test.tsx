import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Layout';
import type { PageRoute } from '../types';

describe('Sidebar', () => {
  const defaultProps = {
    currentPage: '/dashboard' as PageRoute,
    onNavigate: vi.fn(),
    identityStatus: 'active',
  };

  it('renders logo and title', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Sandbox')).toBeInTheDocument();
    expect(screen.getByText('Governance Engine')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Identity Wallet')).toBeInTheDocument();
    expect(screen.getByText('RCV Sandbox')).toBeInTheDocument();
    expect(screen.getByText('Proposal Compiler')).toBeInTheDocument();
  });

  it('highlights the active page', () => {
    render(<Sidebar {...defaultProps} currentPage="/vote" />);
    const voteButton = screen.getByText('RCV Sandbox').closest('button');
    expect(voteButton).toHaveClass('nav-item-active');

    const dashboardButton = screen.getByText('Dashboard').closest('button');
    expect(dashboardButton).toHaveClass('nav-item');
    expect(dashboardButton).not.toHaveClass('nav-item-active');
  });

  it('calls onNavigate with correct path when clicked', () => {
    const onNavigate = vi.fn();
    render(<Sidebar {...defaultProps} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByText('Identity Wallet'));
    expect(onNavigate).toHaveBeenCalledWith('/identity');

    fireEvent.click(screen.getByText('Proposal Compiler'));
    expect(onNavigate).toHaveBeenCalledWith('/compiler');
  });

  it('renders the correct identity status', () => {
    render(<Sidebar {...defaultProps} identityStatus="frozen" />);
    expect(screen.getByText('System Status')).toBeInTheDocument();
    expect(screen.getByText('frozen')).toBeInTheDocument();
    expect(screen.getByText('frozen')).toHaveClass('capitalize');
  });
});
