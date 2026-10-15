import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ items }) {
  return (
    <section id="container">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </section>
  );
}
