export default async function IdPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  return <p>You are on page {id}</p>;
}
