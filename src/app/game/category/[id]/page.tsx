import { categories, CategoryId } from '@/data/facts';
import GameClient from '@/components/GameClient';

export function generateStaticParams() {
  return categories.map((cat) => ({ id: cat.id }));
}

export default async function GameCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GameClient categoryId={id as CategoryId} />;
}
