'use client';

import Link from 'next/link';
import { categories } from '@/data/facts';

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.id}`}
          className={`category-card block rounded-2xl bg-gradient-to-br ${cat.gradient} p-4 text-center text-white shadow-lg hover:shadow-xl`}
        >
          <span className="text-4xl block mb-2">{cat.emoji}</span>
          <span className="text-sm font-bold">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
