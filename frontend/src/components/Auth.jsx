import { useState } from "react";
import api from "../services/api";

function Auth({ onLogin, onClose }) {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      const data = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await api.post(endpoint, data);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      onLogin(user);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "No se pudo completar la operación"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <section className="auth-panel">
        <button className="auth-close" onClick={onClose}>
          ✕
        </button>

        <h2>{isRegister ? "Crear cuenta" : "Bienvenido"}</h2>

        <p>
          {isRegister
            ? "Regístrate en Sneaker Store."
            : "Inicia sesión para continuar."}
        </p>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={e => setName(e.target.value)}
              minLength={3}
              required
            />
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Procesando..."
              : isRegister
                ? "Registrarme"
                : "Iniciar sesión"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? "¿Ya tienes una cuenta?"
            : "¿Todavía no tienes una cuenta?"}

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
            }}
          >
            {isRegister ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </section>
    </div>
  );
}

export default Auth;