import { Noto_Sans_Georgian, Space_Grotesk } from "next/font/google";

export const notoGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian", "latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-ka",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-sg",
  display: "swap",
});
