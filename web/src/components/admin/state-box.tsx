type StateBoxProps = { kind: "loading" | "error" | "empty"; message?: string };

export function StateBox({ kind, message }: StateBoxProps) {
  if (kind === "loading")
    return (
      <p aria-busy="true" className="micro text-muted-foreground">
        იტვირთება…
      </p>
    );
  if (kind === "error")
    return (
      <p role="alert" className="bg-[#FFE3DD] px-4 py-3 text-sm text-[#8A1C08]">
        ჩატვირთვა ვერ მოხერხდა{message ? `: ${message}` : "."}
      </p>
    );
  return (
    <div data-testid="admin-empty" className="border border-dashed border-[#A9A9A4] px-6 py-14 text-center">
      <p className="text-2xl font-black">
        ჯერ ცარიელია<span className="text-brand">.</span>
      </p>
      <p className="mt-2 text-sm text-muted-foreground">დაამატეთ პირველი ჩანაწერი.</p>
    </div>
  );
}
