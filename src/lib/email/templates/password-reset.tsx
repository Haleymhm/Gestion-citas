import { Text, Section, Hr, Button } from '@react-email/components';
import { BaseLayout } from './base.layout';

interface PasswordResetEmailProps {
  firstName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export function PasswordResetEmail({ firstName, resetUrl, expiresInMinutes }: PasswordResetEmailProps) {
  return (
    <BaseLayout title="Restablecer contraseña">
      <Text style={{ fontSize: '18px', color: '#374151', margin: '0 0 24px 0' }}>
        Hola <strong>{firstName}</strong>,
      </Text>

      <Text style={{ fontSize: '16px', color: '#374151', margin: '0 0 24px 0' }}>
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en VeteriApp.
      </Text>

      <Text style={{ fontSize: '16px', color: '#374151', margin: '0 0 24px 0' }}>
        Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace es válido
        por <strong>{expiresInMinutes} minutos</strong> y solo puede usarse una vez.
      </Text>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button
          href={resetUrl}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '8px',
            fontWeight: 'bold',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Restablecer contraseña
        </Button>
      </Section>

      <Section style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '16px', marginBottom: '24px', borderLeft: '4px solid #f59e0b' }}>
        <Text style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
          <strong>Importante:</strong> Si no solicitaste este cambio, puedes ignorar este mensaje.
          Tu contraseña actual seguirá siendo válida.
        </Text>
      </Section>

      <Hr style={{ borderColor: '#e5e7eb', margin: '0 0 24px 0' }} />

      <Text style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 8px 0' }}>
        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
      </Text>
      <Text style={{ fontSize: '12px', color: '#2563eb', margin: 0, wordBreak: 'break-all' }}>
        {resetUrl}
      </Text>
    </BaseLayout>
  );
}
