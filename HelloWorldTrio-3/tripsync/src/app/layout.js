import "@/app/globals.css";
import Providers from "./providers";

export const metadata = { title: "TripSync" };

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
