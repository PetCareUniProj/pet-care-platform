// Pets service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import { Pet, CreatePetDto, UpdatePetDto, PaginatedResponse, PaginationParams } from '@/types/pet.types';

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
    color: 'Сірий з білим',
    microchip: 'UA123456789',
    ownerId: 'user1',
    vetName: 'Ветеринарна клініка "Добрий лікар"',
    vetPhone: '+380 50 123 45 67',
    photoUrl: undefined,
    profileCompleteness: 85,
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
    color: 'Золотистий',
    ownerId: 'user1',
    vetName: 'Др. Сидоренко',
    notes: ['Дуже активний, любить плавати.'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profileCompleteness: 60,
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
      limit: 10,
      totalPages: 1
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
      id: Math.random().toString(36).substr(2, 9),
      ownerId: 'user1', // Mock owner
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    // In a real app, we would upload the file and get a URL back.
    // Here we just update the photoUrl with the local URI.
    const updatedPet = { ...mockPets[index], photoUrl: photoUri, updatedAt: new Date().toISOString() };
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
}

export const petsService = new PetsService();
