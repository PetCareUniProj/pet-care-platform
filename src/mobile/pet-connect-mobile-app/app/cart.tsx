import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'expo-image';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { basketService } from '@/services/api/basket.service';
import { LocalBasketItem } from '@/types/basket.types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { platformAlert } from '@/utils/alert';

// Placeholder styles for cart items
const PLACEHOLDER_STYLE = { bg: '#fef3c7', color: '#d97706', icon: 'pets' as keyof typeof MaterialIcons.glyphMap };

export default function CartScreen() {
  const router = useRouter();
  const theme = useThemedStyles();
  const [items, setItems] = useState<LocalBasketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const loadCart = async () => {
    try {
      setIsLoading(true);
      const basket = await basketService.getBasket();
      setItems(basket.items);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCart();
    setRefreshing(false);
  }, []);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      const updatedBasket = await basketService.updateItemQuantity(itemId, newQuantity);
      setItems(updatedBasket.items);
    } catch (error) {
      platformAlert.alert('Помилка', 'Не вдалося оновити кількість');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    platformAlert.alert(
      'Видалити товар',
      `Видалити "${item?.productName || 'товар'}" з кошика?`,
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedBasket = await basketService.removeItem(itemId);
              setItems(updatedBasket.items);
            } catch (error) {
              console.error('Error removing item:', error);
              platformAlert.alert('Помилка', 'Не вдалося видалити товар');
            }
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    platformAlert.alert(
      'Очистити кошик',
      'Видалити всі товари з кошика?',
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так, очистити',
          style: 'destructive',
          onPress: async () => {
            try {
              await basketService.clearBasket();
              setItems([]);
            } catch (error) {
              console.error('Error clearing cart:', error);
              platformAlert.alert('Помилка', 'Не вдалося очистити кошик');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = (isSubscription: boolean = false) => {
    if (items.length === 0) {
      platformAlert.alert('Кошик порожній', 'Додайте товари до кошика');
      return;
    }
    router.push({
      pathname: '/checkout',
      params: { isSubscription: isSubscription.toString() },
    });
  };

  const formatPrice = (price: number) => {
    return `₴${price.toFixed(0)}`;
  };

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${theme.bgPrimary}`}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className={`flex-1 ${theme.bgPrimary}`}>
        {/* Header */}
        <LinearGradient
          colors={theme.gradientColors.orange}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="flex-row items-center justify-between pt-14 pb-6 px-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Кошик</Text>
            {items.length > 0 ? (
              <TouchableOpacity onPress={handleClearCart} className="p-2 -mr-2">
                <MaterialIcons name="delete-outline" size={24} color="white" />
              </TouchableOpacity>
            ) : (
              <View className="w-10" />
            )}
          </View>
        </LinearGradient>

        {items.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-orange-100 w-24 h-24 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="shopping-cart" size={48} color="#f97316" />
            </View>
            <Text className="text-gray-800 font-bold text-xl">Кошик порожній</Text>
            <Text className="text-gray-500 text-center mt-2">
              Додайте товари з магазину для оформлення замовлення
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/shop')}
              className="bg-orange-500 px-6 py-3 rounded-xl mt-6"
            >
              <Text className="text-white font-bold">Перейти до магазину</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
              }
            >
              <View className="px-6 py-6 gap-4">
                {items.map((item) => {
                  const showPlaceholder = !item.pictureUrl || imageErrors[item.id];
                  
                  return (
                  <View
                    key={item.id}
                    className={`${theme.bgCard} rounded-2xl p-4 border ${theme.borderColor} shadow-sm flex-row`}
                  >
                      {/* Product Image */}
                      <View 
                        className="w-20 h-20 rounded-xl items-center justify-center overflow-hidden mr-4"
                        style={{ backgroundColor: PLACEHOLDER_STYLE.bg }}
                      >
                        {showPlaceholder ? (
                          <MaterialIcons 
                            name={PLACEHOLDER_STYLE.icon} 
                            size={32} 
                            color={PLACEHOLDER_STYLE.color} 
                          />
                        ) : (
                          <Image
                            source={{ uri: item.pictureUrl }}
                            className="w-full h-full"
                            contentFit="cover"
                            onError={() => handleImageError(item.id)}
                          />
                        )}
                      </View>

                      {/* Product Info */}
                      <View className="flex-1">
                        <Text className={`${theme.textPrimary} font-semibold text-base`} numberOfLines={2}>
                          {item.productName}
                        </Text>
                        <Text className="text-orange-600 font-bold text-lg mt-1">
                          {formatPrice(item.unitPrice)}
                        </Text>

                        {/* Quantity Controls */}
                        <View className="flex-row items-center justify-between mt-2">
                          <View className={`flex-row items-center gap-3 ${theme.isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-1`}>
                            <TouchableOpacity
                              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              className={`w-8 h-8 rounded-lg items-center justify-center ${theme.isDark ? 'bg-gray-600' : 'bg-white'}`}
                            >
                              <MaterialIcons name="remove" size={18} color={theme.isDark ? '#e5e7eb' : '#374151'} />
                            </TouchableOpacity>
                            <Text className={`${theme.textPrimary} font-bold text-base w-6 text-center`}>
                              {item.quantity}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg items-center justify-center bg-orange-500"
                            >
                              <MaterialIcons name="add" size={18} color="white" />
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            onPress={() => handleRemoveItem(item.id)}
                            className="p-2"
                          >
                            <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* Checkout Footer */}
            <View className={`${theme.bgCard} border-t ${theme.borderColor} px-6 py-4`}>
              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className={theme.textSecondary}>Товарів: {totalItems}</Text>
                  <Text className={`${theme.textPrimary} font-bold text-xl`}>
                    {formatPrice(totalPrice)}
                  </Text>
                </View>
                
                <View className="gap-3">
                  <TouchableOpacity
                    onPress={() => handleCheckout(false)}
                    className="bg-orange-500 py-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <MaterialIcons name="shopping-bag" size={22} color="white" />
                    <Text className="text-white font-bold text-lg">Оформити замовлення</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => handleCheckout(true)}
                    className="bg-violet-500 py-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <MaterialIcons name="autorenew" size={22} color="white" />
                    <Text className="text-white font-bold text-lg">Оформити підписку</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </>
  );
}
