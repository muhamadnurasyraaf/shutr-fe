import { getLandingPageData } from "./api/actions/event";
import LandingPage from "./pages/LandingPage";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

export default async function Page() {
  const data = await getLandingPageData();

  const events = data.recentEvents.map(
    (e: {
      id: string;
      name: string;
      description: string;
      date: string;
      thumbnailUrl?: string | null;
      location: string;
    }) => ({
      ...e,
      date: new Date(e.date),
    }),
  );

  return (
    <LandingPage
      recentEvents={events}
      topPhotographers={data.topPhotographers}
      isFallback={data.isFallback}
    />
  );
}
