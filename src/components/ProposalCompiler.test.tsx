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
      status: 'ballot_ready'
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

    // Ensure button is enabled
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    // It should show compiling state
    expect(screen.getByText(/Compiling Proposal\.\.\./i)).toBeInTheDocument();

    // The delay is 1500ms, use waitFor with longer timeout
    await waitFor(() => {
      expect(screen.queryByText(/Compiling Proposal\.\.\./i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(onCheckViolations).toHaveBeenCalledWith('New content');
      expect(onSubmitProposal).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Proposal',
        content: 'New content',
        tier: 'law2_sandbox', // default tier
      }));
      expect(screen.getByText('Compilation Successful')).toBeInTheDocument();
      expect(screen.getByText('new-p1')).toBeInTheDocument(); // Proposal ID
    });
  });

  it('fails compilation and shows violations when violations exist', async () => {
    const onSubmitProposal = vi.fn();
    const onCheckViolations = vi.fn().mockReturnValue(['First Amendment Shield: "ban speech" detected']);

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

    await waitFor(() => {
      expect(screen.queryByText(/Compiling Proposal\.\.\./i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(onCheckViolations).toHaveBeenCalledWith('We should ban speech.');
      expect(onSubmitProposal).not.toHaveBeenCalled();

      expect(screen.getByText('Compilation Failed')).toBeInTheDocument();
      expect(screen.getByText('First Amendment Shield: "ban speech" detected')).toBeInTheDocument();
    });
  });

  it('can change governance tier', async () => {
    const onSubmitProposal = vi.fn().mockReturnValue({
      id: 'new-p2',
      title: 'Law 1 Proposal',
      content: 'Law 1 content',
      tier: 'law1_shield',
      status: 'ballot_ready'
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

    await waitFor(() => {
      expect(screen.queryByText(/Compiling Proposal\.\.\./i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

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
      { id: '1', title: 'Prop 1', content: 'Content 1', tier: 'law2_sandbox', submittedBy: 'user', submittedAt: new Date(), status: 'compiled' },
      { id: '2', title: 'Prop 2', content: 'Content 2', tier: 'law1_shield', submittedBy: 'user', submittedAt: new Date(), status: 'vetoed', vetoReason: 'Violation' },
    ];

    render(
      <CompilerPage
        proposals={proposals}
        onSubmitProposal={vi.fn()}
        onCheckViolations={vi.fn()}
      />
    );

    expect(screen.getByText('Proposal History')).toBeInTheDocument();
    expect(screen.getByText('Prop 1')).toBeInTheDocument();
    expect(screen.getByText('Compiled')).toBeInTheDocument();

    expect(screen.getByText('Prop 2')).toBeInTheDocument();
    expect(screen.getByText('Vetoed')).toBeInTheDocument();
    expect(screen.getByText('Violation')).toBeInTheDocument();
  });
});
