import { getEventImages } from "@/app/api/actions/event";
import EventImagesClient from "./EventImagesClient";
import { notFound } from "next/navigation";

export default async function EventImagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const { id: eventId } = await params;
  const { page = "1", limit = "20" } = await searchParams;

  const data = await getEventImages(eventId, parseInt(page), parseInt(limit));

  return <EventImagesClient initialData={data} />;
}
