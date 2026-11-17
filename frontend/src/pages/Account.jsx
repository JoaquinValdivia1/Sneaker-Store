import { useEffect, useState } from "react";
import api from "../services/api";

function Account({ user, onLogin, onLogout }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/orders/my-orders");
      setOrders(response.data.orders);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "No se pudo cargar el historial."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const handleReturn = async orderId => {
    const reason = window.prompt("Indica el motivo de la devolución:");

    if (!reason?.trim()) return;

    try {
      await api.post(`/orders/${orderId}/return`, { reason });
      alert("Solicitud de devolución enviada.");
      loadOrders();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "No se pudo enviar la solicitud."
      );
    }
  };

  return (
    <main className="page-container">
      <div className="page-heading">
        <p>SNEAKER STORE / MI CUENTA</p>
        <h1>MI CUENTA</h1>
        <span>Gestiona tu información personal.</span>
      </div>

      {user ? (
        <>
          <section className="account-card">
            <div className="account-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <h2>¡Hola, {user.name}!</h2>
            <p>Bienvenido a Sneaker Store.</p>

            <div className="account-details">
              <div>
                <span>Nombre completo</span>
                <strong>{user.name}</strong>
              </div>

              <div>
                <span>Correo electrónico</span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>Tipo de cuenta</span>
                <strong>
                  {user.role === "admin" ? "Administrador" : "Cliente"}
                </strong>
              </div>
            </div>

            <button className="account-logout" onClick={onLogout}>
              CERRAR SESIÓN
            </button>
          </section>

          <section className="orders-section">
            <h2>MI HISTORIAL DE COMPRAS</h2>

            {loading && <p>Cargando pedidos...</p>}
            {error && <p className="auth-error">{error}</p>}

            {!loading && orders.length === 0 && (
              <p>Todavía no tienes compras registradas.</p>
            )}

            {orders.map(order => (
              <article className="order-card" key={order._id}>
                <h3>Pedido #{order._id.slice(-8)}</h3>

                <p>
                  Fecha: {new Date(order.createdAt).toLocaleDateString("es-PE")}
                </p>

                <p>Estado: {order.status}</p>
                <p>Devolución: {order.returnStatus}</p>

                {order.items.map((item, index) => (
                  <div key={`${order._id}-${index}`}>
                    <span>
                      {item.productName} · Talla {item.size} · {item.color}
                    </span>
                    <strong>
                      {item.quantity} × S/ {item.unitPrice.toFixed(2)}
                    </strong>
                  </div>
                ))}

                <h3>Total: S/ {order.total.toFixed(2)}</h3>

                {order.returnStatus === "not_requested" &&
                  order.status !== "cancelled" &&
                  order.status !== "returned" && (
                    <button onClick={() => handleReturn(order._id)}>
                      SOLICITAR DEVOLUCIÓN
                    </button>
                  )}
              </article>
            ))}
          </section>
        </>
      ) : (
        <section className="account-card">
          <h2>¡Bienvenido a Sneaker Store!</h2>
          <p>Inicia sesión o crea una cuenta para continuar.</p>
          <button className="account-login" onClick={onLogin}>
            INICIAR SESIÓN / REGISTRARME
          </button>
        </section>
      )}
    </main>
  );
}

export default Account;