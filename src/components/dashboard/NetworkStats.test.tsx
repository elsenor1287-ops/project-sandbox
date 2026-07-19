import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NetworkStats } from './NetworkStats';

describe('NetworkStats', () => {
  it('renders all network statistics correctly', () => {
    render(<NetworkStats />);

    expect(screen.getByText('Network Status')).toBeInTheDocument();

    expect(screen.getByText('Active Validators')).toBeInTheDocument();
    expect(screen.getByText('128/128')).toBeInTheDocument();

    expect(screen.getByText('Avg Block Time')).toBeInTheDocument();
    expect(screen.getByText('2.4s')).toBeInTheDocument();

    expect(screen.getByText('TPS')).toBeInTheDocument();
    expect(screen.getByText('12,847')).toBeInTheDocument();

    expect(screen.getByText('Fees Today')).toBeInTheDocument();
    expect(screen.getByText('$0.00012 avg')).toBeInTheDocument();

    expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
  });
});
