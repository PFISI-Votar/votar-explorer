import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VOTAR Explorer", template: "%s · VOTAR Explorer" },
  description: "Explorador de bloques y contratos de la red VOTAR.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        <header className="site-header">
          <div className="shell nav">
            <Link className="brand" href="/" aria-label="VOTAR Explorer, inicio">
              <span className="brand-mark" aria-hidden="true">V</span>
              <span>VOTAR <b>Explorer</b></span>
            </Link>
            <nav aria-label="Navegación principal">
              <Link href="/blocks">Bloques</Link>
              <Link href="/transactions">Transacciones</Link>
              <Link href="/contracts">Contratos</Link>
              <Link className="nav-action" href="/verify">Verificar contrato</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer>
          <div className="shell footer-inner">
            <span>VOTAR Explorer · red de simulación</span>
            <span>Los datos se leen directamente del nodo.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
