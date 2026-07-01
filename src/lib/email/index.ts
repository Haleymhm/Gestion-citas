import { Resend } from 'resend';
import { render } from '@react-email/render';
import { AppointmentCreatedEmail } from './templates/appointment-created';
import { AppointmentConfirmedEmail } from './templates/appointment-confirmed';
import { AppointmentCancelledEmail } from './templates/appointment-cancelled';
import { AppointmentCompletedEmail } from './templates/appointment-completed';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'VeteriApp <noreply@vetriapp.cl>';
const TEST_DOMAIN = 'resend.dev';

interface AppointmentEmailData {
  id: number;
  date: Date;
  reason: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  pet: {
    name: string;
    owner: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  vet: {
    firstName: string;
    lastName: string;
  } | null;
  category: {
    name: string;
    color: string;
  };
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const isTest = process.env.NODE_ENV !== 'production';

  try {
    const { error } = await resend.emails.send({
      from: isTest ? `onboarding@${TEST_DOMAIN}` : FROM_EMAIL,
      to: isTest ? [to, `delivered@${TEST_DOMAIN}`] : [to],
      subject,
      html,
    });

    if (error) {
      console.error(`[Email] Error sending to ${to}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent ${subject} to ${to}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Email] Failed to send to ${to}:`, message);
    return { success: false, error: message };
  }
}

export async function sendAppointmentCreatedEmail(data: AppointmentEmailData) {
  const html = await render(AppointmentCreatedEmail({ ...data, formatDate }));

  return sendEmail({
    to: data.pet.owner.email,
    subject: `Cita Solicitada - #${data.id}`,
    html,
  });
}

export async function sendAppointmentConfirmedEmail(data: AppointmentEmailData) {
  const html = await render(AppointmentConfirmedEmail({ ...data, formatDate }));

  return sendEmail({
    to: data.pet.owner.email,
    subject: `Cita Confirmada - #${data.id}`,
    html,
  });
}

export async function sendAppointmentCancelledEmail(data: AppointmentEmailData) {
  const html = await render(AppointmentCancelledEmail({ ...data, formatDate }));

  return sendEmail({
    to: data.pet.owner.email,
    subject: `Cita Cancelada - #${data.id}`,
    html,
  });
}

export async function sendAppointmentCompletedEmail(data: AppointmentEmailData) {
  const html = await render(AppointmentCompletedEmail({ ...data, formatDate }));

  return sendEmail({
    to: data.pet.owner.email,
    subject: `Cita Completada - #${data.id}`,
    html,
  });
}