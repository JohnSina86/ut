import React from 'react';
import { Footer } from '../../components/layout/Footer/Footer';
import { Container } from '../../components/layout/Container/Container';
import { Section } from '../../components/layout/Section/Section';
import styles from './TermsPage.module.css';

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: 'By using the United Tyres Dundrum website and booking service, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our service.',
  },
  {
    id: 'booking',
    title: '2. Booking & Cancellations',
    content: 'Bookings can be made online and are subject to availability. Cancellations must be made at least 24 hours before the scheduled appointment. Failure to cancel within this period may result in a cancellation fee.',
  },
  {
    id: 'payment',
    title: '3. Payment',
    content: 'Payment is due at the time of service. We accept cash and all major credit/debit cards. Prices displayed online are estimates; final pricing may vary based on vehicle inspection.',
  },
  {
    id: 'liability',
    title: '4. Liability',
    content: 'United Tyres Dundrum is not liable for any indirect, incidental, or consequential damages arising from the use of our service. Our total liability is limited to the amount paid for the service in question.',
  },
  {
    id: 'ip',
    title: '5. Intellectual Property',
    content: 'All content on this website — including text, graphics, logos, and images — is the property of United Tyres Dundrum and is protected by applicable intellectual property laws.',
  },
  {
    id: 'changes',
    title: '6. Changes to Terms',
    content: 'We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated revision date.',
  },
  {
    id: 'contact',
    title: '7. Contact',
    content: null,
  },
];

export const TermsPage = () => {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Section title="Terms &amp; Conditions">
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
                      {s.id === 'contact' ? (
                        <p>
                          If you have questions about these terms, please contact us at{' '}
                          <a href="mailto:info@unitedtyres.ie">info@unitedtyres.ie</a>.
                        </p>
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

export default TermsPage;
