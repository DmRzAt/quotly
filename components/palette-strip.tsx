export function PaletteStrip({
  colors,
  className = "h-16",
}: {
  colors: string[];
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-5 overflow-hidden rounded-lg border ${className}`}>
      {colors.map((color) => (
        <div key={color} style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}
