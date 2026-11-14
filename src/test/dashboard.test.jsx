import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';
import { createFakeApi } from './fakeApi.js';
import { ApiError } from '../api/assetApi.js';

describe('Dashboard', () => {
  it('summarises the inventory loaded from the server', async () => {
    renderApp('/');
    expect(await screen.findByText(/15 assets on record/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Needs attention' })).toBeInTheDocument();
  });

  it('links each status to a filtered list', async () => {
    const { user } = renderApp('/');
    await user.click(await screen.findByRole('link', { name: /Under repair\s*2/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
    expect(screen.getByText('Showing 1–2 of 2 matching assets (15 in total)')).toBeInTheDocument();
  });

  it('handles an empty inventory', async () => {
    renderApp('/', { assets: [] });
    expect(await screen.findByText(/0 assets on record/)).toBeInTheDocument();
  });

  it('explains when the server cannot be reached, and retries', async () => {
    const api = createFakeApi([]);
    let fail = true;
    const realGetAll = api.getAllAssets;
    api.getAllAssets = async () => {
      if (fail) throw new ApiError(0, 'Cannot reach the AssetDesk server. Make sure the backend is running on port 3001.');
      return realGetAll();
    };
    const { user } = renderApp('/', { api });

    expect(await screen.findByRole('heading', { name: 'Cannot load assets' })).toBeInTheDocument();
    expect(screen.getByText(/backend is running on port 3001/)).toBeInTheDocument();

    fail = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/0 assets on record/)).toBeInTheDocument();
  });
});
