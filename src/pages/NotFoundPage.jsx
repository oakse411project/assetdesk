import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page">
      <h1>Page not found</h1>
      <p>Check the address, or go to the <Link to="/">dashboard</Link>.</p>
    </div>
  );
}
