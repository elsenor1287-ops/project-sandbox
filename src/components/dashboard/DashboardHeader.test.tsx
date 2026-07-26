import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DashboardHeader } from './DashboardHeader';

const EXPECTED_TEXTS = [
  'Governance Dashboard',
  'Real-time overview of Project Sandbox',
  'Current Cycle'
];

describe('DashboardHeader Component', () => {
  it('should render correctly with a given cycle name', () => {
    const cycleName = 'Test Cycle 123';
    const { getByText } = render(<DashboardHeader currentCycleName={cycleName} />);

    [
      ...EXPECTED_TEXTS,
      cycleName
    ].forEach(text => {
      expect(getByText(text)).toBeInTheDocument();
    });
  });

  it('should render correctly with an empty cycle name', () => {
    const cycleName = '';
    const { container, getByText } = render(<DashboardHeader currentCycleName={cycleName} />);

    EXPECTED_TEXTS.forEach(text => {
      expect(getByText(text)).toBeInTheDocument();
    });

    const cycleNameElements = container.querySelectorAll('p.text-xs.text-primary-500');
    expect(cycleNameElements.length).toBe(1);
    expect(cycleNameElements[0].textContent).toBe('');
  });

  it('should render the Clock icon', () => {
    const { container } = render(<DashboardHeader currentCycleName="Any" />);
    const CLOCK_CLASS = 'lucide-clock';

    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(1);
    expect(svgs[0]).toHaveClass(CLOCK_CLASS);
  });
});
