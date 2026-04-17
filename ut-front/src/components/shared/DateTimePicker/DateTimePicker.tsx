import React from 'react';
import styles from './DateTimePicker.module.css';

interface TimeSlot {
  value: string;
  label: string;
}

interface DateTimePickerProps {
  selectedDate?: string;
  selectedTime?: string;
  availableSlots?: TimeSlot[];
  unavailableSlots?: string[];
  onDateChange?: (date: string) => void;
  onTimeChange?: (time: string) => void;
}

const DEFAULT_SLOTS: TimeSlot[] = [
  { value: '08:00', label: '8:00 AM' },
  { value: '08:30', label: '8:30 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '09:30', label: '9:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '14:30', label: '2:30 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '15:30', label: '3:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '16:30', label: '4:30 PM' },
  { value: '17:00', label: '5:00 PM' },
];

export const DateTimePicker = ({
  selectedDate,
  selectedTime,
  availableSlots = DEFAULT_SLOTS,
  unavailableSlots = [],
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) => {
  const summary = (() => {
    if (!selectedDate && !selectedTime) return null;

    const parts: string[] = [];

    if (selectedDate) {
      const d = new Date(`${selectedDate}T00:00:00`);
      parts.push(
        d.toLocaleDateString([], {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    }

    if (selectedTime) {
      const slot = availableSlots.find((s) => s.value === selectedTime);
      if (slot) parts.push(`at ${slot.label}`);
    }

    return parts.join(' ');
  })();

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Date & Time</h2>
      <p className={styles.subtitle}>Pick a date and an available time slot.</p>

      <div className={styles.field}>
        <label className={styles.label}>Select Date</label>
        <input
          type="date"
          className={styles.dateInput}
          value={selectedDate ?? ''}
          onChange={(e) => onDateChange?.(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Select Time</label>
        <div className={styles.timeSlots}>
          {availableSlots.map((slot) => {
            const isUnavailable =
              unavailableSlots.includes(slot.label) ||
              unavailableSlots.includes(slot.value);

            return (
              <button
                key={slot.value}
                type="button"
                disabled={isUnavailable}
                className={[
                  styles.timeSlot,
                  selectedTime === slot.value ? styles.timeSlotSelected : '',
                  isUnavailable ? styles.timeSlotBooked : '',
                ].join(' ')}
                onClick={() => {
                  if (!isUnavailable) onTimeChange?.(slot.value);
                }}
              >
                {slot.label}
              </button>
            );
          })}
        </div>
      </div>

      {summary && (
        <div className={styles.summary}>
          <span className={styles.summaryIcon}>🗓️</span>
          <span>{summary}</span>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
