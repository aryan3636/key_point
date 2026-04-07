import "./globals.css";
import { Providers } from "@/app/providers";

export const metadata = {
  title: "Key Point Inventory MVP",
  description: "Mock inventory dashboard inspired by the ag-drive dashboard patterns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
