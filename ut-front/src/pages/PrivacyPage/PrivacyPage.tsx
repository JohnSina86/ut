import React from 'react';
import { Footer } from '../../components/layout/Footer/Footer';
import { Container } from '../../components/layout/Container/Container';
import { Section } from '../../components/layout/Section/Section';
import styles from './PrivacyPage.module.css';

const SECTIONS = [
  {
    id: 'collection',
    title: '1. Information We Collect',
    content: 'We collect information you provide when creating an account or making a booking, including your name, email address, phone number, and vehicle details. We also collect usage data such as pages visited and features used.',
  },
  {
    id: 'usage',
    title: '2. How We Use Your Information',
    content: 'We use your information to process bookings, send appointment confirmations and reminders, improve our service, and communicate with you about offers (with your consent).',
  },
  {
    id: 'sharing',
    title: '3. Data Sharing',
    content: 'We do not sell your personal data. We may share data with trusted third-party service providers (e.g., payment processors, email providers) strictly for the purpose of delivering our service.',
  },
  {
    id: 'cookies',
    title: '4. Cookies',
    content: 'We use cookies to improve your browsing experience. You can control cookie settings through your browser. Disabling cookies may affect some functionality.',
  },
  {
    id: 'retention',
    title: '5. Data Retention',
    content: 'We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your data at any time.',
  },
  {
    id: 'gdpr',
    title: '6. Your Rights (GDPR)',
    content: null,
  },
  {
    id: 'contact',
    title: '7. Contact',
    content: null,
  },
];

export const PrivacyPage = () => {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Section title="Privacy Policy">
          <Container maxWidth="md">
            <p className={styles.lastUpdated}>Last updated: January 2025</p>
            <div className={styles.layout}>

              {/* Sticky TOC */}
              <nav className={styles.toc} aria-label="Table of contents">
                <p className={styles.tocTitle}>On this page</p>
                {SECTIONS.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className={styles.tocItem}>
                    {s.title}
                  </a>
                ))}
              </nav>

              {/* Content */}
              <div className={styles.content}>
                {SECTIONS.map((s) => (
                  <div key={s.id} id={s.id} className={styles.section}>
                    <h2 className={styles.sectionTitle}>{s.title}</h2>
                    <div className={styles.prose}>
                      {s.id === 'gdpr' ? (
                        <p>Under GDPR, you have the right to access, correct, delete, and port your personal data. To exercise these rights, contact us at <a href="mailto:privacy@unitedtyres.ie">privacy@unitedtyres.ie</a>.</p>
                      ) : s.id === 'contact' ? (
                        <p>For privacy-related inquiries, contact our Data Protection Officer at <a href="mailto:privacy@unitedtyres.ie">privacy@unitedtyres.ie</a>.</p>
                      ) : (
                        <p>{s.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </Container>
        </Section>
      </main>
    </div>
  );
};

export default PrivacyPage;
