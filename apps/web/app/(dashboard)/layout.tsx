export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-prism-surface">
      {/* TODO: AppShell with Sidebar (desktop) and BottomNav (mobile) */}
      <main className="p-prism-4 md:p-prism-6">
        {children}
      </main>
    </div>
  );
}
