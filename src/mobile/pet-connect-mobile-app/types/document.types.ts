// Document types for pet documents

export type DocumentType = 'vaccination' | 'passport' | 'insurance' | 'medical' | 'prescription' | 'other';

export interface PetDocument {
  id: string;
  petId: string;
  petName: string;
  name: string;
  type: DocumentType;
  description?: string;
  fileUri?: string;
  fileSize?: string;
  mimeType?: string;
  date: string; // Date the document was created/issued
  expiryDate?: string; // For documents that expire (insurance, vaccinations)
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentDto {
  petId: string;
  name: string;
  type: DocumentType;
  description?: string;
  fileUri?: string;
  fileSize?: string;
  mimeType?: string;
  date: string;
  expiryDate?: string;
}

export interface UpdateDocumentDto extends Partial<CreateDocumentDto> {}

export const DOCUMENT_TYPE_INFO: Record<DocumentType, { icon: string; color: string; bg: string; label: string }> = {
  vaccination: { icon: 'vaccines', color: '#22c55e', bg: 'bg-green-100', label: 'Вакцинація' },
  passport: { icon: 'badge', color: '#3b82f6', bg: 'bg-blue-100', label: 'Паспорт' },
  insurance: { icon: 'security', color: '#8b5cf6', bg: 'bg-violet-100', label: 'Страховка' },
  medical: { icon: 'medical-services', color: '#ef4444', bg: 'bg-red-100', label: 'Медичний' },
  prescription: { icon: 'receipt', color: '#f59e0b', bg: 'bg-amber-100', label: 'Рецепт' },
  other: { icon: 'description', color: '#6b7280', bg: 'bg-gray-100', label: 'Інше' },
};

