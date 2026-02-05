import React, { useState, useEffect } from "react";
import {
  Trash2,
  Edit2,
  TrendingUp,
  ShoppingBag,
  Filter,
  RefreshCw,
  Eye,
  X,
  Lock,
  User,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import * as api from "./api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [pedidos, setPedidos] = useState([]);
  const [promedio, setPromedio] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [selectedPedido, setSelectedPedido] = useState(null);

  // Login State
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  // Form State
  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({
    cliente: "",
    total: "",
    estado: "PENDIENTE",
    fecha: format(new Date(), "yyyy-MM-dd"),
  });

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [data, avg] = await Promise.all([
        api.getPedidos(filter),
        api.getPromedio(),
      ]);
      setPedidos(data);
      setPromedio(avg);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        handleLogout();
      } else {
        setError("Error de conexión con el backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [filter, token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api.login(credentials.username, credentials.password);
      setToken(data.token);
      setError(null);
    } catch (err) {
      setError("Credenciales inválidas (admin/admin)");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setPedidos([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente || formData.total === "" || !formData.fecha) {
      setError("Todos los campos con (*) son obligatorios.");
      return;
    }
    try {
      if (isEditing) {
        await api.updatePedido(isEditing, formData);
      } else {
        await api.createPedido(formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      setError("Error al guardar registro.");
    }
  };

  const resetForm = () => {
    setFormData({
      cliente: "",
      total: "",
      estado: "PENDIENTE",
      fecha: format(new Date(), "yyyy-MM-dd"),
    });
    setIsEditing(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar?")) {
      try {
        await api.deletePedido(id);
        fetchData();
      } catch (err) {
        setError("Error al eliminar");
      }
    }
  };

  const handleEdit = (pedido) => {
    setIsEditing(pedido.id);
    setFormData({
      cliente: pedido.cliente,
      total: pedido.total,
      estado: pedido.estado,
      fecha: pedido.fecha,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!token) {
    return (
      <div
        className="app-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass"
          style={{ padding: "3rem", width: "100%", maxWidth: "400px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                background: "var(--primary)",
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto 1rem",
              }}
            >
              <Lock color="white" size={30} />
            </div>
            <h2>Acceso Restringido</h2>
            <p className="text-muted">Inicia sesión para continuar</p>
          </div>
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <div className="input-group">
              <label>Usuario</label>
              <div style={{ position: "relative" }}>
                <User
                  size={18}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="text"
                  style={{ paddingLeft: "40px", width: "100%" }}
                  placeholder="admin"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="input-group">
              <label>Contraseña</label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "12px",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="password"
                  style={{ paddingLeft: "40px", width: "100%" }}
                  placeholder="••••••"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                />
              </div>
            </div>
            {error && (
              <p
                style={{
                  color: "var(--error)",
                  fontSize: "0.85rem",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}
            <button className="btn-primary" style={{ marginTop: "1rem" }}>
              Entrar al Sistema
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="header glass"
      >
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ShoppingBag className="text-primary" /> Sistema de Pedidos
          </h1>
          <p className="text-muted">
            Sesión Activa: {credentials.username || "Admin"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={fetchData} className="btn-icon">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleLogout}
            className="btn-icon"
            style={{ color: "var(--error)" }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </motion.header>

      <div className="stats-grid">
        <motion.div whileHover={{ scale: 1.02 }} className="stat-card glass">
          <span className="text-muted">Total de Pedidos</span>
          <span className="stat-value">{pedidos.length}</span>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="stat-card glass">
          <span
            className="text-muted"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <TrendingUp size={16} /> Promedio General
          </span>
          <span className="stat-value">${promedio.toFixed(2)}</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="order-form glass"
      >
        <h3>{isEditing ? "📝 Editar Registro" : "➕ Nuevo Registro"}</h3>
        <form
          onSubmit={handleSubmit}
          className="form-grid"
          style={{ marginTop: "1rem" }}
        >
          <div className="input-group">
            <label>Cliente *</label>
            <input
              type="text"
              placeholder="Nombre del cliente"
              value={formData.cliente}
              onChange={(e) =>
                setFormData({ ...formData, cliente: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label>Monto Total ($) *</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.total}
              onChange={(e) =>
                setFormData({ ...formData, total: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label>Fecha de Pedido *</label>
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
            />
          </div>
          <div className="input-group">
            <label>Estado</label>
            <select
              value={formData.estado}
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value })
              }
            >
              <option value="PENDIENTE">Pendiente</option>
              <option value="PAGADO">Pagado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div
            style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}
          >
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%" }}
            >
              {isEditing ? "Guardar" : "Crear"}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="glass">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </motion.div>

      <div className="glass" style={{ padding: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3>Lista de Pedidos</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={18} className="text-muted" />
            <select
              className="glass"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: "0.4rem", fontSize: "0.85rem" }}
            >
              <option value="">Filtro: Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="PAGADO">Pagados</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {pedidos.map((pedido) => (
                  <motion.tr
                    key={pedido.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                  >
                    <td>{pedido.fecha}</td>
                    <td style={{ fontWeight: 600 }}>{pedido.cliente}</td>
                    <td style={{ fontWeight: 700, color: "var(--accent)" }}>
                      ${pedido.total.toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${pedido.estado.toLowerCase()}`}
                      >
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        title="Ver"
                        onClick={() => setSelectedPedido(pedido)}
                        className="btn-icon"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="Editar"
                        onClick={() => handleEdit(pedido)}
                        className="btn-icon"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => handleDelete(pedido.id)}
                        className="btn-icon btn-delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {pedidos.length === 0 && !loading && (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-muted)",
              }}
            >
              No hay registros.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedPedido && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedPedido(null)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="modal-content glass"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1.5rem",
                }}
              >
                <h2>Detalle de Pedido</h2>
                <button
                  onClick={() => setSelectedPedido(null)}
                  className="btn-icon"
                >
                  <X />
                </button>
              </div>
              <div className="detail-row">
                <span className="detail-label">Orden #</span>
                <span className="detail-value">{selectedPedido.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Cliente</span>
                <span className="detail-value">{selectedPedido.cliente}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Total</span>
                <span
                  className="detail-value"
                  style={{ color: "var(--accent)", fontWeight: "700" }}
                >
                  ${selectedPedido.total.toFixed(2)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fecha</span>
                <span className="detail-value">{selectedPedido.fecha}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Estado</span>
                <span
                  className={`badge badge-${selectedPedido.estado.toLowerCase()}`}
                >
                  {selectedPedido.estado}
                </span>
              </div>
              <button
                className="btn-primary"
                style={{ width: "100%", marginTop: "2rem" }}
                onClick={() => setSelectedPedido(null)}
              >
                Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
