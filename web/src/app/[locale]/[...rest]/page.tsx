import { notFound } from "next/navigation";

// Unknown paths under a valid locale: render [locale]/not-found.tsx inside the locale layout (correct <html lang>).
export default function CatchAll() {
  notFound();
}
