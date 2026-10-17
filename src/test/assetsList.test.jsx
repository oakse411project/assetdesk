import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

const rows = () => screen.getAllByRole('row').slice(1); // skip header row

describe('Assets list: display and search', () => {
  it('displays all assets', () => {
    renderApp('/assets');
    expect(rows()).toHaveLength(15);
    expect(screen.getByText('Showing 15 of 15 assets')).toBeInTheDocument();
  });

  it('filters as the user types', async () => {
    const { user } = renderApp('/assets');
    await user.type(screen.getByLabelText('Search'), 'macbook');
    expect(rows()).toHaveLength(1);
    expect(screen.getByText('Showing 1 of 15 assets')).toBeInTheDocument();
  });

  it('filters by category and status', async () => {
    const { user } = renderApp('/assets');
    await user.selectOptions(screen.getByLabelText('Category'), 'Laptop');
    expect(rows()).toHaveLength(4);
    await user.selectOptions(screen.getByLabelText('Status'), 'Retired');
    expect(rows()).toHaveLength(1);
  });

  it('reads filters from the address (dashboard links)', () => {
    renderApp('/assets?status=Under%20repair');
    expect(rows()).toHaveLength(2);
  });

  it('shows an empty state and clears filters', async () => {
    const { user } = renderApp('/assets');
    await user.type(screen.getByLabelText('Search'), 'no-such-thing');
    expect(screen.getByText('No assets match these filters.')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    expect(rows()).toHaveLength(15);
  });

  it('sorts when a column header is clicked', async () => {
    const { user } = renderApp('/assets');
    await user.click(screen.getByRole('button', { name: /Tag/ }));
    expect(within(rows()[0]).getByText('IT-0015')).toBeInTheDocument();
  });
});

describe('Assets list: delete', () => {
  it('asks for confirmation, then removes the asset', async () => {
    const { user } = renderApp('/assets');
    await user.click(screen.getByRole('button', { name: 'Delete IT-0005' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Delete IT-0005?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete asset' }));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.queryByText('IT-0005')).not.toBeInTheDocument();
    expect(rows()).toHaveLength(14);
    expect(screen.getByRole('status')).toHaveTextContent('Deleted IT-0005');
  });

  it('keeps the asset when the user cancels', async () => {
    const { user } = renderApp('/assets');
    await user.click(screen.getByRole('button', { name: 'Delete IT-0005' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(rows()).toHaveLength(15);
  });

  it('closes the dialog with Escape', async () => {
    const { user } = renderApp('/assets');
    await user.click(screen.getByRole('button', { name: 'Delete IT-0001' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(rows()).toHaveLength(15);
  });
});
