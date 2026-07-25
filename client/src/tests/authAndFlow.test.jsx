import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthModal from '../components/AuthModal';

describe('Altruist AI AuthModal Component', () => {
  it('should render AuthModal with Sign In tab and visible evaluator demo credentials', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={() => {}} />);

    expect(screen.getByText(/Altruist AI Authentication/i)).toBeDefined();
    expect(screen.getByText(/demo@altruist.ai/i)).toBeDefined();
    expect(screen.getByText(/DemoAltruist123!/i)).toBeDefined();
  });

  it('should trigger 1-Click Demo Login on button click', () => {
    const handleSuccess = vi.fn();
    render(<AuthModal isOpen={true} onClose={() => {}} onAuthSuccess={handleSuccess} />);

    const demoBtn = screen.getByText(/1-Click Demo Login/i);
    expect(demoBtn).toBeDefined();
    fireEvent.click(demoBtn);
  });
});
