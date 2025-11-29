export default async function EventImagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = await params;
  return <div>Event Images Page, id: {eventId}</div>;
}
