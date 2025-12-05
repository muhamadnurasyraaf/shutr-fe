import { Header } from "../components/Header";
import {
  fetchPhotographers,
  searchPhotographers,
  type PhotographyType,
} from "../api/actions/creator";
import { CategoryFilter } from "./CategoryFilter";
import { PhotographerGrid } from "./PhotographerGrid";
import { PhotographerSearch } from "./PhotographerSearch";

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function TopPhotographersPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const category = params.category as PhotographyType | undefined;
  const searchQuery = params.q;

  let photographers;
  let total;
  let hasMore;

  if (searchQuery && searchQuery.trim()) {
    // Use Typesense search
    const searchResult = await searchPhotographers(searchQuery, category);
    photographers = searchResult.hits;
    total = searchResult.estimatedTotalHits;
    hasMore = false;
  } else {
    // Use regular fetch
    const result = await fetchPhotographers(category);
    photographers = result.data;
    total = result.total;
    hasMore = result.hasMore;
  }

  return (
    <>
      <Header variant="solid" textVariant="dark" />

      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Hero Section with Search */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Photographers
              </h1>
              <p className="text-lg md:text-xl text-cyan-100 max-w-2xl mx-auto">
                Discover talented photographers capturing moments at events
                worldwide
              </p>
            </div>

            {/* Search Input */}
            <PhotographerSearch initialQuery={searchQuery || ""} />
          </div>
        </section>

        {/* Filter Section (Client Component) */}
        <CategoryFilter selected={category || null} />

        {/* Photographers Grid (Server Component) */}
        <PhotographerGrid
          photographers={photographers}
          total={total}
          hasMore={hasMore}
          searchQuery={searchQuery}
        />
      </div>
    </>
  );
}
