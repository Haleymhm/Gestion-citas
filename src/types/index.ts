export type Role = 'ADMIN' | 'VET' | 'RECEPTIONIST' | 'CLIENT';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface UserDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: Date;
}

export interface PetDTO {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  birthDate: Date | null;
  weight: number | null;
  ownerId: number;
  owner?: UserDTO;
  createdAt: Date;
}

export interface AppointmentDTO {
  id: number;
  date: Date;
  reason: string;
  status: AppointmentStatus;
  notes: string | null;
  petId: number;
  vetId: number | null;
  pet?: PetDTO;
  vet?: UserDTO | null;
  createdAt: Date;
}

export interface MedicalRecordDTO {
  id: number;
  title: string;
  publicNotes: string;
  privateNotes: string | null;
  petId: number;
  vetId: number;
  pet?: PetDTO;
  vet?: UserDTO;
  createdAt: Date;
}