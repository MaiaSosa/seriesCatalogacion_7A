"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Plataforma = {
  id: number;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
};

type Serie = {
  id: number;
  nombre: string;
  plataformaId: number;
  plataforma?: { id: number; nombre: string };
};

type Valoracion = {
  id: number;
  plataformaId: number;
  serieId: number;
  puntaje: number;
  observacion: string;
  plataforma?: { id: number; nombre: string };
  serie?: { id: number; nombre: string; plataformaId: number };
};

type StatusMessage = {
  type: "success" | "error";
  message: string;
} | null;

const initialPlatformForm = { id: 0, nombre: "" };
const initialSerieForm = { id: 0, nombre: "", plataformaId: 0 };
const initialValoracionForm = {
  id: 0,
  plataformaId: 0,
  serieId: 0,
  puntaje: 8,
  observacion: ""
};

export default function HomePage() {
  const [platforms, setPlatforms] = useState<Plataforma[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([]);
  const [platformForm, setPlatformForm] = useState(initialPlatformForm);
  const [serieForm, setSerieForm] = useState(initialSerieForm);
  const [valoracionForm, setValoracionForm] = useState(initialValoracionForm);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [platformsResponse, seriesResponse, valoracionesResponse] = await Promise.all([
        fetch("/api/plataformas"),
        fetch("/api/series"),
        fetch("/api/valoraciones")
      ]);

      if (!platformsResponse.ok || !seriesResponse.ok || !valoracionesResponse.ok) {
        throw new Error("Hubo un problema al cargar los datos.");
      }

      const platformsData = await platformsResponse.json();
      const seriesData = await seriesResponse.json();
      const valoracionesData = await valoracionesResponse.json();

      setPlatforms(platformsData.data ?? []);
      setSeries(seriesData.data ?? []);
      setValoraciones(valoracionesData.data ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar la información.";
      setStatus({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const sortedSeries = useMemo(
    () => [...series].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [series]
  );

  const sortedPlatforms = useMemo(
    () => [...platforms].sort((a, b) => a.nombre.localeCompare(b.nombre)),
    [platforms]
  );

  const canSaveValoracion = Number(valoracionForm.puntaje) >= 1 && Number(valoracionForm.puntaje) <= 10;

  const createPlatform = async () => {
    try {
      const nombre = platformForm.nombre.trim();
      if (!nombre) {
        setStatus({ type: "error", message: "Debes ingresar un nombre para la plataforma." });
        return;
      }

      const response = await fetch("/api/plataformas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear la plataforma.");
      }

      setStatus({ type: "success", message: "Plataforma registrada correctamente." });
      setPlatformForm(initialPlatformForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar la plataforma.";
      setStatus({ type: "error", message });
    }
  };

  const editPlatform = (platform: Plataforma) => {
    setPlatformForm({ id: platform.id, nombre: platform.nombre });
  };

  const updatePlatform = async () => {
    try {
      const nombre = platformForm.nombre.trim();
      if (!platformForm.id || !nombre) {
        setStatus({ type: "error", message: "Selecciona una plataforma válida para editar." });
        return;
      }

      const response = await fetch(`/api/plataformas/${platformForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo actualizar la plataforma.");
      }

      setStatus({ type: "success", message: "Plataforma actualizada correctamente." });
      setPlatformForm(initialPlatformForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la plataforma.";
      setStatus({ type: "error", message });
    }
  };

  const deletePlatform = async (id: number) => {
    try {
      const response = await fetch(`/api/plataformas/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo eliminar la plataforma.");
      }

      setStatus({ type: "success", message: "Plataforma eliminada correctamente." });
      setPlatformForm(initialPlatformForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar la plataforma.";
      setStatus({ type: "error", message });
    }
  };

  const createSerie = async () => {
    try {
      const nombre = serieForm.nombre.trim();
      if (!nombre || !serieForm.plataformaId) {
        setStatus({ type: "error", message: "Debes indicar el nombre y la plataforma de la serie." });
        return;
      }

      const response = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, plataformaId: Number(serieForm.plataformaId) })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear la serie.");
      }

      setStatus({ type: "success", message: "Serie registrada correctamente." });
      setSerieForm(initialSerieForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar la serie.";
      setStatus({ type: "error", message });
    }
  };

  const editSerie = (item: Serie) => {
    setSerieForm({ id: item.id, nombre: item.nombre, plataformaId: item.plataformaId ?? 0 });
  };

  const updateSerie = async () => {
    try {
      const nombre = serieForm.nombre.trim();
      if (!serieForm.id || !nombre || !serieForm.plataformaId) {
        setStatus({ type: "error", message: "Selecciona una serie válida para editar." });
        return;
      }

      const response = await fetch(`/api/series/${serieForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, plataformaId: Number(serieForm.plataformaId) })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo actualizar la serie.");
      }

      setStatus({ type: "success", message: "Serie actualizada correctamente." });
      setSerieForm(initialSerieForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la serie.";
      setStatus({ type: "error", message });
    }
  };

  const deleteSerie = async (id: number) => {
    try {
      const response = await fetch(`/api/series/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo eliminar la serie.");
      }

      setStatus({ type: "success", message: "Serie eliminada correctamente." });
      setSerieForm(initialSerieForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar la serie.";
      setStatus({ type: "error", message });
    }
  };

  const createValoracion = async () => {
    try {
      const puntaje = Number(valoracionForm.puntaje);
      const observacion = valoracionForm.observacion.trim();

      if (!valoracionForm.plataformaId || !valoracionForm.serieId) {
        setStatus({ type: "error", message: "Debes seleccionar una plataforma y una serie." });
        return;
      }

      if (!canSaveValoracion) {
        setStatus({ type: "error", message: "El puntaje debe estar entre 1 y 10." });
        return;
      }

      const response = await fetch("/api/valoraciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plataformaId: Number(valoracionForm.plataformaId),
          serieId: Number(valoracionForm.serieId),
          puntaje,
          observacion
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo crear la valoración.");
      }

      setStatus({ type: "success", message: "Valoración registrada correctamente." });
      setValoracionForm(initialValoracionForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo registrar la valoración.";
      setStatus({ type: "error", message });
    }
  };

  const editValoracion = (item: Valoracion) => {
    setValoracionForm({
      id: item.id,
      plataformaId: item.plataformaId ?? 0,
      serieId: item.serieId ?? 0,
      puntaje: item.puntaje ?? 8,
      observacion: item.observacion ?? ""
    });
  };

  const updateValoracion = async () => {
    try {
      const puntaje = Number(valoracionForm.puntaje);
      const observacion = valoracionForm.observacion.trim();

      if (!valoracionForm.id || !valoracionForm.plataformaId || !valoracionForm.serieId) {
        setStatus({ type: "error", message: "Selecciona una valoración válida para editar." });
        return;
      }

      if (puntaje < 1 || puntaje > 10) {
        setStatus({ type: "error", message: "El puntaje debe estar entre 1 y 10." });
        return;
      }

      const response = await fetch(`/api/valoraciones/${valoracionForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plataformaId: Number(valoracionForm.plataformaId),
          serieId: Number(valoracionForm.serieId),
          puntaje,
          observacion
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo actualizar la valoración.");
      }

      setStatus({ type: "success", message: "Valoración actualizada correctamente." });
      setValoracionForm(initialValoracionForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la valoración.";
      setStatus({ type: "error", message });
    }
  };

  const deleteValoracion = async (id: number) => {
    try {
      const response = await fetch(`/api/valoraciones/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "No se pudo eliminar la valoración.");
      }

      setStatus({ type: "success", message: "Valoración eliminada correctamente." });
      setValoracionForm(initialValoracionForm);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar la valoración.";
      setStatus({ type: "error", message });
    }
  };

  return (
    <main className="page-shell">
      <header className="topbar">
        <h1>Series Catalogación 7A</h1>
        <p>Administra plataformas, series y valoraciones en una sola interfaz.</p>
      </header>

      {status ? <div className={`status ${status.type}`}>{status.message}</div> : null}

      <section className="grid">
        <article className="section-card">
          <div className="section-header">
            <h2>Plataformas</h2>
            <p>Registra y administra las plataformas disponibles.</p>
          </div>

          <div className="section-body">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="platform-name">Nombre de la plataforma</label>
                <input
                  id="platform-name"
                  value={platformForm.nombre}
                  onChange={(event) => setPlatformForm((current) => ({ ...current, nombre: event.target.value }))}
                  placeholder="Netflix, Prime Video, Disney+..."
                />
              </div>
              <div className="actions">
                {platformForm.id ? (
                  <>
                    <button className="primary-btn" onClick={updatePlatform} type="button">Guardar cambios</button>
                    <button className="secondary-btn" onClick={() => setPlatformForm(initialPlatformForm)} type="button">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button className="primary-btn" onClick={createPlatform} type="button">Registrar plataforma</button>
                )}
              </div>
            </div>

            <div className="list">
              {sortedPlatforms.length === 0 ? (
                <p className="empty-state">No hay plataformas registradas aún.</p>
              ) : (
                sortedPlatforms.map((platform) => (
                  <div key={platform.id} className="item-card">
                    <div className="item-main">
                      <h3 className="item-title">{platform.nombre}</h3>
                      <p className="item-meta">ID: {platform.id}</p>
                    </div>
                    <div className="item-actions">
                      <button className="secondary-btn" type="button" onClick={() => editPlatform(platform)}>Editar</button>
                      <button className="danger-btn" type="button" onClick={() => deletePlatform(platform.id)}>Eliminar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        <article className="section-card">
          <div className="section-header">
            <h2>Series</h2>
            <p>Asocia cada serie con su plataforma.</p>
          </div>

          <div className="section-body">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="serie-name">Nombre de la serie</label>
                <input
                  id="serie-name"
                  value={serieForm.nombre}
                  onChange={(event) => setSerieForm((current) => ({ ...current, nombre: event.target.value }))}
                  placeholder="The Crown"
                />
              </div>

              <div className="field">
                <label htmlFor="serie-platform">Plataforma asociada</label>
                <select
                  id="serie-platform"
                  value={serieForm.plataformaId || ""}
                  onChange={(event) =>
                    setSerieForm((current) => ({ ...current, plataformaId: Number(event.target.value) || 0 }))
                  }
                >
                  <option value="">Selecciona una plataforma</option>
                  {sortedPlatforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="actions">
                {serieForm.id ? (
                  <>
                    <button className="primary-btn" onClick={updateSerie} type="button">Guardar cambios</button>
                    <button className="secondary-btn" onClick={() => setSerieForm(initialSerieForm)} type="button">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button className="primary-btn" onClick={createSerie} type="button">Registrar serie</button>
                )}
              </div>
            </div>

            <div className="list">
              {sortedSeries.length === 0 ? (
                <p className="empty-state">No hay series registradas todavía.</p>
              ) : (
                sortedSeries.map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="item-main">
                      <h3 className="item-title">{item.nombre}</h3>
                      <p className="item-meta">Plataforma: {item.plataforma?.nombre ?? "Sin plataforma"}</p>
                    </div>
                    <div className="item-actions">
                      <button className="secondary-btn" type="button" onClick={() => editSerie(item)}>Editar</button>
                      <button className="danger-btn" type="button" onClick={() => deleteSerie(item.id)}>Eliminar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        <article className="section-card">
          <div className="section-header">
            <h2>Valoraciones</h2>
            <p>Registra un puntaje con observación y verifica la plataforma correspondiente.</p>
          </div>

          <div className="section-body">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="rating-platform">Plataforma</label>
                <select
                  id="rating-platform"
                  value={valoracionForm.plataformaId || ""}
                  onChange={(event) =>
                    setValoracionForm((current) => ({ ...current, plataformaId: Number(event.target.value) || 0 }))
                  }
                >
                  <option value="">Selecciona una plataforma</option>
                  {sortedPlatforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="rating-series">Serie</label>
                <select
                  id="rating-series"
                  value={valoracionForm.serieId || ""}
                  onChange={(event) =>
                    setValoracionForm((current) => ({ ...current, serieId: Number(event.target.value) || 0 }))
                  }
                >
                  <option value="">Selecciona una serie</option>
                  {sortedSeries.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="rating-score">Puntaje</label>
                <input
                  id="rating-score"
                  type="number"
                  min={1}
                  max={10}
                  value={valoracionForm.puntaje}
                  onChange={(event) =>
                    setValoracionForm((current) => ({ ...current, puntaje: Number(event.target.value) || 0 }))
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="rating-observation">Observación</label>
                <textarea
                  id="rating-observation"
                  value={valoracionForm.observacion}
                  onChange={(event) =>
                    setValoracionForm((current) => ({ ...current, observacion: event.target.value }))
                  }
                  placeholder="Describe tu reseña o experiencia."
                />
              </div>

              {!canSaveValoracion && valoracionForm.puntaje !== 0 ? (
                <div className="status error">El puntaje debe estar entre 1 y 10.</div>
              ) : null}

              <div className="actions">
                {valoracionForm.id ? (
                  <>
                    <button className="primary-btn" onClick={updateValoracion} type="button">Guardar cambios</button>
                    <button className="secondary-btn" onClick={() => setValoracionForm(initialValoracionForm)} type="button">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button className="primary-btn" onClick={createValoracion} type="button">Registrar valoración</button>
                )}
              </div>
            </div>

            <div className="list">
              {valoraciones.length === 0 ? (
                <p className="empty-state">No hay valoraciones registradas todavía.</p>
              ) : (
                valoraciones.map((item) => (
                  <div key={item.id} className="item-card">
                    <div className="item-main">
                      <h3 className="item-title">{item.serie?.nombre ?? "Serie desconocida"}</h3>
                      <p className="item-meta">
                        Plataforma: {item.plataforma?.nombre ?? "Sin plataforma"} · Puntaje: {item.puntaje}/10
                      </p>
                      <p className="item-meta">Observación: {item.observacion || "Sin observación"}</p>
                    </div>
                    <div className="item-actions">
                      <button className="secondary-btn" type="button" onClick={() => editValoracion(item)}>Editar</button>
                      <button className="danger-btn" type="button" onClick={() => deleteValoracion(item.id)}>Eliminar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </section>

      {loading ? <div className="status success">Cargando información...</div> : null}
    </main>
  );
}
