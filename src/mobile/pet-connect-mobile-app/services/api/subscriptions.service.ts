// Subscriptions service
// Local storage for subscriptions (mock implementation)

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  RecurrenceInterval,
  RECURRENCE_LABELS,
} from '@/types/order.types';

const SUBSCRIPTIONS_STORAGE_KEY = '@pet_connect_subscriptions';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface LocalSubscription {
  id: string;
  productId?: string;
  productName: string;
  productImage?: string;
  frequency: RecurrenceInterval;
  nextDelivery: string;
  price: number;
  quantity: number;
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocalSubscriptionDto {
  productId?: string;
  productName: string;
  productImage?: string;
  frequency: RecurrenceInterval;
  price: number;
  quantity?: number;
}

// Mock subscriptions
const mockSubscriptions: LocalSubscription[] = [
  {
    id: '1',
    productName: 'Royal Canin Indoor Cat 4kg',
    frequency: 'Monthly',
    nextDelivery: '2025-12-15',
    price: 890,
    quantity: 1,
    status: 'active',
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
  },
  {
    id: '2',
    productName: 'Наповнювач Catsan 10л',
    frequency: 'Biweekly',
    nextDelivery: '2025-12-05',
    price: 320,
    quantity: 2,
    status: 'active',
    createdAt: '2024-08-15T14:00:00Z',
    updatedAt: '2024-11-15T14:00:00Z',
  },
  {
    id: '3',
    productName: 'Корм для собак Pedigree 10kg',
    frequency: 'Monthly',
    nextDelivery: '2025-12-20',
    price: 650,
    quantity: 1,
    status: 'paused',
    createdAt: '2024-05-01T09:00:00Z',
    updatedAt: '2024-10-01T09:00:00Z',
  },
];

class SubscriptionsService {
  private initialized = false;

  private async initializeIfNeeded(): Promise<void> {
    if (this.initialized) return;
    
    const stored = await AsyncStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
    if (!stored) {
      await AsyncStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(mockSubscriptions));
    }
    this.initialized = true;
  }

  private async getLocalSubscriptions(): Promise<LocalSubscription[]> {
    await this.initializeIfNeeded();
    const stored = await AsyncStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private async saveLocalSubscriptions(subscriptions: LocalSubscription[]): Promise<void> {
    await AsyncStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subscriptions));
  }

  async getAll(): Promise<LocalSubscription[]> {
    return this.getLocalSubscriptions();
  }

  async getActive(): Promise<LocalSubscription[]> {
    const subs = await this.getLocalSubscriptions();
    return subs.filter(s => s.status === 'active');
  }

  async getPaused(): Promise<LocalSubscription[]> {
    const subs = await this.getLocalSubscriptions();
    return subs.filter(s => s.status === 'paused');
  }

  async getById(id: string): Promise<LocalSubscription | null> {
    const subs = await this.getLocalSubscriptions();
    return subs.find(s => s.id === id) || null;
  }

  async create(data: CreateLocalSubscriptionDto): Promise<LocalSubscription> {
    const now = new Date();
    const nextDelivery = new Date(now);
    
    // Calculate next delivery based on frequency
    switch (data.frequency) {
      case 'Weekly':
        nextDelivery.setDate(nextDelivery.getDate() + 7);
        break;
      case 'Biweekly':
        nextDelivery.setDate(nextDelivery.getDate() + 14);
        break;
      case 'Monthly':
        nextDelivery.setMonth(nextDelivery.getMonth() + 1);
        break;
    }

    const newSubscription: LocalSubscription = {
      id: Crypto.randomUUID(),
      productId: data.productId,
      productName: data.productName,
      productImage: data.productImage,
      frequency: data.frequency,
      nextDelivery: nextDelivery.toISOString().split('T')[0],
      price: data.price,
      quantity: data.quantity || 1,
      status: 'active',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    const subs = await this.getLocalSubscriptions();
    subs.push(newSubscription);
    await this.saveLocalSubscriptions(subs);

    return newSubscription;
  }

  async pause(id: string): Promise<LocalSubscription> {
    const subs = await this.getLocalSubscriptions();
    const index = subs.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subscription not found');

    subs[index].status = 'paused';
    subs[index].updatedAt = new Date().toISOString();
    await this.saveLocalSubscriptions(subs);

    return subs[index];
  }

  async resume(id: string): Promise<LocalSubscription> {
    const subs = await this.getLocalSubscriptions();
    const index = subs.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subscription not found');

    subs[index].status = 'active';
    subs[index].updatedAt = new Date().toISOString();
    await this.saveLocalSubscriptions(subs);

    return subs[index];
  }

  async cancel(id: string): Promise<void> {
    const subs = await this.getLocalSubscriptions();
    const filtered = subs.filter(s => s.id !== id);
    await this.saveLocalSubscriptions(filtered);
  }

  async updateFrequency(id: string, frequency: RecurrenceInterval): Promise<LocalSubscription> {
    const subs = await this.getLocalSubscriptions();
    const index = subs.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Subscription not found');

    subs[index].frequency = frequency;
    subs[index].updatedAt = new Date().toISOString();
    await this.saveLocalSubscriptions(subs);

    return subs[index];
  }

  getFrequencyLabel(frequency: RecurrenceInterval): string {
    return RECURRENCE_LABELS[frequency] || frequency;
  }

  calculateMonthlyTotal(subscriptions: LocalSubscription[]): number {
    return subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, sub) => {
        const multiplier = sub.frequency === 'Weekly' ? 4 : sub.frequency === 'Biweekly' ? 2 : 1;
        return sum + (sub.price * sub.quantity * multiplier);
      }, 0);
  }
}

export const subscriptionsService = new SubscriptionsService();
