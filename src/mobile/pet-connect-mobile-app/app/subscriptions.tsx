import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { subscriptionsService, LocalSubscription } from '@/services/api/subscriptions.service';
import { RECURRENCE_LABELS } from '@/types/order.types';

export default function SubscriptionsScreen() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<LocalSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const data = await subscriptionsService.getAll();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthNames = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вер', 'жовт', 'лист', 'груд'];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handlePauseSubscription = (sub: LocalSubscription) => {
    Alert.alert(
      'Призупинити підписку',
      `Ви впевнені, що хочете призупинити підписку на "${sub.productName}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Призупинити',
          onPress: async () => {
            try {
              await subscriptionsService.pause(sub.id);
              await loadSubscriptions();
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося призупинити підписку');
            }
          },
        },
      ]
    );
  };

  const handleResumeSubscription = async (sub: LocalSubscription) => {
    try {
      await subscriptionsService.resume(sub.id);
      await loadSubscriptions();
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося відновити підписку');
    }
  };

  const handleCancelSubscription = (sub: LocalSubscription) => {
    Alert.alert(
      'Скасувати підписку',
      `Ви впевнені, що хочете скасувати підписку на "${sub.productName}"? Цю дію неможливо скасувати.`,
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так, скасувати',
          style: 'destructive',
          onPress: async () => {
            try {
              await subscriptionsService.cancel(sub.id);
              await loadSubscriptions();
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося скасувати підписку');
            }
          },
        },
      ]
    );
  };

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
  const pausedSubscriptions = subscriptions.filter((s) => s.status === 'paused');
  const totalMonthly = subscriptionsService.calculateMonthlyTotal(subscriptions);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView 
        className="flex-1 bg-gray-50" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8b5cf6']} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#8b5cf6', '#7c3aed']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="flex-row items-center justify-between pt-14 px-6 mb-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Мої підписки</Text>
            <View className="w-10" />
          </View>

          {/* Stats */}
          <View className="flex-row gap-4 mt-2 pb-4 px-6">
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <Text className="text-white/80 text-sm">Активних</Text>
              <Text className="text-white text-3xl font-bold">{activeSubscriptions.length}</Text>
            </View>
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <Text className="text-white/80 text-sm">На місяць</Text>
              <Text className="text-white text-2xl font-bold">₴{totalMonthly}</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-6 py-6 gap-6 -mt-4">
          {/* Active Subscriptions */}
          {activeSubscriptions.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-gray-800 ml-1">Активні підписки</Text>
              {activeSubscriptions.map((sub) => (
                <View
                  key={sub.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
                >
                  <View className="flex-row items-start gap-4">
                    <View className="bg-violet-100 w-16 h-16 rounded-xl items-center justify-center">
                      <MaterialIcons name="autorenew" size={32} color="#8b5cf6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-bold text-base" numberOfLines={2}>
                        {sub.productName}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className="bg-violet-100 px-2 py-0.5 rounded">
                          <Text className="text-violet-700 text-xs font-semibold">
                            {RECURRENCE_LABELS[sub.frequency] || sub.frequency}
                          </Text>
                        </View>
                        <Text className="text-gray-500 text-sm">
                          ₴{sub.price} × {sub.quantity}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="bg-gray-50 rounded-xl p-3 mt-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons name="local-shipping" size={18} color="#6b7280" />
                      <Text className="text-gray-600 text-sm">Наступна доставка:</Text>
                    </View>
                    <Text className="text-gray-800 font-semibold">{formatDate(sub.nextDelivery)}</Text>
                  </View>

                  <View className="flex-row gap-3 mt-4">
                    <TouchableOpacity
                      onPress={() => handlePauseSubscription(sub)}
                      className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center gap-2"
                    >
                      <MaterialIcons name="pause" size={18} color="#6b7280" />
                      <Text className="text-gray-600 font-semibold">Призупинити</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleCancelSubscription(sub)}
                      className="flex-1 bg-red-50 py-3 rounded-xl flex-row items-center justify-center gap-2"
                    >
                      <MaterialIcons name="close" size={18} color="#ef4444" />
                      <Text className="text-red-500 font-semibold">Скасувати</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Paused Subscriptions */}
          {pausedSubscriptions.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-gray-800 ml-1">Призупинені</Text>
              {pausedSubscriptions.map((sub) => (
                <View
                  key={sub.id}
                  className="bg-gray-100 rounded-2xl p-4 border border-gray-200"
                >
                  <View className="flex-row items-center gap-4">
                    <View className="bg-gray-200 w-14 h-14 rounded-xl items-center justify-center">
                      <MaterialIcons name="pause-circle" size={28} color="#9ca3af" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-600 font-bold" numberOfLines={1}>
                        {sub.productName}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        {RECURRENCE_LABELS[sub.frequency] || sub.frequency} • ₴{sub.price}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleResumeSubscription(sub)}
                      className="bg-violet-500 px-4 py-2 rounded-xl"
                    >
                      <Text className="text-white font-semibold">Відновити</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {subscriptions.length === 0 && (
            <View className="items-center py-12">
              <View className="bg-violet-100 w-24 h-24 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="autorenew" size={48} color="#8b5cf6" />
              </View>
              <Text className="text-gray-800 font-bold text-xl">Немає підписок</Text>
              <Text className="text-gray-500 text-center mt-2 px-8">
                Підпишіться на регулярну доставку улюблених товарів для вашого улюбленця
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/shop')}
                className="bg-violet-500 px-6 py-3 rounded-xl mt-6"
              >
                <Text className="text-white font-bold">Перейти до магазину</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add Subscription CTA */}
          {subscriptions.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/shop')}
              className="bg-violet-50 border-2 border-dashed border-violet-200 rounded-2xl p-6 items-center"
            >
              <MaterialIcons name="add-circle" size={40} color="#8b5cf6" />
              <Text className="text-violet-700 font-bold mt-2">Додати нову підписку</Text>
              <Text className="text-violet-500 text-sm">Перейдіть до магазину</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
}
