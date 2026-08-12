export default function TestDesignPage() {
  return (
    <main className="min-h-screen bg-prism-surface p-prism-4 md:p-prism-6">
      <div className="max-w-5xl mx-auto space-y-prism-6">
        {/* ── Page Header ── */}
        <div>
          <h1 className="text-display gradient-text">Prism Design System</h1>
          <p className="text-h2 text-prism-text-secondary mt-2">
            Light-mode design token verification
          </p>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 1: Color Swatches
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-h1 text-prism-text mb-prism-4">Color Palette</h2>

          {/* Neutral Scale */}
          <h3 className="text-h3 text-prism-text-secondary mb-prism-2">Neutral Scale</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-prism-2 mb-prism-5">
            <ColorSwatch color="#FFFFFF" name="White" border />
            <ColorSwatch color="#F8FAFC" name="Surface" />
            <ColorSwatch color="#F1F5F9" name="Elevated" />
            <ColorSwatch color="#E2E8F0" name="Border" />
            <ColorSwatch color="#CBD5E1" name="Border Strong" />
            <ColorSwatch color="#475569" name="Text Secondary" light />
            <ColorSwatch color="#94A3B8" name="Text Muted" />
            <ColorSwatch color="#0F172A" name="Text" light />
          </div>

          {/* Violet Spectrum */}
          <h3 className="text-h3 text-prism-text-secondary mb-prism-2">Violet Spectrum</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-prism-2 mb-prism-5">
            <ColorSwatch color="#F5F3FF" name="V-50" />
            <ColorSwatch color="#EDE9FE" name="V-100" />
            <ColorSwatch color="#DDD6FE" name="V-200" />
            <ColorSwatch color="#A78BFA" name="V-400" />
            <ColorSwatch color="#8B5CF6" name="V-500" light />
            <ColorSwatch color="#7C3AED" name="V-600" light />
            <ColorSwatch color="#6D28D9" name="V-700" light />
            <ColorSwatch color="#4C1D95" name="V-900" light />
          </div>

          {/* Semantic Colors */}
          <h3 className="text-h3 text-prism-text-secondary mb-prism-2">Semantic Colors</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-prism-2 mb-prism-5">
            <ColorSwatch color="#10B981" name="Success" light />
            <ColorSwatch color="#ECFDF5" name="Success BG" />
            <ColorSwatch color="#F59E0B" name="Warning" />
            <ColorSwatch color="#FFFBEB" name="Warning BG" />
            <ColorSwatch color="#EF4444" name="Danger" light />
            <ColorSwatch color="#FEF2F2" name="Danger BG" />
          </div>

          {/* Chart Palette */}
          <h3 className="text-h3 text-prism-text-secondary mb-prism-2">
            Chart Palette (Monochromatic Purple)
          </h3>
          <div className="flex gap-0 rounded-card overflow-hidden mb-prism-5">
            {['#7C3AED', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F5F3FF'].map(
              (hex, i) => (
                <div
                  key={hex}
                  className="h-12 flex-1 flex items-center justify-center"
                  style={{ backgroundColor: hex }}
                >
                  <span
                    className={`text-xs font-medium ${i < 2 ? 'text-white' : 'text-prism-text-secondary'}`}
                  >
                    {i + 1}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Dark Accent Card Colors */}
          <h3 className="text-h3 text-prism-text-secondary mb-prism-2">Dark Accent Card</h3>
          <div className="grid grid-cols-3 gap-prism-2 mb-prism-5">
            <ColorSwatch color="#1E293B" name="Dark Card" light />
            <ColorSwatch color="#F8FAFC" name="Dark Text" border />
            <ColorSwatch color="#94A3B8" name="Dark Muted" />
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 2: Typography Scale
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-h1 text-prism-text mb-prism-4">Typography Scale</h2>
          <div className="bg-prism-white rounded-card border border-prism-border shadow-card p-prism-5 space-y-prism-4">
            <div className="border-b border-prism-border pb-prism-3">
              <span className="text-xs text-prism-text-muted block mb-1">
                text-display · 36px · 700
              </span>
              <p className="text-display text-prism-text">₹2,84,350.00</p>
            </div>
            <div className="border-b border-prism-border pb-prism-3">
              <span className="text-xs text-prism-text-muted block mb-1">
                text-h1 · 24px · 600
              </span>
              <p className="text-h1 text-prism-text">Dashboard Overview</p>
            </div>
            <div className="border-b border-prism-border pb-prism-3">
              <span className="text-xs text-prism-text-muted block mb-1">
                text-h2 · 20px · 600
              </span>
              <p className="text-h2 text-prism-text">Budget Health</p>
            </div>
            <div className="border-b border-prism-border pb-prism-3">
              <span className="text-xs text-prism-text-muted block mb-1">
                text-h3 · 16px · 600
              </span>
              <p className="text-h3 text-prism-text">Recent Transactions</p>
            </div>
            <div className="border-b border-prism-border pb-prism-3">
              <span className="text-xs text-prism-text-muted block mb-1">
                text-body · 14px · 400
              </span>
              <p className="text-body text-prism-text-secondary">
                Track your daily expenses and stay on top of your budget. Prism helps you
                see your money clearly.
              </p>
            </div>
            <div className="border-b border-prism-border pb-prism-3">
              <span className="text-xs text-prism-text-muted block mb-1">
                text-small · 13px · 500
              </span>
              <p className="text-small text-prism-text-muted">
                Last updated: 30 July 2026 · 2:34 PM IST
              </p>
            </div>
            <div className="border-b border-prism-border pb-prism-3">
              <span className="text-xs text-prism-text-muted block mb-1">
                text-xs · 12px · 500
              </span>
              <p className="text-xs text-prism-text-muted">UPI · Completed · Monthly</p>
            </div>
            <div>
              <span className="text-xs text-prism-text-muted block mb-1">
                text-mono · 14px · 600 (JetBrains Mono)
              </span>
              <p className="amount text-mono text-prism-text">₹32,400.00</p>
              <p className="amount text-mono amount-income">+₹8,000.00</p>
              <p className="amount text-mono amount-expense">−₹4,800.00</p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 3: SurfaceCard
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-h1 text-prism-text mb-prism-4">SurfaceCard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-prism-5">
            {/* Basic SurfaceCard */}
            <div className="bg-prism-white rounded-card border border-prism-border shadow-card p-prism-5 hover:shadow-card-hover hover:border-prism-border-strong transition-all duration-card-hover">
              <h3 className="text-h3 text-prism-text mb-prism-2">Category Distribution</h3>
              <p className="text-body text-prism-text-secondary mb-prism-3">
                Your spending breakdown for July 2026
              </p>
              <p className="text-h2 text-prism-text">₹35,200</p>
              <p className="text-small text-prism-text-muted mt-prism-1">
                Total across 5 categories
              </p>
            </div>

            {/* Budget Health Card */}
            <div className="bg-prism-white rounded-card border border-prism-border shadow-card p-prism-5 hover:shadow-card-hover hover:border-prism-border-strong transition-all duration-card-hover">
              <h3 className="text-h3 text-prism-text mb-prism-2">Budget Health</h3>
              <div className="flex items-baseline justify-between mb-prism-2">
                <span className="text-body text-prism-text-secondary">
                  ₹12,800 spent of ₹18,000
                </span>
                <span className="text-small font-semibold text-prism-text">67%</span>
              </div>
              {/* ProgressBar at 67% — violet */}
              <div className="w-full h-2 bg-prism-elevated rounded-pill overflow-hidden">
                <div
                  className="h-full bg-prism-violet-500 rounded-pill transition-all duration-progress ease-prism-ease"
                  style={{ width: '67%' }}
                />
              </div>
              <p className="text-small text-prism-text-muted mt-prism-2">
                8 days remaining · ₹1,733/day allowance
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 4: DarkHeroCard
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-h1 text-prism-text mb-prism-4">DarkHeroCard</h2>
          <div className="max-w-md">
            <div
              className="rounded-card p-prism-5 shadow-dark-card"
              style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              }}
            >
              <div className="flex items-center justify-between mb-prism-4">
                <div>
                  <p className="text-small text-prism-dark-muted">HDFC Savings</p>
                  <p className="text-xs text-prism-dark-muted mt-1">Bank · ••••4821</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-prism-violet-600/20 flex items-center justify-center">
                  <span className="text-body">🏦</span>
                </div>
              </div>
              <p className="text-xs text-prism-dark-muted mb-1">Current Balance</p>
              <p className="amount text-display text-prism-dark-text text-left">
                ₹2,84,350
              </p>
              <div className="flex items-center gap-prism-2 mt-prism-3">
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-pill bg-prism-success/20 text-green-400">
                  ↑ ₹12,400
                </span>
                <span className="text-xs text-prism-dark-muted">vs last month</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 5: ProgressBar (all 3 states)
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-h1 text-prism-text mb-prism-4">ProgressBar</h2>
          <div className="bg-prism-white rounded-card border border-prism-border shadow-card p-prism-5 space-y-prism-5">
            {/* Healthy < 80% */}
            <div>
              <div className="flex items-center justify-between mb-prism-2">
                <span className="text-small text-prism-text">
                  🚌 Transport — ₹800 / ₹1,500
                </span>
                <span className="text-small font-semibold text-prism-success">53%</span>
              </div>
              <div className="w-full h-2 bg-prism-elevated rounded-pill overflow-hidden">
                <div
                  className="h-full bg-prism-violet-500 rounded-pill transition-all duration-progress ease-prism-ease"
                  style={{ width: '53%' }}
                />
              </div>
            </div>

            {/* Warning 80-99% */}
            <div>
              <div className="flex items-center justify-between mb-prism-2">
                <span className="text-small text-prism-text">
                  🛒 Shopping — ₹1,800 / ₹2,000
                </span>
                <span className="text-small font-semibold text-prism-warning">90%</span>
              </div>
              <div className="w-full h-2 bg-prism-elevated rounded-pill overflow-hidden">
                <div
                  className="h-full bg-prism-warning rounded-pill transition-all duration-progress ease-prism-ease"
                  style={{ width: '90%' }}
                />
              </div>
            </div>

            {/* Danger ≥ 100% */}
            <div>
              <div className="flex items-center justify-between mb-prism-2">
                <span className="text-small text-prism-text">
                  🍔 Food — ₹4,100 / ₹3,500
                </span>
                <span className="text-small font-semibold text-prism-danger">117%</span>
              </div>
              <div className="w-full h-2 bg-prism-elevated rounded-pill overflow-hidden">
                <div
                  className="h-full bg-prism-danger rounded-pill transition-all duration-progress ease-prism-ease"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 6: StatusPill
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-h1 text-prism-text mb-prism-4">StatusPill</h2>
          <div className="bg-prism-white rounded-card border border-prism-border shadow-card p-prism-5">
            <div className="flex flex-wrap gap-prism-3">
              {/* Completed */}
              <span className="inline-flex items-center h-6 px-2.5 rounded-pill text-xs font-medium bg-prism-success-bg text-prism-success-text">
                Completed
              </span>
              {/* Pending */}
              <span className="inline-flex items-center h-6 px-2.5 rounded-pill text-xs font-medium bg-prism-warning-bg text-prism-warning-text">
                Pending
              </span>
              {/* Over Limit */}
              <span className="inline-flex items-center h-6 px-2.5 rounded-pill text-xs font-medium bg-prism-danger-bg text-prism-danger-text">
                Over Limit
              </span>
              {/* NEFT */}
              <span className="inline-flex items-center h-6 px-2.5 rounded-pill text-xs font-medium bg-prism-violet-50 text-prism-violet-700">
                NEFT
              </span>
              {/* UPI */}
              <span className="inline-flex items-center h-6 px-2.5 rounded-pill text-xs font-medium bg-prism-violet-50 text-prism-violet-700">
                UPI
              </span>
              {/* Monthly */}
              <span className="inline-flex items-center h-6 px-2.5 rounded-pill text-xs font-medium bg-prism-surface text-prism-text-muted">
                Monthly
              </span>
              {/* Info */}
              <span className="inline-flex items-center h-6 px-2.5 rounded-pill text-xs font-medium bg-prism-info-bg text-prism-info">
                On Track
              </span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 7: Buttons
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-h1 text-prism-text mb-prism-4">PrismButton Variants</h2>
          <div className="bg-prism-white rounded-card border border-prism-border shadow-card p-prism-5">
            <div className="flex flex-wrap gap-prism-3 items-center">
              {/* Primary */}
              <button className="inline-flex items-center justify-center h-10 px-4 bg-prism-violet-600 text-white font-semibold text-small rounded-button hover:bg-prism-violet-700 transition-colors duration-card-hover">
                Primary
              </button>
              {/* Secondary */}
              <button className="inline-flex items-center justify-center h-10 px-4 bg-prism-violet-50 text-prism-violet-700 font-semibold text-small rounded-button hover:bg-prism-violet-100 transition-colors duration-card-hover">
                Secondary
              </button>
              {/* Outline */}
              <button className="inline-flex items-center justify-center h-10 px-4 bg-transparent text-prism-violet-600 font-semibold text-small rounded-button border border-prism-violet-600 hover:bg-prism-violet-50 transition-colors duration-card-hover">
                Outline
              </button>
              {/* Danger */}
              <button className="inline-flex items-center justify-center h-10 px-4 bg-prism-danger-bg text-prism-danger-text font-semibold text-small rounded-button border border-prism-danger hover:bg-red-100 transition-colors duration-card-hover">
                Danger
              </button>
              {/* Text */}
              <button className="inline-flex items-center justify-center h-8 px-3 bg-transparent text-prism-violet-600 font-semibold text-small hover:underline transition-colors duration-card-hover">
                Text Link
              </button>
              {/* Disabled */}
              <button
                disabled
                className="inline-flex items-center justify-center h-10 px-4 bg-prism-violet-600 text-white font-semibold text-small rounded-button opacity-50 cursor-not-allowed"
              >
                Disabled
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 8: Spacing Scale
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-h1 text-prism-text mb-prism-4">Spacing Scale (4px grid)</h2>
          <div className="bg-prism-white rounded-card border border-prism-border shadow-card p-prism-5 space-y-prism-2">
            {[
              { token: 'prism-1', px: '4px' },
              { token: 'prism-2', px: '8px' },
              { token: 'prism-3', px: '12px' },
              { token: 'prism-4', px: '16px' },
              { token: 'prism-5', px: '24px' },
              { token: 'prism-6', px: '32px' },
              { token: 'prism-7', px: '40px' },
              { token: 'prism-8', px: '44px' },
              { token: 'prism-9', px: '48px' },
              { token: 'prism-10', px: '64px' },
            ].map(({ token, px }) => (
              <div key={token} className="flex items-center gap-prism-3">
                <span className="text-xs text-prism-text-muted w-20 shrink-0">
                  {token}
                </span>
                <span className="text-xs text-prism-text-muted w-12 shrink-0">{px}</span>
                <div
                  className="h-3 bg-prism-violet-400 rounded-sm"
                  style={{ width: px }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECTION 9: Shadows
        ══════════════════════════════════════════════ */}
        <section>
          <h2 className="text-h1 text-prism-text mb-prism-4">Shadows</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-prism-5">
            <div className="bg-prism-white rounded-card border border-prism-border shadow-card p-prism-5 text-center">
              <p className="text-small text-prism-text">shadow-card</p>
              <p className="text-xs text-prism-text-muted mt-1">Default</p>
            </div>
            <div className="bg-prism-white rounded-card border border-prism-border shadow-card-hover p-prism-5 text-center">
              <p className="text-small text-prism-text">shadow-card-hover</p>
              <p className="text-xs text-prism-text-muted mt-1">Hover</p>
            </div>
            <div
              className="rounded-card p-prism-5 text-center shadow-dark-card"
              style={{
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              }}
            >
              <p className="text-small text-prism-dark-text">shadow-dark-card</p>
              <p className="text-xs text-prism-dark-muted mt-1">Hero</p>
            </div>
            <div className="bg-prism-violet-600 rounded-full w-14 h-14 flex items-center justify-center shadow-fab mx-auto">
              <span className="text-white text-h2">+</span>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-prism-text-muted py-prism-5">
          Prism Design System v2 · Light Mode · All tokens from DESIGN_SYSTEM_v2.md
        </footer>
      </div>
    </main>
  );
}

/* ─── Helper Component ─── */
function ColorSwatch({
  color,
  name,
  light = false,
  border = false,
}: {
  color: string;
  name: string;
  light?: boolean;
  border?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`w-full aspect-square rounded-lg mb-1 ${border ? 'border border-prism-border' : ''}`}
        style={{ backgroundColor: color }}
      />
      <p className={`text-xs truncate ${light ? 'text-prism-text-muted' : 'text-prism-text-secondary'}`}>
        {name}
      </p>
      <p className="text-xs text-prism-text-muted font-mono">{color}</p>
    </div>
  );
}
