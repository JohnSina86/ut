import React from 'react';
import styles from './HowItWorksStep.module.css';

interface HowItWorksStepProps {
  step: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  isLast?: boolean;
}

export const HowItWorksStep = ({
  step,
  title,
  description,
  icon,
  isLast = false,
}: HowItWorksStepProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <div className={styles.bubble}>
          {icon ?? <span className={styles.stepNumber}>{step}</span>}
        </div>
        {!isLast && <div className={styles.connector} />}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
};

export default HowItWorksStep;
