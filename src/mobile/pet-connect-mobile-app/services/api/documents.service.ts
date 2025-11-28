// Documents service - local storage for pet documents

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { PetDocument, CreateDocumentDto, UpdateDocumentDto } from '@/types/document.types';

const DOCUMENTS_STORAGE_KEY = '@pet_connect_documents';
const DOCUMENTS_INITIALIZED_KEY = '@pet_connect_documents_initialized';

class DocumentsService {
  private initialized = false;

  // Initialize with sample documents for demo (only once)
  async initializeWithPets(pets: { id: string; name: string }[]): Promise<void> {
    try {
      const alreadyInitialized = await AsyncStorage.getItem(DOCUMENTS_INITIALIZED_KEY);
      if (alreadyInitialized === 'true' || pets.length === 0) {
        this.initialized = true;
        return;
      }

      // Create sample documents for the first pet
      const firstPet = pets[0];
      const sampleDocs: PetDocument[] = [
        {
          id: Crypto.randomUUID(),
          petId: firstPet.id,
          petName: firstPet.name,
          name: `Паспорт ${firstPet.name}`,
          type: 'passport',
          description: 'Міжнародний ветеринарний паспорт',
          fileSize: '2.3 МБ',
          date: '2024-01-15',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: Crypto.randomUUID(),
          petId: firstPet.id,
          petName: firstPet.name,
          name: 'Сертифікат вакцинації',
          type: 'vaccination',
          description: 'Комплексна вакцинація',
          fileSize: '1.1 МБ',
          date: '2024-10-15',
          expiryDate: '2025-10-15',
          createdAt: '2024-10-15T14:30:00Z',
          updatedAt: '2024-10-15T14:30:00Z',
        },
      ];

      // If there's a second pet, add documents for it too
      if (pets.length > 1) {
        const secondPet = pets[1];
        sampleDocs.push({
          id: Crypto.randomUUID(),
          petId: secondPet.id,
          petName: secondPet.name,
          name: 'Страховий поліс',
          type: 'insurance',
          description: 'Страхування здоров\'я тварини',
          fileSize: '540 КБ',
          date: '2024-06-01',
          expiryDate: '2025-06-01',
          createdAt: '2024-06-01T09:00:00Z',
          updatedAt: '2024-06-01T09:00:00Z',
        });
      }

      await AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(sampleDocs));
      await AsyncStorage.setItem(DOCUMENTS_INITIALIZED_KEY, 'true');
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing documents:', error);
      this.initialized = true;
    }
  }

  private async getLocalDocuments(): Promise<PetDocument[]> {
    try {
      const stored = await AsyncStorage.getItem(DOCUMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  private async saveLocalDocuments(documents: PetDocument[]): Promise<void> {
    await AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
  }

  async getAll(petId?: string): Promise<PetDocument[]> {
    const documents = await this.getLocalDocuments();
    if (petId) {
      return documents.filter(d => d.petId === petId);
    }
    return documents;
  }

  async getById(id: string): Promise<PetDocument | null> {
    const documents = await this.getLocalDocuments();
    return documents.find(d => d.id === id) || null;
  }

  async create(data: CreateDocumentDto, petName: string): Promise<PetDocument> {
    const now = new Date().toISOString();
    const newDocument: PetDocument = {
      id: Crypto.randomUUID(),
      petId: data.petId,
      petName,
      name: data.name,
      type: data.type,
      description: data.description,
      fileUri: data.fileUri,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      date: data.date,
      expiryDate: data.expiryDate,
      createdAt: now,
      updatedAt: now,
    };

    const documents = await this.getLocalDocuments();
    documents.push(newDocument);
    await this.saveLocalDocuments(documents);

    return newDocument;
  }

  async update(id: string, data: UpdateDocumentDto): Promise<PetDocument> {
    const documents = await this.getLocalDocuments();
    const index = documents.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Document not found');

    const updatedDocument = {
      ...documents[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    documents[index] = updatedDocument;
    await this.saveLocalDocuments(documents);

    return updatedDocument;
  }

  async delete(id: string): Promise<void> {
    const documents = await this.getLocalDocuments();
    const filtered = documents.filter(d => d.id !== id);
    await this.saveLocalDocuments(filtered);
  }

  async getByType(type: string): Promise<PetDocument[]> {
    const documents = await this.getLocalDocuments();
    return documents.filter(d => d.type === type);
  }

  async getExpiringSoon(days: number = 30): Promise<PetDocument[]> {
    const documents = await this.getLocalDocuments();
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return documents.filter(d => {
      if (!d.expiryDate) return false;
      const expiry = new Date(d.expiryDate);
      return expiry >= now && expiry <= futureDate;
    });
  }

  // Clear initialization flag (for testing)
  async resetInitialization(): Promise<void> {
    await AsyncStorage.removeItem(DOCUMENTS_INITIALIZED_KEY);
    this.initialized = false;
  }
}

export const documentsService = new DocumentsService();
