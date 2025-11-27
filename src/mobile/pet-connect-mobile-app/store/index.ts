import { create } from 'zustand';
import { Pet, CreatePetDto, UpdatePetDto } from '@/types/pet.types';
import { petsService } from '@/services/api/pets.service';

interface PetsState {
  pets: Pet[];
  selectedPet: Pet | null;
  isLoading: boolean;
  error: string | null;

  fetchPets: () => Promise<void>;
  fetchPetById: (id: string) => Promise<void>;
  createPet: (data: CreatePetDto) => Promise<void>;
  updatePet: (id: string, data: UpdatePetDto) => Promise<void>;
  deletePet: (id: string) => Promise<boolean>;
  uploadPetPhoto: (id: string, photoUri: string) => Promise<void>;
  addPetNote: (id: string, note: string) => Promise<void>;
  addPetWeight: (id: string, weight: number) => Promise<void>;
  addPhotoToGallery: (id: string, photoUri: string, caption?: string) => Promise<void>;
  updateGalleryPhoto: (id: string, photoId: string, updates: { caption?: string; date?: string }) => Promise<void>;
  deleteGalleryPhoto: (id: string, photoId: string) => Promise<void>;
  selectPet: (pet: Pet | null) => void;
}

export const usePetsStore = create<PetsState>((set, get) => ({
  pets: [],
  selectedPet: null,
  isLoading: false,
  error: null,

  fetchPets: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await petsService.getAll();
      set({ pets: response.items, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchPetById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const pet = await petsService.getById(id);
      set({ selectedPet: pet, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createPet: async (data: CreatePetDto) => {
    set({ isLoading: true, error: null });
    try {
      const newPet = await petsService.create(data);
      set((state) => ({ pets: [...state.pets, newPet], isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updatePet: async (id: string, data: UpdatePetDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPet = await petsService.update(id, data);
      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? updatedPet : p)),
        selectedPet: state.selectedPet?.id === id ? updatedPet : state.selectedPet,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deletePet: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await petsService.delete(id);
      set((state) => ({
        pets: state.pets.filter((p) => p.id !== id),
        selectedPet: state.selectedPet?.id === id ? null : state.selectedPet,
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return false;
    }
  },

  uploadPetPhoto: async (id: string, photoUri: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPet = await petsService.uploadPhoto(id, photoUri);
      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? updatedPet : p)),
        selectedPet: state.selectedPet?.id === id ? updatedPet : state.selectedPet,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addPetNote: async (id: string, note: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPet = await petsService.addNote(id, note);
      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? updatedPet : p)),
        selectedPet: state.selectedPet?.id === id ? updatedPet : state.selectedPet,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addPetWeight: async (id: string, weight: number) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPet = await petsService.addWeight(id, weight);
      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? updatedPet : p)),
        selectedPet: state.selectedPet?.id === id ? updatedPet : state.selectedPet,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addPhotoToGallery: async (id: string, photoUri: string, caption?: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPet = await petsService.addPhotoToGallery(id, photoUri, caption);
      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? updatedPet : p)),
        selectedPet: state.selectedPet?.id === id ? updatedPet : state.selectedPet,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateGalleryPhoto: async (id: string, photoId: string, updates: { caption?: string; date?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPet = await petsService.updateGalleryPhoto(id, photoId, updates);
      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? updatedPet : p)),
        selectedPet: state.selectedPet?.id === id ? updatedPet : state.selectedPet,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteGalleryPhoto: async (id: string, photoId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedPet = await petsService.deleteGalleryPhoto(id, photoId);
      set((state) => ({
        pets: state.pets.map((p) => (p.id === id ? updatedPet : p)),
        selectedPet: state.selectedPet?.id === id ? updatedPet : state.selectedPet,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectPet: (pet) => set({ selectedPet: pet }),
}));
