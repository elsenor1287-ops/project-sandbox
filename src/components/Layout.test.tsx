import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header, Sidebar } from './Layout';

describe('Layout Components', () => {
  describe('Header', () => {
    it('renders user information and cycle status', () => {
      render(<Header />);
      expect(screen.getByText('Welcome back, Citizen')).toBeInTheDocument();
      expect(screen.getByText('CITIZEN-2024-01337')).toBeInTheDocument();
      expect(screen.getByText('Monthly Cycle Active')).toBeInTheDocument();
      expect(screen.getByText('Feb 1 - Feb 28, 2024')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });
  });

  describe('Sidebar', () => {
    it('renders navigation items and active state', () => {
      const onNavigate = vi.fn();
      render(<Sidebar currentPage="/dashboard" onNavigate={onNavigate} identityStatus="active" />);

      expect(screen.getByText('Sandbox')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Identity Wallet')).toBeInTheDocument();
      expect(screen.getByText('RCV Sandbox')).toBeInTheDocument();
      expect(screen.getByText('Proposal Compiler')).toBeInTheDocument();

      // Test active class on Dashboard
      const dashboardBtn = screen.getByText('Dashboard').closest('button');
      expect(dashboardBtn).toHaveClass('nav-item-active');

      // Test inactive class on Identity Wallet
      const identityBtn = screen.getByText('Identity Wallet').closest('button');
      expect(identityBtn).toHaveClass('nav-item');
    });

    it('triggers onNavigate when clicking navigation items', () => {
      const onNavigate = vi.fn();
      render(<Sidebar currentPage="/dashboard" onNavigate={onNavigate} identityStatus="active" />);

      fireEvent.click(screen.getByText('Identity Wallet'));
      expect(onNavigate).toHaveBeenCalledWith('/identity');
    });

    it('renders identity status correctly', () => {
      const onNavigate = vi.fn();
      render(<Sidebar currentPage="/dashboard" onNavigate={onNavigate} identityStatus="active" />);

      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('renders different identity status colors', () => {
      const { container } = render(<Sidebar currentPage="/dashboard" onNavigate={vi.fn()} identityStatus="frozen" />);
      expect(screen.getByText('frozen')).toBeInTheDocument();
      expect(container.querySelector('.bg-danger-400')).toBeInTheDocument();
    });
  });
});
