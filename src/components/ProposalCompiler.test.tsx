import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompilerPage } from './ProposalCompiler';
import { vi, describe, it, expect } from 'vitest';

describe('CompilerPage', () => {
  it('renders correctly and handles submission', async () => {
    const onSubmitProposal = vi.fn().mockImplementation((prop) => ({ ...prop, id: '123' }));
    const onCheckViolations = vi.fn().mockReturnValue([]);

    render(
      <CompilerPage
        {...defaultProps}
        proposals={[]}
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

    // Fast-forward timers by 1500ms
    await waitFor(() => {
      expect(screen.queryByText(/Compiling Proposal\.\.\./i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(onCheckViolations).toHaveBeenCalledWith('New content');
      expect(onSubmitProposal).toHaveBeenCalledWith({
        title: 'New Proposal',
        content: 'New content',
        tier: 'law2_sandbox', // default tier
        submittedBy: 'CITIZEN-2024-01337',
      });
      expect(screen.getByText('Compilation Successful')).toBeInTheDocument();
      expect(screen.getByText('new-p1')).toBeInTheDocument(); // Proposal ID
    });
  });

  it('fails compilation and shows violations when violations exist', async () => {
    const onSubmitProposal = vi.fn();
    const onCheckViolations = vi.fn().mockReturnValue(['Violation: "ban speech"']);

    render(
      <CompilerPage
        {...defaultProps}
    fireEvent.change(titleInput, { target: { value: 'Test Proposal' } });

    const contentInput = screen.getByPlaceholderText(/Enter your proposal content here/);
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });

    const submitBtn = screen.getByText('Compile & Submit');
    fireEvent.click(submitBtn);

    expect(screen.getByText('Compiling Proposal...')).toBeInTheDocument();

    await waitFor(() => {
      expect(onSubmitProposal).toHaveBeenCalledWith({
        title: 'Test Proposal',
        content: 'Test Content',
        tier: 'law2_sandbox',
        submittedBy: 'CITIZEN-2024-01337',
      });
    }, { timeout: 2000 });

    expect(screen.getByText('Compilation Successful')).toBeInTheDocument();
  });

  it('displays violations and does not submit if check fails', async () => {
    const onSubmitProposal = vi.fn();
    const onCheckViolations = vi.fn().mockReturnValue(['First Amendment Shield: "ban speech" detected']);

    render(
      <CompilerPage
        proposals={[]}
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
      expect(screen.getByText('Violation: "ban speech"')).toBeInTheDocument();
    });
  });

  it('can change governance tier', async () => {
    const onSubmitProposal = vi.fn().mockReturnValue({
      id: 'new-p2',
      title: 'Law 1 Proposal',
      content: 'Law 1 content',
      tier: 'law1_shield',
      status: 'vetoed'
    });
    fireEvent.change(titleInput, { target: { value: 'Violating Proposal' } });

    const contentInput = screen.getByPlaceholderText(/Enter your proposal content here/);
    fireEvent.change(contentInput, { target: { value: 'We will ban speech' } });

    const submitBtn = screen.getByText('Compile & Submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Compilation Failed')).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText('First Amendment Shield: "ban speech" detected')).toBeInTheDocument();
    expect(onSubmitProposal).not.toHaveBeenCalled();
  });

  it('updates selected tier correctly', async () => {
    const onSubmitProposal = vi.fn().mockImplementation((prop) => ({ ...prop, id: '123' }));
    const onCheckViolations = vi.fn().mockReturnValue([]);

    render(
      <CompilerPage
        {...defaultProps}
        proposals={[]}
        onSubmitProposal={onSubmitProposal}
        onCheckViolations={onCheckViolations}
      />
    );

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
    // Default tier is law2_sandbox
    // The button has a child <p> text 'Law 1' and text from icon or something, so let's select by text exact matching Law 1
    const law1Btn = screen.getByText('Law 1').closest('button');
    fireEvent.click(law1Btn as HTMLButtonElement);

    const titleInput = screen.getByPlaceholderText('Enter proposal title...');
    fireEvent.change(titleInput, { target: { value: 'Law 1 Proposal' } });

    const contentInput = screen.getByPlaceholderText(/Enter your proposal content here/);
    fireEvent.change(contentInput, { target: { value: 'Law 1 Content' } });

    const submitBtn = screen.getByText('Compile & Submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmitProposal).toHaveBeenCalledWith(expect.objectContaining({
        tier: 'law1_shield',
      }));
    }, { timeout: 2000 });
  });

  it('disables submit button when inputs are empty', () => {
    render(
      <CompilerPage
        proposals={[]}
        onSubmitProposal={vi.fn()}
        onCheckViolations={vi.fn()}
      />
    );

    const submitBtn = screen.getByText('Compile & Submit');
    expect(submitBtn).toBeDisabled();
  });

  it('renders proposal history correctly', () => {
    const proposals: any = [
      { id: '1', title: 'Prop 1', content: 'Content 1', tier: 'law2_sandbox', submittedBy: 'user', submittedAt: new Date(), status: 'compiled' as const },
      { id: '2', title: 'Prop 2', content: 'Content 2', tier: 'law1_shield', submittedBy: 'user', submittedAt: new Date(), status: 'vetoed' as const, vetoReason: 'Violation' },
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
