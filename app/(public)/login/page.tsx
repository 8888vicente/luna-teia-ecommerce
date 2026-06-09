/**
 * app/(public)/login/page.tsx
 *
 * Pagina de inicio de sesion. Client Component con form
 * que llama a la server action `signInAction`.
 *
 * Query params:
 *   - ?next=<ruta>: a donde ir despues del login.
 *   - ?error=<msg> : mensaje de error para mostrar.
 */

"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInAction } from "@/lib/auth";
import styles from "./login.module.css";

export default function LoginPage() {
  const search = useSearchParams();
  const router = useRouter();
  const next = search.get("next") ?? "";
  const initialError = search.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    if (next) fd.set("next", next);

    startTransition(async () => {
      const res = await signInAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Si llegamos aqui sin redirect, la action devolvio
      // ok:true pero no redirigio (caso raro). Forzamos:
      router.refresh();
    });
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logoMark} aria-hidden="true">LT</div>
          <h1 className={styles.title}>Luna Teia</h1>
          <p className={styles.subtitle}>Acceso al panel interno</p>
        </header>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="tu@correo.com"
              disabled={isPending}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Contrasena</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="********"
              disabled={isPending}
            />
          </div>

          {error ? (
            <div className={styles.error} role="alert">
              {error}
            </div>
          ) : null}

          <button type="submit" className={styles.submit} disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <footer className={styles.footer}>
          <a href="/" className={styles.back}>Volver a la tienda</a>
        </footer>
      </div>
    </main>
  );
}