const badges = [
  "IATAN",
  "ARC",
  "ASTA",
  "Norton Secured",
  "Trustwave",
  "VISA",
  "Mastercard",
  "American Express",
  "Discover",
  "PayPal",
  "Affirm",
];

export function PaymentBadges() {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {badges.map((b) => (
        <li key={b}>
          <span
            role="img"
            aria-label={`${b} accreditation`}
            className="grid h-9 min-w-[74px] place-items-center rounded-md border border-white/20 bg-white/10 px-2.5 text-[10px] font-bold uppercase tracking-wide text-navy-foreground/80"
          >
            {b}
          </span>
        </li>
      ))}
    </ul>
  );
}
