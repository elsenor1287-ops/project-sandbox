import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardHeader } from './DashboardHeader';

describe('DashboardHeader', () => {
  it('renders correctly with the provided cycle name', () => {
    const cycleName = 'Test Cycle 123';
    render(<DashboardHeader currentCycleName={cycleName} />);

    expect(screen.getByText('Governance Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Real-time overview of Project Sandbox')).toBeInTheDocument();
    expect(screen.getByText('Current Cycle')).toBeInTheDocument();
    expect(screen.getByText(cycleName)).toBeInTheDocument();
  });
});
