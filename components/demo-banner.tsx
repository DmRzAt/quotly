export function DemoBanner() {
  return (
    <div className="border-b bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      Demo mode · Stripe test card:{" "}
      <code className="font-mono font-semibold">4242 4242 4242 4242</code>, any
      future date, any CVC
    </div>
  );
}
