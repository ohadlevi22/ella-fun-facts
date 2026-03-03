'use client';

import Link from 'next/link';
import { categories, facts } from '@/data/facts';

function getFactCount(categoryId: string): number {
  return facts.filter(f => f.category === categoryId).length;
}

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.id}`}
          className={`category-card block rounded-2xl bg-gradient-to-br ${cat.gradient} p-4 pb-3 text-center text-white shadow-lg hover:shadow-xl relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
          <span className="text-4xl block mb-1.5 drop-shadow-sm">{cat.emoji}</span>
          <span className="text-sm font-bold block">{cat.name}</span>
          <span className="text-[10px] opacity-70 font-medium">{getFactCount(cat.id)} עובדות</span>
        </Link>
      ))}
    </div>
  );
}
