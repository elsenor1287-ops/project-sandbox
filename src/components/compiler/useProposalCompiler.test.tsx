import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProposalCompiler } from './useProposalCompiler';
import type { Proposal } from '../../types';

describe('useProposalCompiler', () => {
  const mockOnSubmitProposal = vi.fn();
  const mockOnCheckViolations = vi.fn();

  const defaultProps = {
    onSubmitProposal: mockOnSubmitProposal,
    onCheckViolations: mockOnCheckViolations,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useProposalCompiler(defaultProps));

    expect(result.current.title).toBe('');
    expect(result.current.content).toBe('');
    expect(result.current.selectedTier).toBe('law2_sandbox');
    expect(result.current.isCompiling).toBe(false);
    expect(result.current.compileResult).toBeNull();
  });

  it('should update state values correctly', () => {
    const { result } = renderHook(() => useProposalCompiler(defaultProps));

    act(() => {
      result.current.setTitle('New Title');
      result.current.setContent('New Content');
      result.current.setSelectedTier('law1_shield');
    });

    expect(result.current.title).toBe('New Title');
    expect(result.current.content).toBe('New Content');
    expect(result.current.selectedTier).toBe('law1_shield');
  });

  it('should handle compilation with violations', async () => {
    mockOnCheckViolations.mockReturnValue(['Violation 1', 'Violation 2']);

    const { result } = renderHook(() => useProposalCompiler(defaultProps));

    act(() => {
      result.current.setContent('Content with violations');
    });

    await act(async () => {
      await result.current.handleCompile();
    });

    expect(mockOnCheckViolations).toHaveBeenCalledWith('Content with violations');
    expect(mockOnSubmitProposal).not.toHaveBeenCalled();
    expect(result.current.isCompiling).toBe(false);
    expect(result.current.compileResult).toEqual({
      success: false,
      violations: ['Violation 1', 'Violation 2'],
    });
  });

  it('should handle successful compilation', async () => {
    mockOnCheckViolations.mockReturnValue([]);
    const mockProposal = {
      id: 'prop-1',
      title: 'Valid Proposal',
      content: 'Valid content',
      tier: 'law2_sandbox',
      submittedBy: 'CITIZEN-2024-01337',
      submittedAt: Date.now(),
      status: 'pending' as const,
      upvotes: 0,
      downvotes: 0
    } as Proposal;
    mockOnSubmitProposal.mockReturnValue(mockProposal);

    const { result } = renderHook(() => useProposalCompiler(defaultProps));

    act(() => {
      result.current.setTitle('Valid Proposal');
      result.current.setContent('Valid content');
    });

    await act(async () => {
      await result.current.handleCompile();
    });

    expect(mockOnCheckViolations).toHaveBeenCalledWith('Valid content');
    expect(mockOnSubmitProposal).toHaveBeenCalledWith({
      title: 'Valid Proposal',
      content: 'Valid content',
      tier: 'law2_sandbox',
      submittedBy: 'CITIZEN-2024-01337',
    });

    expect(result.current.isCompiling).toBe(false);
    expect(result.current.compileResult).toEqual({
      success: true,
      violations: [],
      proposal: mockProposal,
    });

    // Should reset title and content on success
    expect(result.current.title).toBe('');
    expect(result.current.content).toBe('');
  });
});
