import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

describe('Menu navigation', () => {
  it('shows every menu item', () => {
    renderApp('/');
    const menu = screen.getByRole('navigation', { name: 'Main menu' });
    for (const label of ['Dashboard', 'Assets', 'Add asset', 'About']) {
      expect(within(menu).getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('moves between pages from the menu', async () => {
    const { user } = renderApp('/');
    const menu = screen.getByRole('navigation', { name: 'Main menu' });

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();

    await user.click(within(menu).getByRole('link', { name: 'Assets' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();

    await user.click(within(menu).getByRole('link', { name: 'Add asset' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Add asset' })).toBeInTheDocument();

    await user.click(within(menu).getByRole('link', { name: 'About' }));
    expect(screen.getByRole('heading', { level: 1, name: 'About AssetDesk' })).toBeInTheDocument();
  });

  it('marks the current page in the menu', () => {
    renderApp('/about');
    const menu = screen.getByRole('navigation', { name: 'Main menu' });
    expect(within(menu).getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows a not-found page for unknown addresses', () => {
    renderApp('/nowhere');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });
});
