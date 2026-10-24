import { Archivo, Noto_Sans_Georgian, Space_Grotesk } from "next/font/google";

/** Georgian text face for every page (variable weight and width). */
export const notoGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  axes: ["wdth"],
  variable: "--font-ka",
  display: "swap",
});

/** Latin display face for the public site: project names, numbers, language switch. */
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

/** Admin panel labels. */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-sg",
  display: "swap",
});
