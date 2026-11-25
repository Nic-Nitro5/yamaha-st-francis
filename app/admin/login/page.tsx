import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <section className="gutter py-16 lg:py-24">
      <div className="mx-auto max-w-sm">
        <p className="eyebrow text-brand">Staff only</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-ink">Stock dashboard</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">Sign in to add, edit and remove listings.</p>
        <LoginForm />
      </div>
    </section>
  );
}
