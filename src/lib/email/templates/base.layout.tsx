import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Hr,
  Link,
  Section,
  Img,
} from '@react-email/components';

interface BaseLayoutProps {
  children: React.ReactNode;
  title: string;
  branding?: {
    clinicName: string;
    logoUrl?: string | null;
    primaryColor: string;
    footerText: string;
  };
}

export function BaseLayout({ children, title, branding }: BaseLayoutProps) {
  const currentYear = new Date().getFullYear();
  const clinicName = branding?.clinicName || 'VeteriApp';
  const primaryColor = branding?.primaryColor || '#2563eb';
  const footerText = branding?.footerText || '© VeteriApp. Todos los derechos reservados.';
  const logoUrl = branding?.logoUrl;

  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Body style={{ backgroundColor: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '32px', marginBottom: '24px' }}>
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              {logoUrl && (
                <Img
                  src={logoUrl}
                  alt={clinicName}
                  width="120"
                  style={{ margin: '0 auto 12px auto', display: 'block' }}
                />
              )}
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: primaryColor, margin: '0 0 8px 0' }}>
                {clinicName}
              </Text>
              <Text style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                Sistema de Gestión de Citas Veterinarias
              </Text>
            </Section>

            {children}
          </Section>

          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px' }}>
            <Hr style={{ borderColor: '#e5e7eb', margin: '0 0 16px 0' }} />
            <Text style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', margin: '0 0 8px 0' }}>
              ¿Tiene alguna pregunta? Contáctenos al{' '}
              <Link href="mailto:soporte@vetriapp.cl" style={{ color: primaryColor }}>
                soporte@vetriapp.cl
              </Link>
            </Text>
            <Text style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', margin: 0 }}>
              {footerText} © {currentYear}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
