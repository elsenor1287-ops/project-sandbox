import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdentityPage } from '../IdentityVerification';
import type { IdentityState } from '../../types';

describe('IdentityPage', () => {
  const mockIdentity: IdentityState = {
    citizenId: 'CITIZEN-123',
    status: 'pending',
    verificationStep: 'passport',
    passportVerified: false,
    utilityVerified: false,
    vouchTokens: [],
    fraudStrikes: 0,
    isVouchingFor: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockProps = {
    identity: mockIdentity,
    onCompleteStep: vi.fn(),
    onTriggerFraud: vi.fn(),
    onFreezeAccount: vi.fn(),
    onResetIdentity: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with pending status', () => {
    render(<IdentityPage {...mockProps} />);
    expect(screen.getByText('CITIZEN-123')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders correctly with active status', () => {
    render(<IdentityPage {...mockProps} identity={{ ...mockIdentity, status: 'active' }} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders correctly with frozen status', () => {
    render(<IdentityPage {...mockProps} identity={{ ...mockIdentity, status: 'frozen' }} />);
    expect(screen.getByText('Frozen')).toBeInTheDocument();
  });

  it('renders correctly with deactivated status', () => {
    render(<IdentityPage {...mockProps} identity={{ ...mockIdentity, status: 'deactivated' }} />);
    expect(screen.getByText('Deactivated')).toBeInTheDocument();
  });

  it('handles "Verify Now" correctly', async () => {
    vi.useFakeTimers();
    render(<IdentityPage {...mockProps} />);

    const verifyBtn = screen.getByText('Verify Now');
    expect(verifyBtn).toBeInTheDocument();

    fireEvent.click(verifyBtn);
    expect(screen.getByText('Scanning...')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockProps.onCompleteStep).toHaveBeenCalledWith('passport');
    vi.useRealTimers();
  });

  describe('Fraud Testing Suite', () => {
    it('expands panel and calls trigger strike', () => {
      render(<IdentityPage {...mockProps} />);

      const fraudSuiteBtn = screen.getByText('Fraud Testing Suite');
      fireEvent.click(fraudSuiteBtn);

      const triggerBtn = screen.getByText('Trigger Strike');
      fireEvent.click(triggerBtn);
      expect(mockProps.onTriggerFraud).toHaveBeenCalledWith('Biometric mismatch detected');
    });

    it('calls instant freeze', () => {
      render(<IdentityPage {...mockProps} />);

      fireEvent.click(screen.getByText('Fraud Testing Suite'));

      const freezeBtn = screen.getByText('Instant Freeze');
      fireEvent.click(freezeBtn);
      expect(mockProps.onFreezeAccount).toHaveBeenCalledWith('Immediate freeze - multiple fraud indicators');
    });

    it('calls reset identity', () => {
      render(<IdentityPage {...mockProps} />);

      fireEvent.click(screen.getByText('Fraud Testing Suite'));

      const resetBtn = screen.getByText('Reset Identity');
      fireEvent.click(resetBtn);
      expect(mockProps.onResetIdentity).toHaveBeenCalled();
    });

    it('renders frozen reason when panel is expanded and reason exists', () => {
      const frozenDate = new Date('2024-02-01T00:00:00Z');
      render(
        <IdentityPage
          {...mockProps}
          identity={{
            ...mockIdentity,
            status: 'frozen',
            frozenReason: 'Test Freeze Reason',
            frozenAt: frozenDate,
          }}
        />
      );

      fireEvent.click(screen.getByText('Fraud Testing Suite'));

      expect(screen.getByText('Freeze Reason: Test Freeze Reason')).toBeInTheDocument();
      expect(screen.getByText(`Frozen at: ${frozenDate.toLocaleString()}`)).toBeInTheDocument();
    });
  });

  describe('Vouch Tokens', () => {
    it('renders vouch tokens correctly when array is not empty', () => {
      const signedDate = new Date('2024-03-01T00:00:00Z');
      render(
        <IdentityPage
          {...mockProps}
          identity={{
            ...mockIdentity,
            vouchTokens: [
              {
                id: 'token-1',
                neighborName: 'Alice Neighbor',
                neighborAddress: '123 Test St',
                signedAt: signedDate,
                isValid: true,
              },
            ],
          }}
        />
      );

      expect(screen.getByText('Alice Neighbor')).toBeInTheDocument();
      expect(screen.getByText('123 Test St')).toBeInTheDocument();
      expect(screen.getByText(signedDate.toLocaleDateString())).toBeInTheDocument();
    });
  });
});
