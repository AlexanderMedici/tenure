import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-6 py-24">
        <div className="text-sm font-semibold">404</div>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-slate-600">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="text-sm text-slate-900 underline">
          Back to home
        </Link>
      </div>
    </div>
  );
}
