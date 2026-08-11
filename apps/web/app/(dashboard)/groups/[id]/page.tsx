export default function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1 className="text-h1 text-prism-text">Group Detail</h1>
      <p className="text-body text-prism-text-muted mt-2">Group ID: {params.id}</p>
    </div>
  );
}
