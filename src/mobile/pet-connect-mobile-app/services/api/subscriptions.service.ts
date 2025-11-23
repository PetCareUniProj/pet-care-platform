// Subscriptions service

import { apiClient } from './client';
import { API_ENDPOINTS } from '@/constants/api';
import {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '@/types/subscription.types';

class SubscriptionsService {
  async getAll(): Promise<Subscription[]> {
    return apiClient.get<Subscription[]>(API_ENDPOINTS.SUBSCRIPTIONS.GET_ALL);
  }

  async create(data: CreateSubscriptionDto): Promise<Subscription> {
    return apiClient.post<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.CREATE, data);
  }

  async update(id: string, data: UpdateSubscriptionDto): Promise<Subscription> {
    return apiClient.put<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.DELETE(id), data);
  }

  async cancel(id: string): Promise<void> {
    return apiClient.delete<void>(API_ENDPOINTS.SUBSCRIPTIONS.DELETE(id));
  }
}

export const subscriptionsService = new SubscriptionsService();


