// Pets service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import { Pet, CreatePetDto, UpdatePetDto, PaginatedResponse, PaginationParams, WeightEntry, PetPhoto } from '@/types/pet.types';
import * as Crypto from 'expo-crypto';

// Mock data
let mockPets: Pet[] = [
  {
    id: '1',
    name: 'Мурзик',
    type: 'cat',
    breed: 'Британська короткошерста',
    age: '2 роки 3 місяці',
    birthDate: '15.08.2023',
    gender: 'male',
    weight: 4.8,
    weightUnit: 'kg',
    weightHistory: [
      { weight: 4.2, date: '2024-08-15' },
      { weight: 4.5, date: '2024-09-15' },
      { weight: 4.8, date: '2024-10-15' },
    ],
    color: 'Сірий з білим',
    microchip: 'UA123456789',
    ownerId: 'user1',
    vetName: 'Ветеринарна клініка "Добрий лікар"',
    vetPhone: '+380 50 123 45 67',
    vetAddress: 'вул. Хрещатик, 10, Київ',
    photoUrl: undefined,
    photoGallery: [],
    profileCompleteness: 85,
    isNeutered: true,
    allergies: ['Риба'],
    notes: [
      'Мурзик любить гратися з іграшками на мотузці.',
      'Має алергію на рибу.',
      'Любить спати на підвіконні.'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vaccinationStatus: [
        { name: 'Комплексна вакцинація', date: '15.10.2025', status: 'completed' },
        { name: 'Рабієс', date: '15.10.2025', status: 'completed' },
        { name: 'Лейкемія кішок', date: '15.10.2024', status: 'completed' },
        { name: 'Наступна вакцинація', date: '15.11.2025', status: 'upcoming' }
    ],
    medications: [
        { name: 'Протипаразитарний препарат', dosage: '1 таблетка', frequency: 'Щомісяця', nextDate: '01.12.2025' }
    ],
    upcomingAppointments: [
        { type: 'Вакцинація', date: '15.11.2025', time: '10:00', vet: 'Др. Сидоренко' },
        { type: 'Огляд', date: '20.11.2025', time: '14:30', vet: 'Др. Сидоренко' }
    ]
  },
  {
    id: '2',
    name: 'Барон',
    type: 'dog',
    breed: 'Лабрадор',
    age: '4 роки',
    birthDate: '10.10.2021',
    gender: 'male',
    weight: 32,
    weightUnit: 'kg',
    weightHistory: [
      { weight: 30, date: '2024-06-01' },
      { weight: 31, date: '2024-08-01' },
      { weight: 32, date: '2024-10-01' },
    ],
    color: 'Золотистий',
    ownerId: 'user1',
    vetName: 'Др. Сидоренко',
    notes: ['Дуже активний, любить плавати.'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profileCompleteness: 60,
    photoGallery: [],
  }
];

class PetsService {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Pet>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      items: mockPets,
      total: mockPets.length,
      page: 1,
      pageSize: 10,
      hasNextPage: false
    };
  }

  async getById(id: string): Promise<Pet> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const pet = mockPets.find(p => p.id === id);
    if (!pet) throw new Error('Pet not found');
    return pet;
  }

  async create(data: CreatePetDto): Promise<Pet> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newPet: Pet = {
      ...data,
      id: Crypto.randomUUID(),
      ownerId: 'user1', // Mock owner
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      weightHistory: data.weight ? [{ weight: data.weight, weightUnit: data.weightUnit || 'kg', date: new Date().toISOString() }] : [],
      photoGallery: [],
      profileCompleteness: this.calculateCompleteness(data as Pet),
    };
    mockPets.push(newPet);
    return newPet;
  }

  async update(id: string, data: UpdatePetDto): Promise<Pet> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockPets.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pet not found');
    
    const updatedPet = { ...mockPets[index], ...data, updatedAt: new Date().toISOString() };
    mockPets[index] = updatedPet;
    return updatedPet;
  }

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    mockPets = mockPets.filter(p => p.id !== id);
  }

  async uploadPhoto(id: string, photoUri: string): Promise<Pet> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const index = mockPets.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pet not found');

    // Add photo to gallery when changing profile photo
    const newPhoto: PetPhoto = {
      id: Crypto.randomUUID(),
      uri: photoUri,
      date: new Date().toISOString(),
    };
    const currentGallery = mockPets[index].photoGallery || [];

    const updatedPet = { 
      ...mockPets[index], 
      photoUrl: photoUri, 
      photoGallery: [...currentGallery, newPhoto],
      updatedAt: new Date().toISOString() 
    };
    mockPets[index] = updatedPet;
    return updatedPet;
  }
  
  async addNote(id: string, note: string): Promise<Pet> {
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockPets.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Pet not found');

      const currentNotes = mockPets[index].notes ? [...mockPets[index].notes, note] : [note];
      const updatedPet = { ...mockPets[index], notes: currentNotes, updatedAt: new Date().toISOString() };
      mockPets[index] = updatedPet;
      return updatedPet;
  }

  async addWeight(id: string, weight: number): Promise<Pet> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPets.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pet not found');

    const newEntry: WeightEntry = {
      weight,
      date: new Date().toISOString().split('T')[0],
    };
    const currentHistory = mockPets[index].weightHistory || [];

    const updatedPet = { 
      ...mockPets[index], 
      weight, 
      weightHistory: [...currentHistory, newEntry],
      updatedAt: new Date().toISOString() 
    };
    mockPets[index] = updatedPet;
    return updatedPet;
  }

  async addPhotoToGallery(id: string, photoUri: string, caption?: string): Promise<Pet> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockPets.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pet not found');

    const newPhoto: PetPhoto = {
      id: Crypto.randomUUID(),
      uri: photoUri,
      caption,
      date: new Date().toISOString(),
    };
    const currentGallery = mockPets[index].photoGallery || [];

    const updatedPet = { 
      ...mockPets[index], 
      photoGallery: [...currentGallery, newPhoto],
      updatedAt: new Date().toISOString() 
    };
    mockPets[index] = updatedPet;
    return updatedPet;
  }

  async updateGalleryPhoto(id: string, photoId: string, updates: { caption?: string; date?: string }): Promise<Pet> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPets.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pet not found');

    const currentGallery = mockPets[index].photoGallery || [];
    const updatedGallery = currentGallery.map(photo => 
      photo.id === photoId ? { ...photo, ...updates } : photo
    );

    const updatedPet = { 
      ...mockPets[index], 
      photoGallery: updatedGallery,
      updatedAt: new Date().toISOString() 
    };
    mockPets[index] = updatedPet;
    return updatedPet;
  }

  async deleteGalleryPhoto(id: string, photoId: string): Promise<Pet> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockPets.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pet not found');

    const currentGallery = mockPets[index].photoGallery || [];
    const updatedGallery = currentGallery.filter(photo => photo.id !== photoId);

    const updatedPet = { 
      ...mockPets[index], 
      photoGallery: updatedGallery,
      updatedAt: new Date().toISOString() 
    };
    mockPets[index] = updatedPet;
    return updatedPet;
  }

  // Helper to calculate profile completeness
  calculateCompleteness(pet: Partial<Pet>): number {
    const fields = [
      pet.name,
      pet.type,
      pet.breed,
      pet.birthDate,
      pet.gender,
      pet.weight,
      pet.color,
      pet.microchip,
      pet.photoUrl,
      pet.vetName,
      pet.vetPhone,
    ];
    const filledFields = fields.filter(f => f !== undefined && f !== null && f !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  }
}

export const petsService = new PetsService();
