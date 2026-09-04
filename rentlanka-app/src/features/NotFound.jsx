import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <p className="text-fern-400/80 font-mono text-[13px] tracking-[0.45em] uppercase mb-5">
          404 - Off the map
        </p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-ink mb-4">
          This lot&apos;s empty
        </h1>
        <p className="text-muted leading-relaxed mb-8">
          The page you drove up to doesn&apos;t seem to exist any more. There&apos;s
          nothing to rent here - so let&apos;s get you back on the main road.
.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            Browse vehicles
          </Link>
          <Link to="/register" className="btn-secondary">
            Become an owner
          </Link>
        </div>
      </div>
    </div>
  );
};