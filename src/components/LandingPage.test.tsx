import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initial state correctly', () => {
    const onEnterDashboard = vi.fn();
    render(<LandingPage onEnterDashboard={onEnterDashboard} />);

    expect(screen.getByText('Civic Authentication Portal')).toBeInTheDocument();
    expect(screen.getByText('Verify Sovereign Identity (ZK-Shielded)')).toBeInTheDocument();
  });

  it('completes verification flow', async () => {
    const onEnterDashboard = vi.fn();
    render(<LandingPage onEnterDashboard={onEnterDashboard} />);

    // Click to start verification
    act(() => { fireEvent.click(screen.getByText('Verify Sovereign Identity (ZK-Shielded)')); });

    // Step 1: 1.5s
    act(() => { vi.advanceTimersByTime(1500); });

    // Step 2: 3.0s (another 1.5s)
    act(() => { vi.advanceTimersByTime(1500); });

    // Step 3: 4.5s (another 1.5s)
    act(() => { vi.advanceTimersByTime(1500); });

    // Card fades out 5.2s, welcome fades in 5.7s
    act(() => { vi.advanceTimersByTime(1200); });

    // After timers, the welcome panel should be visible
    vi.useRealTimers();
    await waitFor(() => {
      expect(screen.getByText('Welcome to the Sandbox.')).toBeInTheDocument();
      expect(screen.getByText('Identity Verified.')).toBeInTheDocument();
    });

    // Verify callback works
    act(() => { fireEvent.click(screen.getByText('Enter Voting Dashboard')); });
    expect(onEnterDashboard).toHaveBeenCalled();
  });
});
