import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../src/App.js';

describe('App Root Component', () => {
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
});
