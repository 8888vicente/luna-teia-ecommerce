'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { RepartidorRow } from '@/lib/crm/types';
import { crearRepartidorAction, editarRepartidorAction } from '@/lib/admin/repartidoresActions';
import styles from './RepartidoresList.module.css';

type AuthUser = {
  id: string;
  email?: string;
  name?: string;
};

type Props = {
  initialRepartidores: RepartidorRow[];
  authUsers: AuthUser[];
};

const CIUDADES_DISPONIBLES = ['Cd. Juarez', 'Saltillo', 'Hermosillo', 'Chihuahua', 'Monterrey'];

export function RepartidoresList({ initialRepartidores, authUsers }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRepartidor, setEditingRepartidor] = useState<RepartidorRow | null>(null);

  // Form State
  const [formNombre, setFormNombre] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formCiudad, setFormCiudad] = useState('Cd. Juarez');
  const [formActivo, setFormActivo] = useState(true);
  const [formUserId, setFormUserId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setFormNombre('');
    setFormTelefono('');
    setFormCiudad('Cd. Juarez');
    setFormActivo(true);
    setFormUserId('');
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (r: RepartidorRow) => {
    setEditingRepartidor(r);
    setFormNombre(r.nombre);
    setFormTelefono(r.telefono);
    setFormCiudad(r.ciudad);
    setFormActivo(r.activo);
    setFormUserId(r.user_id || '');
    setFormError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formNombre.trim()) return setFormError('El nombre es obligatorio');
    if (!formTelefono.trim()) return setFormError('El teléfono es obligatorio');
    if (!formCiudad.trim()) return setFormError('La ciudad es obligatoria');

    const inputData = {
      nombre: formNombre.trim(),
      telefono: formTelefono.trim(),
      ciudad: formCiudad,
      activo: formActivo,
      user_id: formUserId || null,
    };

    startTransition(async () => {
      let res;
      if (editingRepartidor) {
        res = await editarRepartidorAction(editingRepartidor.id, inputData);
      } else {
        res = await crearRepartidorAction(inputData);
      }

      if (res.ok) {
        setIsAddOpen(false);
        setEditingRepartidor(null);
        router.refresh();
      } else {
        setFormError(res.error || 'Error al guardar los datos');
      }
    });
  };

  // Filtrado de repartidores
  const filteredRepartidores = initialRepartidores.filter((r) => {
    const matchesSearch = r.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.telefono.includes(searchQuery);
    const matchesCity = cityFilter === '' || r.ciudad === cityFilter;
    return matchesSearch && matchesCity;
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Gestión de Repartidores</h1>
          <p className={styles.subtitle}>
            Administra los repartidores de cada ciudad, activa/desactiva cuentas y vincula usuarios de Supabase.
          </p>
        </div>
        <button onClick={handleOpenAdd} className={styles.addBtn}>
          ➕ Agregar Repartidor
        </button>
      </header>

      {/* Barra de filtros */}
      <section className={styles.filtersBar}>
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className={styles.selectInput}
        >
          <option value="">Todas las ciudades</option>
          {CIUDADES_DISPONIBLES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </section>

      {/* Listado de Repartidores */}
      <section className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Ciudad</th>
              <th>Teléfono</th>
              <th>Usuario Vinculado</th>
              <th>Estado</th>
              <th className={styles.textRight}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRepartidores.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  No se encontraron repartidores con los filtros actuales.
                </td>
              </tr>
            ) : (
              filteredRepartidores.map((r) => {
                const linkedUser = authUsers.find((u) => u.id === r.user_id);
                return (
                  <tr key={r.id} className={!r.activo ? styles.inactiveRow : ''}>
                    <td>
                      <strong className={styles.repName}>{r.nombre}</strong>
                    </td>
                    <td>
                      <span className={styles.cityBadge}>{r.ciudad}</span>
                    </td>
                    <td>{r.telefono}</td>
                    <td className={styles.linkedUser}>
                      {linkedUser ? (
                        <span>📧 {linkedUser.email}</span>
                      ) : (
                        <span className={styles.unlinked}>Sin cuenta vinculada</span>
                      )}
                    </td>
                    <td>
                      <span className={[styles.status, r.activo ? styles.active : styles.inactive].join(' ')}>
                        {r.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={[styles.textRight, styles.actionsCell].join(' ')}>
                      <button onClick={() => handleOpenEdit(r)} className={styles.editBtn}>
                        ✏️ Editar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* Modal Agregar/Editar Repartidor */}
      {(isAddOpen || editingRepartidor !== null) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <h2>{editingRepartidor ? 'Editar Repartidor' : 'Agregar Nuevo Repartidor'}</h2>
              <button 
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingRepartidor(null);
                }} 
                className={styles.closeBtn}
              >
                ×
              </button>
            </header>

            <form onSubmit={handleSave} className={styles.form}>
              {formError && (
                <div className={styles.formError} role="alert">
                  ⚠️ {formError}
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="nombre">Nombre completo</label>
                <input
                  type="text"
                  id="nombre"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej: Juan Juárez"
                  disabled={isPending}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="telefono">Número de teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  id="telefono"
                  value={formTelefono}
                  onChange={(e) => setFormTelefono(e.target.value)}
                  placeholder="Ej: 6620000001"
                  disabled={isPending}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="ciudad">Ciudad de operación</label>
                <select
                  id="ciudad"
                  value={formCiudad}
                  onChange={(e) => setFormCiudad(e.target.value)}
                  disabled={isPending}
                >
                  {CIUDADES_DISPONIBLES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="userId">Cuenta de Usuario (Supabase Auth)</label>
                <select
                  id="userId"
                  value={formUserId}
                  onChange={(e) => setFormUserId(e.target.value)}
                  disabled={isPending}
                >
                  <option value="">-- No vincular cuenta --</option>
                  {authUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                <small className={styles.helpText}>
                  Permite al repartidor iniciar sesión y ver su ruta asignada.
                </small>
              </div>

              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="activo"
                  checked={formActivo}
                  onChange={(e) => setFormActivo(e.target.checked)}
                  disabled={isPending}
                />
                <label htmlFor="activo">Repartidor activo en el sistema</label>
              </div>

              <footer className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingRepartidor(null);
                  }}
                  className={styles.cancelBtn}
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isPending}
                >
                  {isPending ? 'Guardando...' : 'Guardar Repartidor'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
