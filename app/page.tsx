import CategoriesList from "@/components/home/CategoriesList";
import PropertiesContainer from "@/components/home/PropertiesContainer";

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
      <PropertiesContainer
        category={awaitedSearchParams.category}
        search={awaitedSearchParams.search}
      />
    </section>
  );
}
export default HomePage;
