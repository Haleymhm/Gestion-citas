import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Hr,
  Link,
} from '@react-email/components';

interface BaseLayoutProps {
  children: React.ReactNode;
  title: string;
}

const primaryColor = '#2563eb';
const mutedColor = '#6b7280';

export function BaseLayout({ children, title }: BaseLayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '32px', marginBottom: '24px' }}>
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: primaryColor, margin: '0 0 8px 0' }}>
                VeteriApp
              </Text>
              <Text style={{ fontSize: '14px', color: mutedColor, margin: 0 }}>
                Sistema de Gestión de Citas Veterinarias
              </Text>
            </Section>

            {children}
          </Section>

          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px' }}>
            <Hr style={{ borderColor: '#e5e7eb', margin: '0 0 16px 0' }} />
            <Text style={{ fontSize: '14px', color: mutedColor, textAlign: 'center', margin: '0 0 8px 0' }}>
              ¿Tiene alguna pregunta? Contáctenos al{' '}
              <Link href="mailto:soporte@vetriapp.cl" style={{ color: primaryColor }}>
                soporte@vetriapp.cl
              </Link>
            </Text>
            <Text style={{ fontSize: '12px', color: mutedColor, textAlign: 'center', margin: 0 }}>
              © {currentYear} VeteriApp. Todos los derechos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}