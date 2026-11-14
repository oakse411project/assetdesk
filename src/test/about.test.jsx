import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';
import team from '../data/team.js';

describe('About page', () => {
  it('lists every team member with their student id', () => {
    renderApp('/about');
    expect(team).toHaveLength(4);
    for (const member of team) {
      expect(screen.getByText(member.name)).toBeInTheDocument();
      expect(screen.getByText(member.studentId)).toBeInTheDocument();
    }
  });
});
