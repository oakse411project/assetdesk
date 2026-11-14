import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

async function fillValidAsset(user) {
  await user.selectOptions(screen.getByLabelText('Category'), 'Laptop');
  await user.type(screen.getByLabelText('Brand'), 'Lenovo');
  await user.type(screen.getByLabelText('Model'), 'ThinkPad T14');
  await user.type(screen.getByLabelText('Serial number'), 'PF-NEW-001');
  await user.selectOptions(screen.getByLabelText('Department'), 'Finance');
  await user.type(screen.getByLabelText('Purchase date'), '2026-10-01');
  await user.type(screen.getByLabelText('Purchase cost (SAR)'), '5200');
  await user.type(screen.getByLabelText('Warranty ends'), '2029-10-01');
}

// The add page renders once the asset list has loaded from the server.
const openAddPage = async () => {
  const result = renderApp('/assets/new');
  await screen.findByRole('heading', { level: 1, name: 'Add asset' });
  return result;
};

describe('Adding an asset', () => {
  it('suggests the next free tag', async () => {
    await openAddPage();
    expect(screen.getByLabelText('Asset tag')).toHaveValue('IT-0016');
  });

  it('shows errors and does not send an empty form', async () => {
    const { user, api } = await openAddPage();
    await user.click(screen.getByRole('button', { name: 'Add asset' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Fix \d+ fields before saving/);
    expect(screen.getByText('Enter the brand.')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toHaveFocus();
    expect(api.calls.some(([name]) => name === 'createAsset')).toBe(false);
  });

  it('sends a valid asset to the server and opens its page', async () => {
    const { user, api } = await openAddPage();
    await fillValidAsset(user);
    await user.click(screen.getByRole('button', { name: 'Add asset' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Lenovo ThinkPad T14' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Added IT-0016');
    const [, sent] = api.calls.find(([name]) => name === 'createAsset');
    expect(sent).toMatchObject({ assetTag: 'IT-0016', brand: 'Lenovo', purchaseCost: 5200 });
    expect(sent).not.toHaveProperty('id');

    await user.click(within(screen.getByRole('navigation', { name: 'Main menu' })).getByRole('link', { name: 'Assets' }));
    expect(await screen.findByText('Showing 1–10 of 16 assets')).toBeInTheDocument();
  });

  it('rejects a duplicate serial number before calling the server', async () => {
    const { user } = await openAddPage();
    await fillValidAsset(user);
    const serial = screen.getByLabelText('Serial number');
    await user.clear(serial);
    await user.type(serial, 'DL7440-8K2M1');
    await user.click(screen.getByRole('button', { name: 'Add asset' }));
    expect(screen.getByText('Another asset already has this serial number.')).toBeInTheDocument();
  });

  it('shows the server error when the save fails', async () => {
    const { user, api } = await openAddPage();
    api.createAsset = async () => {
      const { ApiError } = await import('../api/assetApi.js');
      throw new ApiError(409, 'Another asset already uses this tag or serial number.');
    };
    await fillValidAsset(user);
    await user.click(screen.getByRole('button', { name: 'Add asset' }));
    expect(await screen.findByText(/Could not add the asset/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Add asset' })).toBeInTheDocument();
  });

  it('requires a person when status is In use, and clears the error when fixed', async () => {
    const { user } = await openAddPage();
    await fillValidAsset(user);
    await user.selectOptions(screen.getByLabelText('Status'), 'In use');
    await user.click(screen.getByRole('button', { name: 'Add asset' }));
    expect(screen.getByText('Assets in use need a person assigned.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Assigned to/), 'Mona');
    expect(screen.queryByText('Assets in use need a person assigned.')).not.toBeInTheDocument();
  });
});

describe('Viewing and editing an asset', () => {
  it('loads the asset details by id', async () => {
    const { api } = renderApp('/assets/8');
    expect(await screen.findByRole('heading', { level: 1, name: 'Dell PowerEdge R760' })).toBeInTheDocument();
    expect(screen.getByText('PER760-0093X')).toBeInTheDocument();
    expect(screen.getByText('Hosts internal file shares.')).toBeInTheDocument();
    expect(api.calls).toContainEqual(['getAssetById', '8']);
  });

  it('updates an asset on the server', async () => {
    const { user, api } = renderApp('/assets/7/edit');
    expect(await screen.findByLabelText('Model')).toHaveValue('iPad Air 11"');

    await user.selectOptions(screen.getByLabelText('Status'), 'In use');
    await user.type(screen.getByLabelText(/Assigned to/), 'Reem Alfaisal');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Reem Alfaisal')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Saved changes to IT-0007');
    expect(screen.getAllByText('In use').length).toBeGreaterThan(0);
    const [, id, sent] = api.calls.find(([name]) => name === 'updateAsset');
    expect(id).toBe(7);
    expect(sent).toMatchObject({ status: 'In use', assignedTo: 'Reem Alfaisal' });
  });

  it('deletes from the details page and returns to the list', async () => {
    const { user } = renderApp('/assets/11');
    await user.click(await screen.findByRole('button', { name: 'Delete asset' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete asset' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
    expect(await screen.findByText('Showing 1–10 of 14 assets')).toBeInTheDocument();
  });

  it('handles an unknown asset id', async () => {
    renderApp('/assets/999');
    expect(await screen.findByRole('heading', { name: 'Asset not found' })).toBeInTheDocument();
  });

  it('handles editing an unknown asset id', async () => {
    renderApp('/assets/999/edit');
    expect(await screen.findByRole('heading', { name: 'Asset not found' })).toBeInTheDocument();
  });

  it('cancelling an edit returns to the details page unchanged', async () => {
    const { user, api } = renderApp('/assets/1/edit');
    await user.clear(await screen.findByLabelText('Brand'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Dell Latitude 7440' })).toBeInTheDocument();
    expect(api.calls.some(([name]) => name === 'updateAsset')).toBe(false);
  });
});
