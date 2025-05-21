import { fetchChartsData } from "@/utils/actions";
import Chart from "@/components/admin/Chart";

async function ChartsContainer() {
  const bookings = await fetchChartsData();

  console.log("/////// Charts data:", bookings);

  if (bookings.bookingsPerMonth.length < 1) return null;

  return (
    <Chart
      data={bookings.bookingsPerMonth.map(({ date, count }) => ({
        name: date,
        count
      }))}
    />
  );
}
export default ChartsContainer;
