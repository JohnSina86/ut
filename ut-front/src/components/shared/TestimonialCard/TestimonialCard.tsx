import React from 'react';
import styles from './TestimonialCard.module.css';

interface TestimonialCardProps {
  name: string;
  role?: string;
  avatarUrl?: string;
  comment: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date?: string;
}

export const TestimonialCard = ({
  name,
  role,
  avatarUrl,
  comment,
  rating,
  date,
}: TestimonialCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.stars}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < rating ? styles.starFilled : styles.starEmpty}>★
          </span>
        ))}
      </div>
      <p className={styles.comment}>"{comment}"</p>
      <div className={styles.author}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={styles.authorInfo}>
          <span className={styles.name}>{name}</span>
          {role && <span className={styles.role}>{role}</span>}
          {date && <span className={styles.date}>{date}</span>}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
