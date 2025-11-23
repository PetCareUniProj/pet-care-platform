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
  healthScore?: number;
  ownerId: string;
  vetId?: string;
  vetName?: string;
  vetPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
  notes?: string;
}

export interface UpdatePetDto extends Partial<CreatePetDto> {
  photoUrl?: string;
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


