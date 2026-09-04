export const Spinner = ({ className = }; w-8 }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 rounded-full border-2 border-line2" />
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-fern-500 animate-spin" />
  </div>
);