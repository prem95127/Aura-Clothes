import { CATEGORY_CONFIG } from "../data/products.js";

const NAMES = ["All", ...Object.keys(CATEGORY_CONFIG)];

export default function CategoryBar({ active, onChange, resultText }) {
  return (
    <section className="catalog" aria-labelledby="catalogTitle">
      <div className="catalog-head">
        <h2 id="catalogTitle">Shop by category</h2>
        <p id="resultCount" className="result-count" aria-live="polite">{resultText}</p>
      </div>
      <nav id="categoryBar" className="category-bar" aria-label="Product categories">
        {NAMES.map((name) => (
          <button
            key={name}
            type="button"
            className="category-btn"
            aria-pressed={name === active}
            onClick={() => onChange(name)}
          >
            {name}
          </button>
        ))}
      </nav>
    </section>
  );
}
