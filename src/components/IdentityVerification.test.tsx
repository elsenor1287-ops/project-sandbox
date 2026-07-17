import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IdentityPage } from './IdentityVerification';
import type { IdentityState } from '../types';

const defaultIdentity: IdentityState = {
  citizenId: 'CITIZEN-1234',
  status: 'pending',
  verificationStep: 'passport',
  passportVerified: false,
  utilityVerified: false,
  vouchTokens: [],
  fraudStrikes: 0,
  isVouchingFor: [],
  createdAt: new Date('2023-01-01'),
};

describe('IdentityVerification', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly with pending status', () => {
    render(
      <IdentityPage
        identity={defaultIdentity}
        onCompleteStep={vi.fn()}
        onTriggerFraud={vi.fn()}
        onFreezeAccount={vi.fn()}
        onResetIdentity={vi.fn()}
      />
    );
    expect(screen.getByText('CITIZEN-1234')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('toggles fraud panel when button is clicked', () => {
    render(
      <IdentityPage
        identity={defaultIdentity}
        onCompleteStep={vi.fn()}
        onTriggerFraud={vi.fn()}
        onFreezeAccount={vi.fn()}
        onResetIdentity={vi.fn()}
      />
    );

    expect(screen.queryByText('Three-Strike Deactivation Pipeline')).not.toBeInTheDocument();

    act(() => { fireEvent.click(screen.getByText('Fraud Testing Suite')); });

    expect(screen.getByText('Three-Strike Deactivation Pipeline')).toBeInTheDocument();
  });

  it('calls callback functions from the fraud panel', () => {
    const onTriggerFraud = vi.fn();
    const onFreezeAccount = vi.fn();
    const onResetIdentity = vi.fn();

    render(
      <IdentityPage
        identity={defaultIdentity}
        onCompleteStep={vi.fn()}
        onTriggerFraud={onTriggerFraud}
        onFreezeAccount={onFreezeAccount}
        onResetIdentity={onResetIdentity}
      />
    );

    act(() => { fireEvent.click(screen.getByText('Fraud Testing Suite')); });

    act(() => { fireEvent.click(screen.getByText('Trigger Strike')); });
    expect(onTriggerFraud).toHaveBeenCalledWith('Biometric mismatch detected');

    act(() => { fireEvent.click(screen.getByText('Instant Freeze')); });
    expect(onFreezeAccount).toHaveBeenCalledWith('Immediate freeze - multiple fraud indicators');

    act(() => { fireEvent.click(screen.getByText('Reset Identity')); });
    expect(onResetIdentity).toHaveBeenCalled();
  });

  it('simulates the verification scanning process', async () => {
    const onCompleteStep = vi.fn();

    render(
      <IdentityPage
        identity={defaultIdentity}
        onCompleteStep={onCompleteStep}
        onTriggerFraud={vi.fn()}
        onFreezeAccount={vi.fn()}
        onResetIdentity={vi.fn()}
      />
    );

    // Passport verification is the current step (Verify Now button)
    const verifyButton = screen.getByRole('button', { name: /Verify Now/i });
    expect(verifyButton).toBeInTheDocument();

    act(() => { fireEvent.click(verifyButton); });
    expect(screen.getByRole('button', { name: /Scanning.../i })).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(2000); });

    vi.useRealTimers();
    await waitFor(() => {
      expect(onCompleteStep).toHaveBeenCalledWith('passport');
    });
  });

  it('displays vouch tokens correctly', () => {
    const identityWithTokens: IdentityState = {
      ...defaultIdentity,
      vouchTokens: [
        {
          id: 'token1',
          neighborName: 'Alice Neighbor',
          neighborAddress: '0x123...',
          signedAt: new Date('2023-01-02'),
          isValid: true
        }
      ]
    };

    render(
      <IdentityPage
        identity={identityWithTokens}
        onCompleteStep={vi.fn()}
        onTriggerFraud={vi.fn()}
        onFreezeAccount={vi.fn()}
        onResetIdentity={vi.fn()}
      />
    );

    expect(screen.getByText('Alice Neighbor')).toBeInTheDocument();
    expect(screen.getByText('0x123...')).toBeInTheDocument();
  });

  it('renders frozen state appropriately', () => {
    const frozenIdentity: IdentityState = {
      ...defaultIdentity,
      status: 'frozen',
      frozenReason: 'Test freeze reason',
      frozenAt: new Date('2023-01-03')
    };

    render(
      <IdentityPage
        identity={frozenIdentity}
        onCompleteStep={vi.fn()}
        onTriggerFraud={vi.fn()}
        onFreezeAccount={vi.fn()}
        onResetIdentity={vi.fn()}
      />
    );

    expect(screen.getByText('Frozen')).toBeInTheDocument();

    act(() => { fireEvent.click(screen.getByText('Fraud Testing Suite')); });

    expect(screen.getByText(/Test freeze reason/)).toBeInTheDocument();
  });
});
