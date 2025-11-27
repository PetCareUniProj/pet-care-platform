// Documents service - local storage for pet documents

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { PetDocument, CreateDocumentDto, UpdateDocumentDto } from '@/types/document.types';

const DOCUMENTS_STORAGE_KEY = '@pet_connect_documents';

// Mock documents data
const mockDocuments: PetDocument[] = [
  {
    id: '1',
    petId: '1',
    petName: 'Мурзик',
    name: 'Паспорт Мурзика',
    type: 'passport',
    description: 'Міжнародний ветеринарний паспорт',
    fileSize: '2.3 МБ',
    date: '2024-01-15',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    petId: '1',
    petName: 'Мурзик',
    name: 'Сертифікат вакцинації',
    type: 'vaccination',
    description: 'Комплексна вакцинація FVRCP',
    fileSize: '1.1 МБ',
    date: '2024-10-15',
    expiryDate: '2025-10-15',
    createdAt: '2024-10-15T14:30:00Z',
    updatedAt: '2024-10-15T14:30:00Z',
  },
  {
    id: '3',
    petId: '2',
    petName: 'Барон',
    name: 'Страховий поліс',
    type: 'insurance',
    description: 'Страхування здоров\'я тварини',
    fileSize: '540 КБ',
    date: '2024-06-01',
    expiryDate: '2025-06-01',
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-06-01T09:00:00Z',
  },
  {
    id: '4',
    petId: '1',
    petName: 'Мурзик',
    name: 'Виписка з клініки',
    type: 'medical',
    description: 'Профілактичний огляд',
    fileSize: '890 КБ',
    date: '2024-11-20',
    createdAt: '2024-11-20T16:00:00Z',
    updatedAt: '2024-11-20T16:00:00Z',
  },
  {
    id: '5',
    petId: '1',
    petName: 'Мурзик',
    name: 'Рецепт на ліки',
    type: 'prescription',
    description: 'Протипаразитарний препарат',
    fileSize: '120 КБ',
    date: '2024-11-20',
    createdAt: '2024-11-20T16:30:00Z',
    updatedAt: '2024-11-20T16:30:00Z',
  },
];

class DocumentsService {
  private initialized = false;

  private async initializeIfNeeded(): Promise<void> {
    if (this.initialized) return;
    
    const stored = await AsyncStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!stored) {
      await AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(mockDocuments));
    }
    this.initialized = true;
  }

  private async getLocalDocuments(): Promise<PetDocument[]> {
    await this.initializeIfNeeded();
    const stored = await AsyncStorage.getItem(DOCUMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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
}

export const documentsService = new DocumentsService();

