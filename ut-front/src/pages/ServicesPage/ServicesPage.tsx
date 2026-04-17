import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/layout/Container/Container';
import { Section } from '../../components/layout/Section/Section';
import { ServiceCard } from '../../components/shared/ServiceCard/ServiceCard';
import { servicesAPI } from '../../services/api';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import styles from './ServicesPage.module.css';

const CATEGORIES = [
  { label: 'All',         value: 'all'         },
  { label: 'Tyres',       value: 'tyre'        },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Repairs',     value: 'repair'      },
];

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await servicesAPI.list();
        setServices(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filtered = activeCategory === 'all'
    ? services
    : services.filter((s: any) => s.category === activeCategory);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
            
        <Section title="Our Services" subtitle="Choose the service you need and book online instantly.">
          <Container>

            {/* Category filter bar */}
            <div className={styles.filterBar}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  className={`${styles.filterBtn} ${activeCategory === cat.value ? styles.filterActive : ''}`}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            

            {loading ? (
              <div className={styles.loadingContainer}>
                <Spinner />
              </div>
            ) : error ? (
              <div className={styles.error}>{error}</div>
            ) : (
              <div className={styles.grid}>
                {filtered.map(service => (
                  <ServiceCard
                    key={service.id}
                    name={service.name}
                    duration={Number(service.duration_minutes) || 0}
                    price={Number(service.price) || 0}
                    selected={selectedId === service.id}
                    onSelect={() => navigate(`/booking?service=${service.id}`)}
                  />
                ))}
              </div>
            )}

            
            
            
            

          </Container>
        </Section>
      </main>
    </div>
  );
};

export default ServicesPage;
