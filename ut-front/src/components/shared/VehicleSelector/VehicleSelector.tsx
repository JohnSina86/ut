import React from 'react';
import styles from './VehicleSelector.module.css';

export interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  year?: number | string;
  colour?: string;
  color?: string;
  fuel_type?: string;
  engine_size?: string;
}

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedId?: string;
  onChange: (vehicle: Vehicle) => void;
  onAddNew?: () => void;
}

export const VehicleSelector = ({
  vehicles,
  selectedId,
  onChange,
  onAddNew,
}: VehicleSelectorProps) => {
  return (
    <div className={styles.selector}>
      <div className={styles.grid}>
        {vehicles.map((v) => {
          const isSelected = String(v.id) === String(selectedId);
          const colourInfo = v.colour || v.color;
          const details = [v.fuel_type, v.engine_size, colourInfo].filter(Boolean).join(' · ');
          return (
            <button
              key={v.id}
              type="button"
              className={`${styles.vehicleCard} ${isSelected ? styles.vehicleCardSelected : ''}`}
              onClick={() => onChange(v)}
            >
              <div className={styles.checkmark}>✓</div>
              <div className={styles.vehicleIcon}>🚗</div>
              <span className={styles.vehiclePlate}>{v.registration}</span>
              <p className={styles.vehicleName}>
                {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Unknown Vehicle'}
              </p>
              {details && <p className={styles.vehicleInfo}>{details}</p>}
            </button>
          );
        })}

        {onAddNew && (
          <button type="button" className={styles.addCard} onClick={onAddNew}>
            <span className={styles.addIcon}>＋</span>
            <span>Add New Vehicle</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VehicleSelector;
