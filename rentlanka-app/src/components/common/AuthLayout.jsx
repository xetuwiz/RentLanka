import { Link } from "react-router-dom";

const valueProps = [
  { icon: "🗺️", text: "Rent across all 9 provinces and 25 districts" },
  { icon: "🔑", text: "Verified owners and secure, instant bookings" },
  { icon: "📆", text: "Pay by the day — no hidden fees" },
];

export const AuthLayout = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid md:grid-cols-[42%_58%] rounded-3xl border border-line/70 bg-surface/70 backdrop-blur-xl shadow-card overflow-hidden">
        {/* Brand panel */}
        <div className="relative hidden md:flex flex-col justify-between p-9 bg-gradient-to-br from-fern-900/55 via-canvas to-canvas-deep overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 15%, rgba(99,188,143,0.9), transparent 55%), radial-gradient(circle at 85% 85%, rgba(28,93,66,0.8), transparent 50%)",
            }}
          />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fern-600 to-fern-800 border border-fern-500/40 flex items-center justify-center text-ink font-bold text-lg shadow-glow">
                R
              </div>
              <span className="text-lg font-semibold tracking-tight text-ink">
                Rent<span className="text-fern-400">Lanka</span>
              </span>
            </Link>
          </div>

          <div className="relative">
            <h2 className="text-2xl font-semibold tracking-tight text-ink leading-snug mb-5">
              The island,
              <br />
              <span className="text-fern-300">your</span> way.
{" "}
            </h2>
            <ul className="space-y-3.5">
              {valueProps.map((vp) => (
                <li key={vp.text} className="flex items-start gap-3 text-sm text-muted">
                  <span className="text-base leading-none mt-0.5">{vp.icon}</span>
                  <span>{vp.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-xs text-faint">
            9 provinces · 25 districts · 331 DS divisions
          </p>
        </div>

        {/* Form panel */}
        <div className="bg-canvas/40 p-6 sm:p-10">
          <div className="mb-7">
            <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-fern-400 mb-2">
              {eyebrow}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mb-2">
              {title}
            </h1>
            <p className="text-muted text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};