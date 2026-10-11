import Image from "next/image";

type LogoImageProps = { testId?: string; priority?: boolean };

/** Shota's original globalAI logo file. Never replace with a text wordmark. */
export function LogoImage({ testId, priority = false }: LogoImageProps) {
  return (
    <Image
      src="/brand/globalai-logo.png"
      alt="globalAI"
      width={1471}
      height={292}
      priority={priority}
      loading={priority ? undefined : "eager"}
      sizes="152px"
      data-testid={testId}
      style={{ height: 30, width: "auto", display: "block" }}
    />
  );
}
