import { useAssets } from '../context/AssetContext.jsx';

/** Shown instead of a page while assets are loading or when the server cannot be reached. */
export default function LoadState({ error, onRetry }) {
  const context = useAssets();
  const shownError = error ?? context.error;
  const retry = onRetry ?? context.reload;

  if (shownError) {
    return (
      <div className="page">
        <div className="server-error" role="alert">
          <h1>Cannot load assets</h1>
          <p>{shownError.message}</p>
          <button type="button" className="button" onClick={retry}>Try again</button>
        </div>
      </div>
    );
  }
  return (
    <div className="page">
      <p className="loading" aria-live="polite">Loading…</p>
    </div>
  );
}
