import type { ReactNode } from "react";

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="legal-page">
      <header className="legal-header">
        <a className="wordmark" href="/" aria-label="Lash by Doye home"><span className="wordmark-monogram">LD</span><span className="wordmark-name">LASH BY DOYE</span></a>
      </header>
      <article className="legal-body">
        <h1>{title}</h1>
        <p className="legal-date">Last updated November 6, 2026</p>
        {children}
        <nav className="legal-links" aria-label="More pages">
          <a href="/">Back to Lash by Doye</a>
          <a href="/#booking">Book your set</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Use</a>
        </nav>
      </article>
    </main>
  );
}
