import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

const rows = () => screen.getAllByRole('row').slice(1); // skip header row

// Waits for the list to show a given result line, e.g. "Showing 1–10 of 15 assets".
const showing = (text) => screen.findByText(text);

describe('Assets list: server pagination', () => {
  it('shows the first page of 10 assets from the server', async () => {
    const { api } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    expect(rows()).toHaveLength(10);
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(api.calls).toContainEqual(['getAssetPage', { page: 0, size: 10, sort: 'assetTag', dir: 'asc' }]);
  });

  it('moves to the next and previous page', async () => {
    const { user, api } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await showing('Showing 11–15 of 15 assets');
    expect(rows()).toHaveLength(5);
    expect(within(rows()[0]).getByText('IT-0011')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(api.calls).toContainEqual(['getAssetPage', { page: 1, size: 10, sort: 'assetTag', dir: 'asc' }]);

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    await showing('Showing 1–10 of 15 assets');
  });

  it('opens a page from the address', async () => {
    renderApp('/assets?page=2');
    await showing('Showing 11–15 of 15 assets');
  });

  it('asks the server to sort when a column header is clicked', async () => {
    const { user, api } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    await user.click(screen.getByRole('button', { name: /Tag/ }));
    expect(await screen.findByText('IT-0015')).toBeInTheDocument();
    expect(within(rows()[0]).getByText('IT-0015')).toBeInTheDocument();
    expect(api.calls).toContainEqual(['getAssetPage', { page: 0, size: 10, sort: 'assetTag', dir: 'desc' }]);
  });

  it('hides the pager when everything fits on one page', async () => {
    const { api } = renderApp('/assets', { assets: [] });
    expect(await screen.findByText('The inventory is empty.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).not.toBeInTheDocument();
    expect(api.calls.length).toBeGreaterThan(0);
  });
});

describe('Assets list: search', () => {
  it('filters as the user types', async () => {
    const { user } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    await user.type(screen.getByLabelText('Search'), 'macbook');
    expect(rows()).toHaveLength(1);
    expect(screen.getByText('Showing 1–1 of 1 matching assets (15 in total)')).toBeInTheDocument();
  });

  it('filters by category and status', async () => {
    const { user } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    await user.selectOptions(screen.getByLabelText('Category'), 'Laptop');
    expect(rows()).toHaveLength(4);
    await user.selectOptions(screen.getByLabelText('Status'), 'Retired');
    expect(rows()).toHaveLength(1);
  });

  it('reads filters from the address (dashboard links)', async () => {
    renderApp('/assets?status=Under%20repair');
    await showing('Showing 1–2 of 2 matching assets (15 in total)');
    expect(rows()).toHaveLength(2);
  });

  it('shows an empty state and clears filters', async () => {
    const { user } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    await user.type(screen.getByLabelText('Search'), 'no-such-thing');
    expect(screen.getByText('No assets match these filters.')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    await showing('Showing 1–10 of 15 assets');
  });

  it('opens an asset by its id', async () => {
    const { user, api } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    await user.type(screen.getByLabelText('Find by ID'), '8');
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Dell PowerEdge R760' })).toBeInTheDocument();
    expect(api.calls).toContainEqual(['getAssetById', '8']);
  });
});

describe('Assets list: delete', () => {
  it('asks for confirmation, then deletes the asset on the server', async () => {
    const { user, api } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    await user.click(screen.getByRole('button', { name: 'Delete IT-0005' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Delete IT-0005?' });
    await user.click(within(dialog).getByRole('button', { name: 'Delete asset' }));

    await showing('Showing 1–10 of 14 assets');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.queryByText('IT-0005')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Deleted IT-0005');
    expect(api.calls).toContainEqual(['deleteAsset', 5]);
  });

  it('keeps the asset when the user cancels', async () => {
    const { user, api } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    await user.click(screen.getByRole('button', { name: 'Delete IT-0005' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(rows()).toHaveLength(10);
    expect(api.calls.some(([name]) => name === 'deleteAsset')).toBe(false);
  });

  it('closes the dialog with Escape', async () => {
    const { user } = renderApp('/assets');
    await showing('Showing 1–10 of 15 assets');
    await user.click(screen.getByRole('button', { name: 'Delete IT-0001' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(rows()).toHaveLength(10);
  });
});
