import { create } from 'zustand';
import { Pet, CreatePetDto, UpdatePetDto } from '@/types/pet.types';
import { CalendarEvent } from '@/types/reminder.types';
import { petsService } from '@/services/api/pets.service';
import { remindersService } from '@/services/api/reminders.service';

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
      // Replace all pets to avoid duplicates
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
      set((state) => {
        // Check if pet already exists to prevent duplicates
        const exists = state.pets.some(p => p.id === newPet.id);
        if (exists) {
          return { isLoading: false };
        }
        return { pets: [...state.pets, newPet], isLoading: false };
      });
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

// ============ Events Store ============

interface EventsState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  lastFetched: string | null;

  fetchEvents: () => Promise<void>;
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
  getEventsForDate: (date: string) => CalendarEvent[];
  refreshEvents: () => Promise<void>;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchEvents: async () => {
    // Don't refetch if fetched recently (within last minute)
    const { lastFetched, isLoading } = get();
    if (isLoading) return;
    
    const now = new Date().getTime();
    if (lastFetched && now - new Date(lastFetched).getTime() < 60000) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6);
      
      const events = await remindersService.getCalendarEvents(today, endDate.toISOString().split('T')[0]);
      set({ 
        events, 
        isLoading: false, 
        lastFetched: new Date().toISOString() 
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getUpcomingEvents: (limit?: number) => {
    const { events } = get();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const upcoming = events
      .filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return limit ? upcoming.slice(0, limit) : upcoming;
  },

  getEventsForDate: (date: string) => {
    const { events } = get();
    return events.filter(e => e.date === date);
  },

  refreshEvents: async () => {
    set({ lastFetched: null });
    await get().fetchEvents();
  },
}));
