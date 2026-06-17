import { z } from 'zod';

export const Role = z.enum(['ADMIN', 'VET', 'RECEPTIONIST', 'CLIENT']);
export type Role = z.infer<typeof Role>;

export const AppointmentStatus = z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);
export type AppointmentStatus = z.infer<typeof AppointmentStatus>;

export const Sex = z.enum(['MALE', 'FEMALE']);
export type Sex = z.infer<typeof Sex>;

export const ReproductiveStatus = z.enum(['FERTILE', 'STERILIZED', 'CASTRATED']);
export type ReproductiveStatus = z.infer<typeof ReproductiveStatus>;

export const DewormingType = z.enum(['INTERNAL', 'EXTERNAL', 'BOTH']);
export type DewormingType = z.infer<typeof DewormingType>;

export const VitalSignsSchema = z.object({
  weight: z.number().positive('El peso debe ser un número positivo').optional(),
  temperature: z.number().positive('La temperatura debe ser un número positivo').optional(),
  heartRate: z.number().int().positive('La frecuencia cardíaca debe ser un número positivo').optional(),
  respiratoryRate: z.number().int().positive('La frecuencia respiratoria debe ser un número positivo').optional(),
  capillaryRefillTime: z.string().optional(),
  dehydrationPercentage: z.number().min(0).max(100, 'El porcentaje debe estar entre 0 y 100').optional(),
  mucousMembranes: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  firstName: z.string().min(1, 'Nombre es requerido'),
  lastName: z.string().min(1, 'Apellido es requerido'),
  role: Role.optional().default('CLIENT'),
});

export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  firstName: z.string().min(1, 'Nombre es requerido'),
  lastName: z.string().min(1, 'Apellido es requerido'),
  role: z.enum(['ADMIN', 'VET', 'RECEPTIONIST']),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1, 'Nombre es requerido').optional(),
  lastName: z.string().min(1, 'Apellido es requerido').optional(),
  role: z.enum(['ADMIN', 'VET', 'RECEPTIONIST', 'CLIENT']).optional(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .optional(),
});

export const CreateClientSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  firstName: z.string().min(1, 'Nombre es requerido'),
  lastName: z.string().min(1, 'Apellido es requerido'),
  rut: z.string().min(1, 'RUT es requerido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  regionId: z.string().optional(),
  comunaId: z.string().optional(),
});

export const UpdateClientSchema = z.object({
  firstName: z.string().min(1, 'Nombre es requerido').optional(),
  lastName: z.string().min(1, 'Apellido es requerido').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .optional(),
  rut: z.string().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  regionId: z.string().nullable().optional(),
  comunaId: z.string().nullable().optional(),
});

export const CreatePetSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  species: z.string().min(1, 'Especie es requerida'),
  breed: z.string().optional(),
  birthDate: z.string().datetime().optional(),
  weight: z.number().positive('El peso debe ser un número positivo').optional(),
  sex: Sex.optional(),
  reproductiveStatus: ReproductiveStatus.optional(),
  specialCharacteristics: z.string().optional(),
  microchipNumber: z.string().optional(),
  ownerId: z.number().int().positive().optional(),
});

export const UpdatePetSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').optional(),
  species: z.string().min(1, 'Especie es requerida').optional(),
  breed: z.string().nullable().optional(),
  birthDate: z.string().datetime().nullable().optional(),
  weight: z.number().positive('El peso debe ser un número positivo').nullable().optional(),
  sex: Sex.nullable().optional(),
  reproductiveStatus: ReproductiveStatus.nullable().optional(),
  specialCharacteristics: z.string().nullable().optional(),
  microchipNumber: z.string().nullable().optional(),
});

export const CreateAppointmentSchema = z.object({
  date: z.string().datetime({ message: 'Fecha inválida' }),
  reason: z.string().min(1, 'Motivo es requerido'),
  categoryId: z.string().uuid('ID de categoría inválido'),
  petId: z.number().int().positive('ID de mascota inválido'),
  vetId: z.number().int().positive().optional(),
  notes: z.string().optional(),
  status: AppointmentStatus.optional(),
});

export const UpdateAppointmentSchema = z.object({
  date: z.string().datetime({ message: 'Fecha inválida' }).optional(),
  reason: z.string().min(1, 'Motivo es requerido').optional(),
  status: AppointmentStatus.optional(),
  notes: z.string().nullable().optional(),
  vetId: z.number().int().positive().nullable().optional(),
  petId: z.number().int().positive().optional(),
  categoryId: z.string().uuid('ID de categoría inválido').optional(),
});

export const CreateMedicalRecordSchema = z.object({
  date: z.string().datetime({ message: 'Fecha inválida' }).optional(),
  title: z.string().min(1, 'Título es requerido'),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  publicNotes: z.string().min(1, 'Notas públicas son requeridas'),
  privateNotes: z.string().optional(),
  petId: z.number().int().positive('ID de mascota inválido'),
  vitals: VitalSignsSchema.optional(),
});

export const UpdateMedicalRecordSchema = z.object({
  date: z.string().datetime({ message: 'Fecha inválida' }).optional(),
  title: z.string().min(1, 'Título es requerido').optional(),
  diagnosis: z.string().nullable().optional(),
  treatment: z.string().nullable().optional(),
  publicNotes: z.string().min(1, 'Notas públicas son requeridas').optional(),
  privateNotes: z.string().nullable().optional(),
  vitals: VitalSignsSchema.partial().optional(),
});

export const CreateExamAttachmentSchema = z.object({
  fileName: z.string().min(1, 'Nombre de archivo es requerido'),
  fileUrl: z.string().url('URL de archivo inválida'),
  fileType: z.string().min(1, 'Tipo de archivo es requerido'),
  description: z.string().optional(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  color: z.string().min(1, 'Color es requerido'),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').optional(),
  color: z.string().min(1, 'Color es requerido').optional(),
});

export const CreateVaccinationSchema = z.object({
  vaccineName: z.string().min(1, 'Nombre de vacuna es requerido'),
  vaccineType: z.string().min(1, 'Tipo de vacuna es requerido'),
  administrationDate: z.string().datetime({ message: 'Fecha inválida' }).optional(),
  nextDoseDate: z.string().datetime({ message: 'Fecha inválida' }).optional().nullable(),
  lotNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  veterinarian: z.string().optional(),
});

export const CreateDewormingSchema = z.object({
  productName: z.string().min(1, 'Nombre del producto es requerido'),
  type: DewormingType,
  dosage: z.string().optional(),
  date: z.string().datetime({ message: 'Fecha inválida' }).optional(),
  nextDate: z.string().datetime({ message: 'Fecha inválida' }).optional().nullable(),
});

export const CreateSurgicalHistorySchema = z.object({
  procedure: z.string().min(1, 'Procedimiento es requerido'),
  date: z.string().datetime({ message: 'Fecha inválida' }).optional().nullable(),
  complications: z.string().optional(),
  notes: z.string().optional(),
  outcomes: z.string().optional(),
});

export const CreateChronicConditionSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido'),
  type: z.string().min(1, 'Tipo es requerido'),
  severity: z.string().optional(),
  diagnosisDate: z.string().datetime({ message: 'Fecha inválida' }).optional().nullable(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const CreateRegionSchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
});

export const CreateComunaSchema = z.object({
  code: z.string().min(1, 'Código es requerido'),
  name: z.string().min(1, 'Nombre es requerido'),
  regionId: z.string().uuid('ID de región inválido'),
});

export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);

  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError
        ? `${firstError.path.join('.')}: ${firstError.message}`
        : 'Datos inválidos',
    };
  }

  return { success: true, data: result.data };
}