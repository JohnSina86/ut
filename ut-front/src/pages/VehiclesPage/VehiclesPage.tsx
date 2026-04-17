import React, { useState, useEffect } from 'react';
import { Footer }      from '../../components/layout/Footer/Footer';
import { Container }   from '../../components/layout/Container/Container';
import { Section }     from '../../components/layout/Section/Section';
import { Modal }       from '../../components/ui/Modal/Modal';
import { Spinner }     from '../../components/ui/Spinner/Spinner';
import { VehicleForm } from '../../components/shared/VehicleForm/VehicleForm';
import { vehiclesAPI } from '../../services/api';
import styles from './VehiclesPage.module.css';

interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  year?: number;
  colour?: string;
  fuel_type?: string;
  engine_size?: string;
  notes?: string;
}

const CarIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
       stroke="var(--color-text-grey)" strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);

export const VehiclesPage = () => {
  const [vehicles,        setVehicles]        = useState<Vehicle[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [addOpen,         setAddOpen]         = useState(false);
  const [editVehicle,     setEditVehicle]     = useState<Vehicle | null>(null);
  const [saving,          setSaving]          = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await vehiclesAPI.list();
      setVehicles(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleAdd = async (data: any) => {
    try {
      setSaving(true);
      const created = await vehiclesAPI.create({
        registration: data.registration,
        make:         data.make,
        model:        data.model,
        year:         data.year ? parseInt(data.year) : undefined,
        colour:       data.color,
        notes:        data.notes,
      });
      setVehicles(prev => [...prev, created]);
      setAddOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!editVehicle) return;
    try {
      setSaving(true);
      const updated = await vehiclesAPI.update(editVehicle.id, {
        registration: data.registration,
        make:         data.make,
        model:        data.model,
        year:         data.year ? parseInt(data.year) : undefined,
        colour:       data.color,
        notes:        data.notes,
      });
      setVehicles(prev => prev.map(v => v.id === editVehicle.id ? updated : v));
      setEditVehicle(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await vehiclesAPI.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
      setConfirmDeleteId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete vehicle');
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Section title="My Vehicles">
          <Container>

            {error && (
              <div className={styles.errorBanner}>
                {error}
                <button onClick={() => setError('')} className={styles.errorClose}>×</button>
              </div>
            )}

            <div className={styles.topBar}>
              <p className={styles.count}>{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} saved</p>
              <button className={styles.addBtn} onClick={() => setAddOpen(true)}>+ Add Vehicle</button>
            </div>

            {loading ? (
              <div className={styles.spinnerWrap}><Spinner /></div>
            ) : (
              <div className={styles.grid}>
                {vehicles.length === 0 && (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}><CarIcon /></span>
                    <h3 className={styles.emptyTitle}>No vehicles yet</h3>
                    <p className={styles.emptyText}>Add your first vehicle to get started with bookings.</p>
                    <button className={styles.addBtn} onClick={() => setAddOpen(true)}>+ Add Vehicle</button>
                  </div>
                )}

                {vehicles.map(v => (
                  <div key={v.id} className={styles.vehicleCard}>
                    <div className={styles.vehicleIcon}><CarIcon /></div>
                    <div className={styles.vehicleBody}>
                      <span className={styles.vehiclePlate}>{v.registration}</span>
                      <h3 className={styles.vehicleName}>
                        {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Unknown Vehicle'}
                      </h3>
                      <p className={styles.vehicleInfo}>
                        {[v.fuel_type, v.engine_size, v.colour].filter(Boolean).join(' · ') || 'No additional details'}
                      </p>
                    </div>
                    <div className={styles.vehicleActions}>
                      {confirmDeleteId === v.id ? (
                        <>
                          <span className={styles.confirmLabel}>Remove this vehicle?</span>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(v.id)}>Yes</button>
                          <button className={styles.editBtn}   onClick={() => setConfirmDeleteId(null)}>No</button>
                        </>
                      ) : (
                        <>
                          <button className={styles.editBtn}   onClick={() => setEditVehicle(v)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => setConfirmDeleteId(v.id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </Container>
        </Section>
      </main>

      <Modal isOpen={addOpen} title="Add New Vehicle" onClose={() => setAddOpen(false)}>
        <VehicleForm
          onSubmit={handleAdd}
          onCancel={() => setAddOpen(false)}
          submitLabel="Add Vehicle"
          isLoading={saving}
        />
      </Modal>

      <Modal isOpen={!!editVehicle} title="Edit Vehicle" onClose={() => setEditVehicle(null)}>
        <VehicleForm
          initialData={editVehicle ? {
            registration: editVehicle.registration,
            make:  editVehicle.make,
            model: editVehicle.model,
            year:  editVehicle.year?.toString(),
            color: editVehicle.colour,
            notes: editVehicle.notes,
          } : {}}
          onSubmit={handleEdit}
          onCancel={() => setEditVehicle(null)}
          submitLabel="Save Changes"
          isLoading={saving}
        />
      </Modal>

      <Footer copyright={`© ${new Date().getFullYear()} United Tyres Dundrum.`} />
    </div>
  );
};

export default VehiclesPage;
