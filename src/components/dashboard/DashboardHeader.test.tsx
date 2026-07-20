import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DashboardHeader } from './DashboardHeader';

describe('DashboardHeader Component', () => {
  it('should render correctly with a given cycle name', () => {
    const cycleName = 'Test Cycle 123';
    const { getByText } = render(<DashboardHeader currentCycleName={cycleName} />);

    expect(getByText('Governance Dashboard')).toBeInTheDocument();
    expect(getByText('Real-time overview of Project Sandbox')).toBeInTheDocument();
    expect(getByText('Current Cycle')).toBeInTheDocument();
    expect(getByText(cycleName)).toBeInTheDocument();
  });

  it('should render correctly with an empty cycle name', () => {
    const cycleName = '';
    const { container, getByText } = render(<DashboardHeader currentCycleName={cycleName} />);

    expect(getByText('Governance Dashboard')).toBeInTheDocument();
    expect(getByText('Real-time overview of Project Sandbox')).toBeInTheDocument();
    expect(getByText('Current Cycle')).toBeInTheDocument();

    const cycleNameElements = container.querySelectorAll('p.text-xs.text-primary-500');
    expect(cycleNameElements.length).toBe(1);
    expect(cycleNameElements[0].textContent).toBe('');
  });

  it('should render the Clock icon', () => {
    const { container } = render(<DashboardHeader currentCycleName="Any" />);

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(1);
    expect(svgs[0]).toHaveClass('lucide-clock');
  });
});
