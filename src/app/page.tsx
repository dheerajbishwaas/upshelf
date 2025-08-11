'use client';
import { useEffect, useState } from 'react';

type Product = { id: number; name: string; price: number };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="p-3 border rounded">
            {p.name} — ₹{p.price}
          </li>
        ))}
      </ul>
    </main>
  );
}
