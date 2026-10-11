import { Button } from "@/components/ui/button";

export type SaveState = { kind: "idle" | "saving" | "saved" | "invalid" } | { kind: "error"; message: string };

export function SaveBar({ state }: { state: SaveState }) {
  return (
    <div className="sticky bottom-0 flex flex-wrap items-center gap-4 border-t border-border bg-background py-4">
      <Button
        type="submit"
        data-testid="admin-save"
        disabled={state.kind === "saving"}
        className="h-12 rounded-none bg-brand px-8 text-[19px] font-bold text-white hover:bg-brand-text"
      >
        {state.kind === "saving" ? "ინახება…" : "შენახვა"}
      </Button>
      {state.kind === "saved" ? (
        <p role="status" data-testid="admin-saved" className="text-sm font-semibold">
          შენახულია ✓
        </p>
      ) : null}
      {state.kind === "invalid" ? (
        <p role="alert" className="text-sm text-destructive">
          შეავსეთ სავალდებულო ველები (KA).
        </p>
      ) : null}
      {state.kind === "error" ? (
        <p role="alert" className="text-sm text-destructive">
          შენახვა ვერ მოხერხდა: {state.message}
        </p>
      ) : null}
    </div>
  );
}
