'use client';

import Link from 'next/link';
import { categories } from '@/data/facts';

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-5 w-full max-w-sm mx-auto">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.id}`}
          className={`category-card block rounded-3xl bg-gradient-to-br ${cat.gradient} p-7 text-center text-white shadow-lg hover:shadow-xl`}
        >
          <span className="text-6xl block mb-3">{cat.emoji}</span>
          <span className="text-xl font-bold">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
