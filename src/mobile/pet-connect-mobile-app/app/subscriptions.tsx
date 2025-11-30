import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'expo-image';
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
import { subscriptionsService, Subscription } from '@/services/api/subscriptions.service';
import { useThemedStyles } from '@/hooks/useThemedStyles';

// Placeholder style for subscription images
const PLACEHOLDER_STYLE = { bg: '#f3e8ff', color: '#8b5cf6' };

export default function SubscriptionsScreen() {
  const router = useRouter();
  const theme = useThemedStyles();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

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

  const handleImageError = (subId: number) => {
    setImageErrors(prev => ({ ...prev, [subId]: true }));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Очікується';
    const date = new Date(dateStr);
    const monthNames = ['січ', 'лют', 'бер', 'квіт', 'трав', 'черв', 'лип', 'серп', 'вер', 'жовт', 'лист', 'груд'];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleCancelSubscription = (sub: Subscription) => {
    Alert.alert(
      '⚠️ Скасувати підписку',
      `Ви впевнені, що хочете скасувати підписку на "${sub.productName}"?\n\nЦю дію неможливо буде відмінити.`,
      [
        { text: 'Ні, залишити', style: 'cancel' },
        {
          text: 'Так, скасувати',
          style: 'destructive',
          onPress: async () => {
            try {
              await subscriptionsService.cancel(sub.id);
              await loadSubscriptions();
              Alert.alert('Готово', 'Підписку скасовано');
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося скасувати підписку');
            }
          },
        },
      ]
    );
  };

  const renderSubscriptionImage = (sub: Subscription) => {
    const showPlaceholder = !sub.productImage || imageErrors[sub.id];
    
    return (
      <View 
        className="w-16 h-16 rounded-xl items-center justify-center overflow-hidden"
        style={{ backgroundColor: PLACEHOLDER_STYLE.bg }}
      >
        {showPlaceholder ? (
          <MaterialIcons name="shopping-bag" size={28} color={PLACEHOLDER_STYLE.color} />
        ) : (
          <Image
            source={{ uri: sub.productImage }}
            className="w-full h-full"
            contentFit="cover"
            onError={() => handleImageError(sub.id)}
          />
        )}
      </View>
    );
  };

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active');
  const shippedSubscriptions = subscriptions.filter((s) => s.status === 'shipped');
  const cancelledSubscriptions = subscriptions.filter((s) => s.status === 'cancelled');
  const totalMonthly = subscriptionsService.calculateMonthlyTotal(subscriptions);

  // Format monthly total with 1 decimal place
  const formatMonthlyTotal = (amount: number) => {
    return amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(1);
  };

  const formatPrice = (price: number) => {
    return `₴${price.toFixed(0)}`;
  };

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${theme.bgPrimary}`}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView 
        className={`flex-1 ${theme.bgPrimary}`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#8b5cf6']} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={theme.gradientColors.violet}
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
              <Text className="text-white text-2xl font-bold">₴{formatMonthlyTotal(totalMonthly)}</Text>
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
                    {renderSubscriptionImage(sub)}
                    <View className="flex-1">
                      <Text className="text-gray-800 font-bold text-base" numberOfLines={2}>
                        {sub.productName}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className="bg-violet-100 px-2 py-0.5 rounded">
                          <Text className="text-violet-700 text-xs font-semibold">
                            {sub.frequencyLabel}
                          </Text>
                        </View>
                        <Text className="text-gray-500 text-sm">
                          {formatPrice(sub.price)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Items list if multiple */}
                  {sub.items.length > 1 && (
                    <View className="mt-3 bg-gray-50 rounded-xl p-3">
                      {sub.items.slice(0, 3).map((item, idx) => (
                        <View key={idx} className="flex-row justify-between py-1">
                          <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                            {item.productName}
                          </Text>
                          <Text className="text-gray-500 text-sm ml-2">
                            ×{item.units}
                          </Text>
                        </View>
                      ))}
                      {sub.items.length > 3 && (
                        <Text className="text-gray-400 text-sm mt-1">
                          +{sub.items.length - 3} товарів
                        </Text>
                      )}
                    </View>
                  )}

                  <View className="bg-gray-50 rounded-xl p-3 mt-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons name="local-shipping" size={18} color="#6b7280" />
                      <Text className="text-gray-600 text-sm">Наступна доставка:</Text>
                    </View>
                    <Text className="text-gray-800 font-semibold">{formatDate(sub.nextDelivery)}</Text>
                  </View>

                  <View className="flex-row gap-3 mt-4">
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

          {/* Shipped Subscriptions */}
          {shippedSubscriptions.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-gray-800 ml-1">Очікують доставки</Text>
              {shippedSubscriptions.map((sub) => (
                <View
                  key={sub.id}
                  className="bg-blue-50 rounded-2xl p-4 border border-blue-100"
                >
                  <View className="flex-row items-center gap-4">
                    <View 
                      className="w-14 h-14 rounded-xl items-center justify-center overflow-hidden"
                      style={{ backgroundColor: '#dbeafe' }}
                    >
                      <MaterialIcons name="local-shipping" size={28} color="#2563eb" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-700 font-bold" numberOfLines={1}>
                        {sub.productName}
                      </Text>
                      <Text className="text-blue-600 text-sm">
                        В дорозі • {formatPrice(sub.price)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Cancelled Subscriptions */}
          {cancelledSubscriptions.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-gray-500 ml-1">Скасовані</Text>
              {cancelledSubscriptions.slice(0, 3).map((sub) => (
                <View
                  key={sub.id}
                  className="bg-gray-100 rounded-2xl p-4 border border-gray-200"
                >
                  <View className="flex-row items-center gap-4">
                    <View 
                      className="w-14 h-14 rounded-xl items-center justify-center overflow-hidden"
                      style={{ backgroundColor: '#e5e7eb' }}
                    >
                      <MaterialIcons name="cancel" size={28} color="#9ca3af" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-500 font-bold" numberOfLines={1}>
                        {sub.productName}
                      </Text>
                      <Text className="text-gray-400 text-sm">
                        Скасовано
                      </Text>
                    </View>
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
