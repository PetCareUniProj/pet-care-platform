// Pet types

export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export type PetGender = 'male' | 'female' | 'unknown';

export interface Pet {
  id: string;
  name: string;
  type: PetType;
  breed?: string;
  age?: string;
  birthDate?: string;
  gender: PetGender;
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  color?: string;
  microchip?: string;
  photoUrl?: string;
  profileCompleteness?: number; // Changed from healthScore to match UI
  ownerId: string;
  vetId?: string;
  vetName?: string;
  vetPhone?: string;
  notes?: string[]; // Changed to array
  createdAt: string;
  updatedAt: string;
  vaccinationStatus?: { name: string; date: string; status: 'completed' | 'upcoming' | 'missed' }[];
  medications?: { name: string; dosage: string; frequency: string; nextDate: string }[];
  upcomingAppointments?: { type: string; date: string; time: string; vet: string }[];
}

export interface CreatePetDto {
  name: string;
  type: PetType;
  breed?: string;
  birthDate?: string;
  gender: PetGender;
  weight?: number;
  weightUnit?: 'kg' | 'lbs';
  color?: string;
  microchip?: string;
  vetId?: string;
  vetName?: string;
  vetPhone?: string;
  notes?: string[];
}

export interface UpdatePetDto extends Partial<CreatePetDto> {
  photoUrl?: string;
  profileCompleteness?: number;
}

export interface PetHealthRecord {
  id: string;
  petId: string;
  type: 'vaccination' | 'medication' | 'checkup' | 'surgery' | 'other';
  title: string;
  description?: string;
  date: string;
  vetName?: string;
  attachments?: string[];
}
