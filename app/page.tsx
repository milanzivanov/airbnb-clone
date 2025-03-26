import LoadingCards from "@/components/card/LoadingCards";
import CategoriesList from "@/components/home/CategoriesList";
import PropertiesContainer from "@/components/home/PropertiesContainer";
import { Suspense } from "react";

async function HomePage({
  searchParams
}: {
  searchParams: { category?: string; search?: string };
}) {
  const awaitedSearchParams = await Promise.resolve(searchParams); // Simulate awaiting searchParams

  return (
    <section>
      <CategoriesList
        category={awaitedSearchParams.category}
        search={awaitedSearchParams.search}
      />
      <Suspense fallback={<LoadingCards />}>
        <PropertiesContainer
          category={awaitedSearchParams.category}
          search={awaitedSearchParams.search}
        />
      </Suspense>
    </section>
  );
}
export default HomePage;
