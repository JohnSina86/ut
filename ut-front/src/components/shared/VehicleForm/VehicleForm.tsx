import React, { useState } from 'react';
import { vehiclesAPI } from '../../../services/api';
import styles from './VehicleForm.module.css';

interface VehicleFormData {
  registration: string;
  make: string;
  model: string;
  year: string;
  color?: string;
  notes?: string;
}

interface VehicleFormProps {
  initialData?: Partial<VehicleFormData>;
  onSubmit: (data: VehicleFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export const VehicleForm = ({
  initialData = {}, onSubmit, onCancel, submitLabel = 'Save Vehicle', isLoading = false,
}: VehicleFormProps) => {
  const [form, setForm] = useState<VehicleFormData>({
    registration: initialData.registration ?? '',
    make:         initialData.make         ?? '',
    model:        initialData.model        ?? '',
    year:         initialData.year         ?? '',
    color:        initialData.color        ?? '',
    notes:        initialData.notes        ?? '',
  });
  const [lookupReg, setLookupReg] = useState('');
  const [looking,   setLooking]   = useState(false);
  const [lookupMsg, setLookupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLookup = async () => {
    const reg = lookupReg.trim();
    if (!reg) return;
    setLooking(true);
    setLookupMsg(null);
    try {
      const data = await vehiclesAPI.lookup(reg);

      const make  = data.make  || '';
      const model = data.model || '';
      const year  = data.year  ? String(data.year) : '';

      setForm((prev) => ({
        ...prev,
        registration: data.registration ?? prev.registration,
        make:  make  || prev.make,
        model: model || prev.model,
        year:  year  || prev.year,
        color: data.colour ?? prev.color,
      }));

      if (make && model) {
        setLookupMsg({ type: 'success', text: `Found: ${year} ${make} ${model}${data.colour ? ' · ' + data.colour : ''}` });
      } else if (year) {
        setLookupMsg({ type: 'error', text: `Found year: ${year} — make and model not available from reg. Please fill in manually.` });
      } else {
        setLookupMsg({ type: 'error', text: 'Could not find vehicle details. Please fill in manually.' });
      }
    } catch (err: any) {
      setLookupMsg({ type: 'error', text: err.message || 'Lookup failed — fill in manually.' });
    } finally {
      setLooking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.make?.trim()) {
      setLookupMsg({ type: 'error', text: 'Make is required — please fill it in manually.' });
      return;
    }
    if (!form.model?.trim()) {
      setLookupMsg({ type: 'error', text: 'Model is required — please fill it in manually.' });
      return;
    }
    onSubmit(form);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

      {/* Reg Lookup */}
      <div className={styles.lookupRow}>
        <div className={styles.lookupInputWrap}>
          <label className={styles.label}>Irish Registration Plate</label>
          <input
            className={`${styles.input} ${styles.plateInput}`}
            value={lookupReg}
            onChange={(e) => setLookupReg(e.target.value.toUpperCase())}
            placeholder="e.g. 231-D-12345"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLookup())}
          />
        </div>
        <button
          type="button"
          className={styles.lookupBtn}
          onClick={handleLookup}
          disabled={looking || !lookupReg.trim()}
        >
          {looking ? '...' : '🔍 Look Up'}
        </button>
      </div>

      {lookupMsg && (
        <div className={`${styles.lookupMsg} ${lookupMsg.type === 'error' ? styles.lookupMsgError : styles.lookupMsgSuccess}`}>
          {lookupMsg.text}
        </div>
      )}

      <div className={styles.divider} />

      {/* Manual fields */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Registration *</label>
          <input className={styles.input} name="registration" value={form.registration}
            onChange={handleChange} placeholder="e.g. 231D12345" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Year</label>
          <input className={styles.input} name="year" value={form.year}
            onChange={handleChange} placeholder="e.g. 2023" />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Make *</label>
          <input className={`${styles.input} ${!form.make ? styles.inputRequired : ''}`}
            name="make" value={form.make}
            onChange={handleChange} placeholder="e.g. Toyota" required />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Model *</label>
          <input className={`${styles.input} ${!form.model ? styles.inputRequired : ''}`}
            name="model" value={form.model}
            onChange={handleChange} placeholder="e.g. Yaris" required />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Colour</label>
        <input className={styles.input} name="color" value={form.color}
          onChange={handleChange} placeholder="e.g. Silver" />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Notes</label>
        <textarea className={styles.textarea} name="notes" value={form.notes}
          onChange={handleChange} placeholder="Any additional details..." rows={3} />
      </div>

      <div className={styles.actions}>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        )}
        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
