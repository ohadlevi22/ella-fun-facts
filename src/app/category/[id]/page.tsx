import { categories, CategoryId } from '@/data/facts';
import CategoryPageClient from '@/components/CategoryPageClient';

export function generateStaticParams() {
  return categories.map((cat) => ({ id: cat.id }));
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryPageClient categoryId={id as CategoryId} />;
}
