import { useState } from "react";
import api from "../services/api";

function Cart({
  cart,
  updateQuantity,
  removeFromCart,
  onBack,
  onOrderComplete
}) {
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      setError("Ingresa una dirección de envío.");
      return;
    }

    if (cart.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/orders", {
        shippingAddress,
        items: cart.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        }))
      });

      onOrderComplete(response.data.order);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "No se pudo completar la compra."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container">
      <div className="page-heading">
        <p>SNEAKER STORE / CARRITO</p>
        <h1>MI CARRITO</h1>
        <span>Revisa tus zapatillas antes de continuar.</span>
      </div>

      {cart.length === 0 ? (
        <div className="empty-page">
          <h2>Tu carrito está vacío</h2>
          <p>¡Encuentra tus próximas zapatillas favoritas!</p>
          <button onClick={onBack}>
            Volver a la tienda
          </button>
        </div>
      ) : (
        <div className="cart-page-layout">
          <section className="cart-page-items">
            {cart.map(item => (
              <article
                className="cart-page-item"
                key={`${item.productId}-${item.variantId}`}
              >
                <img src={item.image} alt={item.name} />

                <div className="cart-page-info">
                  <p>{item.brand}</p>
                  <h3>{item.name}</h3>

                  <span>
                    Talla: {item.size} · Color: {item.color}
                  </span>

                  <strong>
                    S/ {(item.price * item.quantity).toFixed(2)}
                  </strong>

                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, -1)
                      }
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, 1)
                      }
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>

                    <button
                      className="remove-button"
                      onClick={() =>
                        removeFromCart(item.productId, item.variantId)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-page-summary">
            <h2>RESUMEN DE COMPRA</h2>

            <div>
              <span>Productos</span>
              <strong>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </strong>
            </div>

            <div>
              <span>Subtotal</span>
              <strong>S/ {total.toFixed(2)}</strong>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>S/ {total.toFixed(2)}</strong>
            </div>

            <label htmlFor="shippingAddress">
              Dirección de envío
            </label>

            <textarea
              id="shippingAddress"
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              placeholder="Ingresa tu dirección completa"
              rows={3}
              maxLength={250}
            />

            {error && <p className="auth-error">{error}</p>}

            <button
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? "Procesando compra..." : "CONFIRMAR COMPRA"}
            </button>

            <button
              className="remove-button"
              onClick={onBack}
            >
              SEGUIR COMPRANDO
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;