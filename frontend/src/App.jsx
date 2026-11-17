import { useEffect, useState } from "react";
import api from "./services/api";
import Auth from "./components/Auth";
import ProductCard from "./components/ProductCard";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data.products);
      setError("");
    } catch (err) {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    validateSession();
  }, []);

  const categories = [
    { value: "all", label: "Todos" },
    { value: "running", label: "Running" },
    { value: "casual", label: "Casual" },
    { value: "basketball", label: "Basketball" },
    { value: "training", label: "Training" },
    { value: "football", label: "Football" }
  ];

  const filteredProducts = category === "all"
    ? products
    : products.filter(product => product.category === category);

  const addToCart = (product, variant) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(
        item =>
          item.productId === product._id &&
          item.variantId === variant._id
      );

      if (existingItem) {
        if (existingItem.quantity >= variant.stock) {
          alert("No hay más unidades disponibles.");
          return currentCart;
        }

        return currentCart.map(item =>
          item.productId === product._id &&
          item.variantId === variant._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          productId: product._id,
          variantId: variant._id,
          name: product.name,
          brand: product.brand,
          image: product.image,
          price: product.price,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          quantity: 1
        }
      ];
    });
  };

  const updateQuantity = (productId, variantId, amount) => {
    setCart(currentCart =>
      currentCart
        .map(item => {
          if (
            item.productId === productId &&
            item.variantId === variantId
          ) {
            const newQuantity = item.quantity + amount;

            if (newQuantity > item.stock) return item;

            return { ...item, quantity: newQuantity };
          }

          return item;
        })
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId, variantId) => {
    setCart(currentCart =>
      currentCart.filter(
        item =>
          item.productId !== productId ||
          item.variantId !== variantId
      )
    );
  };

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleLogin = loggedUser => {
    setUser(loggedUser);
    setShowAuth(false);
    setCurrentPage("account");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCart([]);
    setCurrentPage("home");
  };

  const handleOrderComplete = order => {
    setCart([]);
    fetchProducts();
    setCurrentPage("account");
    alert(`¡Compra realizada correctamente! Pedido: ${order._id}`);
  };

  const goToProducts = () => {
    setCurrentPage("home");

    setTimeout(() => {
      document.getElementById("productos")?.scrollIntoView({
        behavior: "smooth"
      });
    }, 100);
  };

  return (
    <div className="store">
      <header className="navbar">
        <h1
          onClick={() => setCurrentPage("home")}
          style={{ cursor: "pointer" }}
        >
          SNEAKER<span>STORE</span>
        </h1>

        <nav>
          <button
            className={currentPage === "home" ? "nav-active" : ""}
            onClick={() => setCurrentPage("home")}
          >
            Inicio
          </button>

          <button onClick={goToProducts}>
            Productos
          </button>

          <button
            onClick={() => {
              setCurrentPage("home");

              setTimeout(() => {
                document.getElementById("nosotros")?.scrollIntoView({
                  behavior: "smooth"
                });
              }, 100);
            }}
          >
            Nosotros
          </button>
        </nav>

        <div className="navbar-actions">
          <button
            className="cart-button"
            onClick={() => setCurrentPage("cart")}
          >
            🛒 Carrito ({cartCount})
          </button>

          <button
            className="cart-button"
            onClick={() => setCurrentPage("account")}
          >
            {user ? "Mi cuenta" : "Ingresar"}
          </button>

          {user?.role === "admin" && (
            <button
              className="cart-button"
              onClick={() => setCurrentPage("admin")}
            >
              Administración
            </button>
          )}
        </div>
      </header>

      {currentPage === "home" && (
        <main>
          <section className="hero" id="inicio">
            <div className="hero-content">
              <p className="eyebrow">NUEVA COLECCIÓN 2026</p>

              <h2>
                CAMINA CON
                <br />
                TU PROPIO <span>ESTILO.</span>
              </h2>

              <p>
                Encuentra las zapatillas ideales para cada momento.
                Comodidad, diseño y personalidad en un solo lugar.
              </p>

              <button className="hero-button" onClick={goToProducts}>
                Explorar colección
              </button>
            </div>
          </section>

          <section className="products-section" id="productos">
            <div className="section-heading">
              <p>ELIGE TU ESTILO</p>
              <h2>NUESTROS PRODUCTOS</h2>
            </div>

            <div className="category-filters">
              {categories.map(item => (
                <button
                  key={item.value}
                  className={category === item.value ? "active" : ""}
                  onClick={() => setCategory(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {loading && (
              <p className="catalog-message">Cargando productos...</p>
            )}

            {error && (
              <p className="catalog-message">{error}</p>
            )}

            {!loading && !error && filteredProducts.length === 0 && (
              <p className="catalog-message">
                No hay productos disponibles en esta categoría.
              </p>
            )}

            <div className="product-grid">
              {!loading && !error && filteredProducts.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          </section>

          <section className="about" id="nosotros">
            <h2>ESTILO QUE TE MUEVE.</h2>
            <p>Tu próximo par favorito te está esperando.</p>
          </section>
        </main>
      )}

      {currentPage === "cart" && (
        <Cart
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          onBack={() => setCurrentPage("home")}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {currentPage === "account" && (
        <Account
          user={user}
          onLogin={() => setShowAuth(true)}
          onLogout={handleLogout}
        />
      )}

      {currentPage === "admin" && user?.role === "admin" && (
        <AdminPage onRefresh={fetchProducts} />
      )}

      {showAuth && (
        <Auth
          onLogin={handleLogin}
          onClose={() => setShowAuth(false)}
        />
      )}

      <footer>
        © 2026 Sneaker Store · Todos los derechos reservados.
      </footer>
    </div>
  );
}

function AdminPage({ onRefresh }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data.orders);
    } catch (err) {
      setError("No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleReturn = async (orderId, decision) => {
    try {
      await api.patch(`/orders/${orderId}/return`, { decision });
      alert("Solicitud procesada correctamente.");
      loadOrders();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || "No se pudo procesar.");
    }
  };

  const handleStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "No se pudo actualizar.");
    }
  };

  return (
    <main className="page-container">
      <div className="page-heading">
        <p>SNEAKER STORE / ADMINISTRACIÓN</p>
        <h1>PANEL DE ADMINISTRACIÓN</h1>
        <span>Gestiona los pedidos y las devoluciones.</span>
      </div>

      {loading && <p>Cargando pedidos...</p>}
      {error && <p className="auth-error">{error}</p>}

      <section className="orders-section">
        <h2>PEDIDOS REGISTRADOS</h2>

        {orders.map(order => (
          <article className="order-card" key={order._id}>
            <h3>Pedido #{order._id.slice(-8)}</h3>
            <p>Cliente: {order.user?.name}</p>
            <p>Correo: {order.user?.email}</p>
            <p>Dirección: {order.shippingAddress}</p>
            <p>Estado: {order.status}</p>
            <p>Devolución: {order.returnStatus}</p>
            <p>Total: S/ {order.total.toFixed(2)}</p>

            {order.returnStatus === "requested" && (
              <div className="admin-actions">
                <button onClick={() => handleReturn(order._id, "approved")}>
                  APROBAR DEVOLUCIÓN
                </button>

                <button onClick={() => handleReturn(order._id, "rejected")}>
                  RECHAZAR DEVOLUCIÓN
                </button>
              </div>
            )}

            {order.status === "confirmed" && (
              <button onClick={() => handleStatus(order._id, "shipped")}>
                MARCAR COMO ENVIADO
              </button>
            )}

            {order.status === "shipped" && (
              <button onClick={() => handleStatus(order._id, "delivered")}>
                MARCAR COMO ENTREGADO
              </button>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;