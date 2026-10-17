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

describe('Adding an asset', () => {
  it('suggests the next free tag', () => {
    renderApp('/assets/new');
    expect(screen.getByLabelText('Asset tag')).toHaveValue('IT-0016');
  });

  it('shows errors and does not save an empty form', async () => {
    const { user } = renderApp('/assets/new');
    await user.click(screen.getByRole('button', { name: 'Add asset' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/Fix \d+ fields before saving/);
    expect(screen.getByText('Enter the brand.')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toHaveFocus();
  });

  it('adds a valid asset and opens its page', async () => {
    const { user } = renderApp('/assets/new');
    await fillValidAsset(user);
    await user.click(screen.getByRole('button', { name: 'Add asset' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Lenovo ThinkPad T14' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Added IT-0016');

    await user.click(within(screen.getByRole('navigation', { name: 'Main menu' })).getByRole('link', { name: 'Assets' }));
    expect(screen.getByText('Showing 16 of 16 assets')).toBeInTheDocument();
  });

  it('rejects a duplicate serial number', async () => {
    const { user } = renderApp('/assets/new');
    await fillValidAsset(user);
    const serial = screen.getByLabelText('Serial number');
    await user.clear(serial);
    await user.type(serial, 'DL7440-8K2M1');
    await user.click(screen.getByRole('button', { name: 'Add asset' }));
    expect(screen.getByText('Another asset already has this serial number.')).toBeInTheDocument();
  });

  it('requires a person when status is In use, and clears the error when fixed', async () => {
    const { user } = renderApp('/assets/new');
    await fillValidAsset(user);
    await user.selectOptions(screen.getByLabelText('Status'), 'In use');
    await user.click(screen.getByRole('button', { name: 'Add asset' }));
    expect(screen.getByText('Assets in use need a person assigned.')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Assigned to/), 'Mona');
    expect(screen.queryByText('Assets in use need a person assigned.')).not.toBeInTheDocument();
  });
});

describe('Viewing and editing an asset', () => {
  it('shows the asset details', () => {
    renderApp('/assets/a8');
    expect(screen.getByRole('heading', { level: 1, name: 'Dell PowerEdge R760' })).toBeInTheDocument();
    expect(screen.getByText('PER760-0093X')).toBeInTheDocument();
    expect(screen.getByText('Hosts internal file shares.')).toBeInTheDocument();
  });

  it('updates an asset', async () => {
    const { user } = renderApp('/assets/a7/edit');
    expect(screen.getByLabelText('Model')).toHaveValue('iPad Air 11"');

    await user.selectOptions(screen.getByLabelText('Status'), 'In use');
    await user.type(screen.getByLabelText(/Assigned to/), 'Reem Alfaisal');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByRole('status')).toHaveTextContent('Saved changes to IT-0007');
    expect(screen.getByText('Reem Alfaisal')).toBeInTheDocument();
    expect(screen.getAllByText('In use').length).toBeGreaterThan(0);
  });

  it('deletes from the details page and returns to the list', async () => {
    const { user } = renderApp('/assets/a11');
    await user.click(screen.getByRole('button', { name: 'Delete asset' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Delete asset' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Assets' })).toBeInTheDocument();
    expect(screen.getByText('Showing 14 of 14 assets')).toBeInTheDocument();
  });

  it('handles an unknown asset id', () => {
    renderApp('/assets/missing');
    expect(screen.getByRole('heading', { name: 'Asset not found' })).toBeInTheDocument();
  });

  it('handles editing an unknown asset id', () => {
    renderApp('/assets/missing/edit');
    expect(screen.getByRole('heading', { name: 'Asset not found' })).toBeInTheDocument();
  });

  it('cancelling an edit returns to the details page unchanged', async () => {
    const { user } = renderApp('/assets/a1/edit');
    await user.clear(screen.getByLabelText('Brand'));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { level: 1, name: 'Dell Latitude 7440' })).toBeInTheDocument();
  });
});
