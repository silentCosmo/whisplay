export default function Section({ title, subtitle, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {subtitle && (
          <p className="text-white/60 text-xs italic">{subtitle}</p>
        )}
      {children}
    </div>
  );
}
