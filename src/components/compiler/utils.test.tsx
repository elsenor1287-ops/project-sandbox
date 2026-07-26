import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { highlightViolations } from './utils';

describe('highlightViolations', () => {
  it('returns text as is when there are no violations', () => {
    const { container } = render(highlightViolations('Hello world', []));
    expect(container.textContent).toBe('Hello world');
    expect(container.querySelectorAll('span')).toHaveLength(0);
  });

  it('returns text as is when violations do not contain quoted keywords', () => {
    const { container } = render(highlightViolations('Hello world', ['invalid format']));
    expect(container.textContent).toBe('Hello world');
    expect(container.querySelectorAll('span')).toHaveLength(0);
  });

  it('highlights the matched keyword', () => {
    const { container } = render(highlightViolations('This is a restricted keyword.', ['Violation: "restricted" found']));
    expect(container.textContent).toBe('This is a restricted keyword.');

    const highlightSpan = container.querySelector('span.bg-danger-500\\/30');
    expect(highlightSpan).toBeInTheDocument();
    expect(highlightSpan?.textContent).toBe('restricted');
  });

  it('highlights keywords case-insensitively', () => {
    const { container } = render(highlightViolations('Using RESTRICTED word.', ['Violation: "restricted" found']));
    const highlightSpan = container.querySelector('span.bg-danger-500\\/30');
    expect(highlightSpan).toBeInTheDocument();
    expect(highlightSpan?.textContent).toBe('RESTRICTED');
  });

  it('highlights multiple occurrences and different keywords', () => {
    const { container } = render(
      highlightViolations('First bad and second BAD.', ['Violation: "bad" found', 'Violation: "second" found'])
    );
    const highlights = container.querySelectorAll('span.bg-danger-500\\/30');
    expect(highlights).toHaveLength(3);
    expect(highlights[0].textContent).toBe('bad');
    expect(highlights[1].textContent).toBe('second');
    expect(highlights[2].textContent).toBe('BAD');
  });

  it('handles empty text correctly', () => {
    const { container } = render(highlightViolations('', ['Violation: "bad" found']));
    expect(container.textContent).toBe('');
  });
});
