import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import seedAssets from './seedAssets.js';
import { createFakeApi } from './fakeApi.js';

/**
 * Renders the full app at a given URL, backed by an in-memory fake of the Spring API.
 * Pass `api` to use a custom fake (for example one that fails).
 */
export function renderApp(route = '/', { assets = seedAssets, api = createFakeApi(assets) } = {}) {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
      <App api={api} />
    </MemoryRouter>,
  );
  return { user, api, ...utils };
}
