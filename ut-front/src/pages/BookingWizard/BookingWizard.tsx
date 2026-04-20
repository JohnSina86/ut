import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Footer }          from '../../components/layout/Footer/Footer';
import { Container }       from '../../components/layout/Container/Container';
import { Section }         from '../../components/layout/Section/Section';
import { ServiceCard }     from '../../components/shared/ServiceCard/ServiceCard';
import { VehicleSelector } from '../../components/shared/VehicleSelector/VehicleSelector';
import { VehicleForm }     from '../../components/shared/VehicleForm/VehicleForm';
import { DateTimePicker }  from '../../components/shared/DateTimePicker/DateTimePicker';
import { BookingSummary }  from '../../components/shared/BookingSummary/BookingSummary';
import { PaymentMethodSelector } from '../../components/shared/PaymentMethodSelector/PaymentMethodSelector';
import { Spinner }         from '../../components/ui/Spinner/Spinner';
import { servicesAPI, vehiclesAPI, appointmentsAPI } from '../../services/api';
import styles from './BookingWizard.module.css';

const STEPS = [
  { label: 'Service'     },
  { label: 'Vehicle'     },
  { label: 'Date & Time' },
  { label: 'Confirm'     },
];

export const BookingWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep,       setCurrentStep]       = useState(0);
  const [selectedService,   setSelectedService]   = useState<string | undefined>();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>();
  const [selectedDate,      setSelectedDate]       = useState<string | undefined>();
  const [selectedTime,      setSelectedTime]       = useState<string | undefined>();
  const [showAddForm,       setShowAddForm]        = useState(false);
  const [services,          setServices]           = useState<any[]>([]);
  const [vehicles,          setVehicles]           = useState<any[]>([]);
  const [loading,           setLoading]            = useState(true);
  const [submitting,        setSubmitting]         = useState(false);
  const [error,             setError]              = useState('');
  const [bookedSlots,     setBookedSlots]     = useState<string[]>([]);
  const [rescheduleId,    setRescheduleId]    = useState<number | null>(null);
  const [paymentStage,    setPaymentStage]    = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [srvs, vehs] = await Promise.all([servicesAPI.list(), vehiclesAPI.list()]);
        setServices(srvs || []);
        setVehicles(vehs || []);
        if (!vehs || vehs.length === 0) setShowAddForm(true);
        const preSelected = searchParams.get('service');
        if (preSelected) setSelectedService(preSelected);

        const rescheduleParam = searchParams.get('reschedule');
        if (rescheduleParam) {
          setRescheduleId(Number(rescheduleParam));
          try {
            const appt = await appointmentsAPI.getById(Number(rescheduleParam));
            if (appt) {
              setSelectedService(String(appt.service_id));
              setSelectedVehicleId(String(appt.vehicle_id));
            }
          } catch {}
          setCurrentStep(2);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load booking data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);


  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    try {
      const svc = services.find(s => String(s.id) === String(selectedService)); const slots = await appointmentsAPI.getBookedSlots(date, svc?.duration_minutes || 60);
      setBookedSlots(slots || []);
    } catch { setBookedSlots([]); }
  };

  const goNext = () => { setError(''); setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const goBack = () => { setError(''); setCurrentStep((s) => Math.max(s - 1, 0)); };

  const canAdvance =
    (currentStep === 0 && !!selectedService) ||
    (currentStep === 1 && !!selectedVehicleId) ||
    (currentStep === 2 && !!selectedDate && !!selectedTime) ||
    currentStep === 3;

  const handleAddVehicle = async (data: any) => {
    try {
      const newVeh = await vehiclesAPI.create({
        registration: data.registration,
        make:         data.make,
        model:        data.model,
        year:         data.year ? parseInt(data.year, 10) : undefined,
        colour:       data.color,
        notes:        data.notes,
      });
      setVehicles((prev) => [...prev, newVeh]);
      setSelectedVehicleId(String(newVeh.id));
      setShowAddForm(false);
      goNext();
    } catch (err: any) {
      setError(err.message || 'Failed to add vehicle');
    }
  };

  const handleChoosePayment = async () => {
    if (!selectedService || !selectedVehicleId || !selectedDate || !selectedTime) {
      setError('Please complete all steps before continuing.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const svc = services.find(s => String(s.id) === String(selectedService));
      if (rescheduleId) {
        const start = new Date(`${selectedDate}T${selectedTime}`);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + (svc?.duration_minutes ?? 60));
        await appointmentsAPI.update(rescheduleId, {
          start_time: start.toISOString(),
          end_time:   end.toISOString(),
        });
        setCreatedAppointmentId(rescheduleId);
      } else {
        const created = await appointmentsAPI.create({
          serviceId: Number(selectedService),
          vehicleId: Number(selectedVehicleId),
          date:      selectedDate,
          time:      selectedTime,
        });
        setCreatedAppointmentId(Number(created?.id));
      }
      setPaymentStage(true);
    } catch (err: any) {
      let msg = err.message || 'Failed to create booking';
      try { const parsed = JSON.parse(msg); msg = parsed.error || parsed.message || msg; } catch {}
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Container maxWidth="md">

          {/* Stepper */}
          <div className={styles.stepper}>
            {STEPS.map((step, i) => (
              <React.Fragment key={i}>
                <div className={styles.step}>
                  <div className={[
                    styles.stepCircle,
                    i === currentStep ? styles.stepCircleActive : '',
                    i < currentStep   ? styles.stepCircleDone   : '',
                  ].join(' ')}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={[
                    styles.stepLabel,
                    i === currentStep ? styles.stepLabelActive : '',
                  ].join(' ')}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={[styles.stepConnector, i < currentStep ? styles.stepConnectorDone : ''].join(' ')} />
                )}
              </React.Fragment>
            ))}
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          {loading && currentStep === 0 ? (
            <div className={styles.spinnerWrap}><Spinner /></div>
          ) : (
            <>
              <div className={styles.panel}>

                {/* Step 0 — Service */}
                {currentStep === 0 && (
                  <Section title="Select a Service" subtitle="Choose the service you'd like to book.">
                    <div className={styles.servicesGrid}>
                      {services.map((svc) => (
                        <ServiceCard
                          key={svc.id}
                          name={svc.name}
                          description={svc.description}
                          duration={svc.duration_minutes}
                          price={svc.price}
                          selected={selectedService === String(svc.id)}
                          onSelect={() => setSelectedService(String(svc.id))}
                        />
                      ))}
                    </div>
                  </Section>
                )}

                {/* Step 1 — Vehicle */}
                {currentStep === 1 && (
                  <Section title="Your Vehicle" subtitle="Select a saved vehicle or add a new one.">
                    <VehicleSelector
                      vehicles={vehicles}
                      selectedId={selectedVehicleId}
                      onChange={(v) => {
                        setSelectedVehicleId(String(v.id));
                        setShowAddForm(false);
                        setError('');
                      }}
                      onAddNew={() => setShowAddForm(true)}
                    />

                    {showAddForm && (
                      <>
                        {vehicles.length > 0 && <div className={styles.divider} />}
                        <h3 className={styles.subheading}>Add a new vehicle</h3>
                        <VehicleForm
                          onSubmit={handleAddVehicle}
                          onCancel={vehicles.length > 0 ? () => setShowAddForm(false) : undefined}
                          submitLabel="Add & Continue"
                        />
                      </>
                    )}
                  </Section>
                )}

                {/* Step 2 — Date & Time */}
                {currentStep === 2 && (
                  <Section>
                    <DateTimePicker
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onDateChange={handleDateChange}
                      onTimeChange={setSelectedTime}
                      unavailableSlots={bookedSlots}
                    />
                  </Section>
                )}

                {/* Step 3 — Confirm */}
                {currentStep === 3 && selectedService && selectedVehicleId && selectedDate && selectedTime && !paymentStage && (
                  <Section title="Confirm Booking" subtitle="Review your booking, then choose how you'd like to pay.">
                    <BookingSummary
                      service={services.find(s => String(s.id) === String(selectedService))}
                      vehicle={vehicles.find(v => String(v.id) === String(selectedVehicleId))}
                      date={selectedDate}
                      time={selectedTime}
                      onConfirm={handleChoosePayment}
                      onEdit={(step) => {
                        if (step === 'service')  setCurrentStep(0);
                        if (step === 'vehicle')  setCurrentStep(1);
                        if (step === 'datetime') setCurrentStep(2);
                      }}
                      isLoading={submitting}
                      confirmLabel={'Choose How to Pay →'}
                      loadingLabel={'Reserving your slot…'}
                      footerNote={"We'll reserve your slot and then ask how you'd like to pay."}
                    />
                  </Section>
                )}

                {/* Step 3 — Payment */}
                {currentStep === 3 && paymentStage && createdAppointmentId !== null && (
                  <Section title="Choose Payment Method" subtitle="Pick how you'd like to pay for this appointment.">
                    <PaymentMethodSelector
                      appointmentId={createdAppointmentId}
                      amount={Number(
                        services.find(s => String(s.id) === String(selectedService))?.price ?? 0,
                      )}
                      onBack={() => setPaymentStage(false)}
                    />
                  </Section>
                )}

              </div>

              {/* Nav buttons — hidden on step 1 when add form is open */}
              <div className={styles.navBtns}>
                {currentStep > 0 ? (
                  <button className={styles.backBtn} onClick={goBack}>← Back</button>
                ) : <span />}

                {currentStep < STEPS.length - 1 && !(currentStep === 1 && showAddForm) && (
                  <button className={styles.nextBtn} onClick={goNext} disabled={!canAdvance}>
                    Next →
                  </button>
                )}

                {currentStep === STEPS.length - 1 && !paymentStage && (
                  <button className={styles.nextBtn} onClick={handleChoosePayment} disabled={submitting}>
                    {submitting ? 'Reserving…' : 'Choose How to Pay →'}
                  </button>
                )}
              </div>
            </>
          )}

        </Container>
      </main>
      <Footer copyright={`© ${new Date().getFullYear()} United Tyres Dundrum.`} />
    </div>
  );
};

export default BookingWizard;







