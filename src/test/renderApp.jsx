import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import seedAssets from '../data/seedAssets.js';

/** Renders the full app at a given URL with a fresh copy of the data. */
export function renderApp(route = '/', initialAssets = seedAssets) {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[route]}>
      <App initialAssets={initialAssets.map((a) => ({ ...a }))} />
    </MemoryRouter>,
  );
  return { user, ...utils };
}
