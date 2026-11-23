import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../src/App.js';

describe('App Root Component & Navigation', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });
  it('renders LabLink brand and tagline', () => {
    render(<App />);
    expect(screen.getByText('LabLink')).toBeDefined();
    expect(screen.getByText('Shared labs, fairly allocated.')).toBeDefined();
  });

  it('renders demo role switcher with student, faculty, admin', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /student/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /faculty/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /admin/i })).toBeDefined();
  });

  it('renders 60-second evaluator CTA for the conflict demo', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /run the conflict demo/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /discover equipment/i })).toBeDefined();
  });

  it('renders all core navigation landmarks', () => {
    render(<App />);
    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('My Lab Workspace')).toBeDefined();
    expect(screen.getByText('Equipment Catalog')).toBeDefined();
    expect(screen.getByText('Conflict Center')).toBeDefined();
    expect(screen.getByText('Faculty Queue')).toBeDefined();
  });
});
