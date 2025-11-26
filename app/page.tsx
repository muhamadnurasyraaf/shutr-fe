import { getLandingPageData } from "./api/actions/event";
import LandingPage from "./pages/LandingPage";

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
    })
  );

  return (
    <LandingPage
      recentEvents={events}
      topPhotographers={data.topPhotographers}
    />
  );
}
