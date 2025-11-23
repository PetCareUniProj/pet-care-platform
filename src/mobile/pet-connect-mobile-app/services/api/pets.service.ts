// Pets service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import { Pet, CreatePetDto, UpdatePetDto, PaginatedResponse, PaginationParams } from '@/types/pet.types';

class PetsService {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Pet>> {
    return apiClient.get<PaginatedResponse<Pet>>(API_ENDPOINTS.PETS.GET_ALL, { params });
  }

  async getById(id: string): Promise<Pet> {
    return apiClient.get<Pet>(API_ENDPOINTS.PETS.GET_BY_ID(id));
  }

  async create(data: CreatePetDto): Promise<Pet> {
    return apiClient.post<Pet>(API_ENDPOINTS.PETS.CREATE, data);
  }

  async update(id: string, data: UpdatePetDto): Promise<Pet> {
    return apiClient.put<Pet>(API_ENDPOINTS.PETS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.PETS.DELETE(id));
  }

  async uploadPhoto(id: string, photoUri: string): Promise<Pet> {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    return apiClient.post<Pet>(API_ENDPOINTS.PETS.UPLOAD_PHOTO(id), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const petsService = new PetsService();


