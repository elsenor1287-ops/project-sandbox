import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Header } from './Layout';

describe('Header Component', () => {
  it('renders without crashing and contains semantic header tag', () => {
    const { container } = render(<Header />);
    expect(container.querySelector('header')).toBeInTheDocument();
  });

  it('displays user greeting and citizen ID', () => {
    render(<Header />);
    expect(screen.getByText('Welcome back, Citizen')).toBeInTheDocument();
    expect(screen.getByText('CITIZEN-2024-01337')).toBeInTheDocument();
  });

  it('displays cycle status and active date range', () => {
    render(<Header />);
    expect(screen.getByText('Monthly Cycle Active')).toBeInTheDocument();
    expect(screen.getByText('Feb 1 - Feb 28, 2024')).toBeInTheDocument();
  });

  it('displays the user avatar with initial', () => {
    render(<Header />);
    const avatar = screen.getByText('C');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('w-10', 'h-10', 'rounded-full');
  });

  it('applies the correct layout and styling classes to the header element', () => {
    const { container } = render(<Header />);
    const headerElement = container.querySelector('header');
    expect(headerElement).toHaveClass(
      'h-16',
      'flex',
      'items-center',
      'justify-between',
      'px-6'
    );
  });
});
