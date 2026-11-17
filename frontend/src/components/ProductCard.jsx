import { useState } from "react";

function ProductCard({ product, onAddToCart }) {
  const availableVariants = product.variants.filter(
    variant => variant.stock > 0
  );

  const [selectedVariant, setSelectedVariant] = useState(
    availableVariants[0]?._id || ""
  );

  const variant = availableVariants.find(
    item => item._id === selectedVariant
  );

  const handleAdd = () => {
    if (!variant) {
      alert("Selecciona una talla y un color disponibles.");
      return;
    }

    onAddToCart(product, variant);
  };

  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>

      <div className="product-info">
        <p>{product.brand} · {product.category}</p>
        <h3>{product.name}</h3>

        <strong>
          S/ {Number(product.price).toFixed(2)}
        </strong>

        <label htmlFor={`variant-${product._id}`}>
          Talla y color
        </label>

        <select
          id={`variant-${product._id}`}
          value={selectedVariant}
          onChange={e => setSelectedVariant(e.target.value)}
        >
          {availableVariants.length === 0 && (
            <option value="">Sin stock</option>
          )}

          {availableVariants.map(item => (
            <option key={item._id} value={item._id}>
              Talla {item.size} - {item.color} ({item.stock} disponibles)
            </option>
          ))}
        </select>

        <button
          onClick={handleAdd}
          disabled={!variant}
        >
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}

export default ProductCard;