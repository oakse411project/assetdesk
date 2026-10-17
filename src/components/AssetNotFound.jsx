import { Link } from 'react-router-dom';

/** Shown when an /assets/:id address points to an asset that does not exist. */
export default function AssetNotFound() {
  return (
    <div className="page">
      <h1>Asset not found</h1>
      <p>
        It may have been deleted. <Link to="/assets">Back to assets</Link>
      </p>
    </div>
  );
}
