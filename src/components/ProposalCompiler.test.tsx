import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompilerPage } from './ProposalCompiler';
import type { Proposal } from '../types';

describe('CompilerPage', () => {
  const defaultProps = {
    proposals: [
      {
        id: 'p1',
        title: 'Existing Proposal',
        content: 'This is an existing proposal content.',
        tier: 'law2_sandbox' as const,
        submittedBy: 'CITIZEN-123',
        submittedAt: new Date(),
        status: 'compiled' as const,
      } as Proposal,
    ],
    onSubmitProposal: vi.fn(),
    onCheckViolations: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and shows existing proposals', () => {
    render(<CompilerPage {...defaultProps} />);

    expect(screen.getByText('Proposal Compiler Workspace')).toBeInTheDocument();
    expect(screen.getByText('Proposal History')).toBeInTheDocument();
    expect(screen.getByText('Existing Proposal')).toBeInTheDocument();
  });

  it('submits a proposal successfully when there are no violations', async () => {
    const onSubmitProposal = vi.fn().mockReturnValue({
      id: 'new-p1',
      title: 'New Proposal',
      content: 'New content',
      tier: 'law2_sandbox',
      status: 'ballot_ready',
    });
    const onCheckViolations = vi.fn().mockReturnValue([]);

    render(
      <CompilerPage
        {...defaultProps}
        onSubmitProposal={onSubmitProposal}
        onCheckViolations={onCheckViolations}
      />
    );

    const titleInput = screen.getByPlaceholderText('Enter proposal title...');
    const contentInput = screen.getByPlaceholderText(/Enter your proposal content here/);
    const submitBtn = screen.getByRole('button', { name: /Compile & Submit/i });

    fireEvent.change(titleInput, { target: { value: 'New Proposal' } });
    fireEvent.change(contentInput, { target: { value: 'New content' } });

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Compiling Proposal\.\.\./i)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText(/Compiling Proposal\.\.\./i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(onCheckViolations).toHaveBeenCalledWith('New content');
      expect(onSubmitProposal).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Proposal',
        content: 'New content',
        tier: 'law2_sandbox',
        submittedBy: 'CITIZEN-2024-01337',
      }));
      expect(screen.getByText('Compilation Successful')).toBeInTheDocument();
      expect(screen.getByText('new-p1')).toBeInTheDocument();
    });
  });

  it('fails compilation and shows violations when violations exist', async () => {
    const onSubmitProposal = vi.fn();
    const onCheckViolations = vi.fn().mockReturnValue(['Violation: "ban speech"']);

    render(
      <CompilerPage
        {...defaultProps}
        onSubmitProposal={onSubmitProposal}
        onCheckViolations={onCheckViolations}
      />
    );

    const titleInput = screen.getByPlaceholderText('Enter proposal title...');
    const contentInput = screen.getByPlaceholderText(/Enter your proposal content here/);
    const submitBtn = screen.getByRole('button', { name: /Compile & Submit/i });

    fireEvent.change(titleInput, { target: { value: 'Bad Proposal' } });
    fireEvent.change(contentInput, { target: { value: 'We should ban speech.' } });

    fireEvent.click(submitBtn);

    await waitFor(
      () => {
        expect(screen.queryByText(/Compiling Proposal\.\.\./i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(onCheckViolations).toHaveBeenCalledWith('We should ban speech.');
      expect(onSubmitProposal).not.toHaveBeenCalled();

      expect(screen.getByText('Compilation Failed')).toBeInTheDocument();
      expect(screen.getByText('Violation: "ban speech"')).toBeInTheDocument();
    });
  });

  it('can change governance tier', async () => {
    const onSubmitProposal = vi.fn().mockReturnValue({
      id: 'new-p2',
      title: 'Law 1 Proposal',
      content: 'Law 1 content',
      tier: 'law1_shield',
      status: 'vetoed',
    });
    const onCheckViolations = vi.fn().mockReturnValue([]);

    render(
      <CompilerPage
        {...defaultProps}
        onSubmitProposal={onSubmitProposal}
        onCheckViolations={onCheckViolations}
      />
    );

    // Click Law 1 Shield button
    const law1Btn = screen.getByText('Law 1').closest('button');
    expect(law1Btn).toBeInTheDocument();
    if (law1Btn) {
      fireEvent.click(law1Btn);
    }

    const titleInput = screen.getByPlaceholderText('Enter proposal title...');
    const contentInput = screen.getByPlaceholderText(/Enter your proposal content here/);
    const submitBtn = screen.getByRole('button', { name: /Compile & Submit/i });

    fireEvent.change(titleInput, { target: { value: 'Law 1 Proposal' } });
    fireEvent.change(contentInput, { target: { value: 'Law 1 content' } });

    fireEvent.click(submitBtn);

    await waitFor(
      () => {
        expect(screen.queryByText(/Compiling Proposal\.\.\./i)).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(() => {
      expect(onSubmitProposal).toHaveBeenCalledWith(
        expect.objectContaining({
          tier: 'law1_shield',
        })
      );
    });
  });

  it('disables submit button when inputs are empty', () => {
    render(<CompilerPage {...defaultProps} />);

    const submitBtn = screen.getByRole('button', { name: /Compile & Submit/i });
    expect(submitBtn).toBeDisabled();

    const titleInput = screen.getByPlaceholderText('Enter proposal title...');
    const contentInput = screen.getByPlaceholderText(/Enter your proposal content here/);

    fireEvent.change(titleInput, { target: { value: 'A' } });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(contentInput, { target: { value: 'B' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('renders proposal history correctly', () => {
    const proposals: Proposal[] = [
      {
        id: '1',
        title: 'Prop 1',
        content: 'Content 1',
        tier: 'law2_sandbox',
        submittedBy: 'user',
        submittedAt: new Date(),
        status: 'compiled' as const,
      },
      {
        id: '2',
        title: 'Prop 2',
        content: 'Content 2',
        tier: 'law1_shield',
        submittedBy: 'user',
        submittedAt: new Date(),
        status: 'vetoed' as const,
        vetoReason: 'Violation',
      },
    ];

    render(<CompilerPage {...defaultProps} proposals={proposals} />);

    expect(screen.getByText('Proposal History')).toBeInTheDocument();
    expect(screen.getByText('Prop 1')).toBeInTheDocument();
    expect(screen.getByText('Compiled')).toBeInTheDocument();

    expect(screen.getByText('Prop 2')).toBeInTheDocument();
    expect(screen.getByText('Vetoed')).toBeInTheDocument();
    expect(screen.getByText('Violation')).toBeInTheDocument();
  });

  it('changes active rule tabs correctly', () => {
    render(<CompilerPage {...defaultProps} />);

    const law1Btn = screen.getByText('Law 1 Rules');
    const law2Btn = screen.getByText('Law 2 Rules');
    const law3Btn = screen.getByText('Law 3 Rules');

    expect(law1Btn).toBeInTheDocument();
    expect(law2Btn).toBeInTheDocument();
    expect(law3Btn).toBeInTheDocument();

    fireEvent.click(law2Btn);
    expect(law2Btn).toHaveClass('bg-success-500/20');

    fireEvent.click(law3Btn);
    expect(law3Btn).toHaveClass('bg-accent-500/20');
  });
});
