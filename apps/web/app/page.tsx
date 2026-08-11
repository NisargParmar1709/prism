export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-prism-surface p-prism-5">
      <div className="text-center space-y-4">
        <h1 className="text-display gradient-text">Prism</h1>
        <p className="text-h2 text-prism-text-secondary">
          See your money clearly
        </p>
        <p className="text-body text-prism-text-muted max-w-md mx-auto">
          Track expenses, set budgets, and achieve your savings goals.
          Built for Indian students.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/register"
            className="inline-flex items-center justify-center h-10 px-6 bg-prism-violet-600 text-white font-semibold text-small rounded-button hover:bg-prism-violet-700 transition-colors duration-card-hover"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="inline-flex items-center justify-center h-10 px-6 bg-prism-violet-50 text-prism-violet-700 font-semibold text-small rounded-button hover:bg-prism-violet-100 transition-colors duration-card-hover"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  );
}
