import { HomePage } from "@/features/marketing/components/home-page";
import {
  getCatalogBestSellers,
  getCatalogCategories,
} from "@/lib/catalog";

export default async function MarketingPage() {
  const [categories, bestSellers] = await Promise.all([
    getCatalogCategories(),
    getCatalogBestSellers(),
  ]);

  return <HomePage categories={categories} bestSellers={bestSellers} />;
}
