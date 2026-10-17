import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

describe('Dashboard', () => {
  it('summarises the inventory', () => {
    renderApp('/');
    expect(screen.getByText(/15 assets on record/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeInTheDocument();
  });

  it('links each status to a filtered list', async () => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('link', { name: /Under repair\s*2/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
    expect(screen.getByText('Showing 2 of 15 assets')).toBeInTheDocument();
  });

  it('handles an empty inventory', () => {
    renderApp('/', []);
    expect(screen.getByText(/0 assets on record/)).toBeInTheDocument();
  });
});
