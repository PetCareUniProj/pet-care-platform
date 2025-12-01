// Pet types

export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'other';
export type PetGender = 'male' | 'female' | 'unknown';

// Weight history entry
export interface WeightEntry {
  weight: number;
  date: string; // ISO date string
}

// Photo gallery entry
export interface PetPhoto {
  id: string;
  uri: string;
  caption?: string;
  date: string; // ISO date string
}

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
  weightHistory?: WeightEntry[]; // History of weight measurements
  color?: string;
  microchip?: string;
  photoUrl?: string;
  photoGallery?: PetPhoto[]; // Gallery of pet photos
  profileCompleteness?: number;
  ownerId: string;
  vetId?: string;
  vetName?: string;
  vetPhone?: string;
  vetAddress?: string;
  notes?: string[];
  allergies?: string[];
  specialNeeds?: string;
  isNeutered?: boolean;
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
  vetAddress?: string;
  notes?: string[];
  allergies?: string[];
  specialNeeds?: string;
  isNeutered?: boolean;
}

export interface UpdatePetDto extends Partial<CreatePetDto> {
  photoUrl?: string;
  profileCompleteness?: number;
  weightHistory?: WeightEntry[];
  photoGallery?: PetPhoto[];
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
