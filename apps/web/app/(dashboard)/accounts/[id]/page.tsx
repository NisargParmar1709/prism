export default function AccountDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-h1 text-prism-text">Account Detail</h1>
      <p className="text-body text-prism-text-muted mt-2">Account ID: {params.id}</p>
    </div>
  );
}
