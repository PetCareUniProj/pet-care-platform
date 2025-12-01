import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { basketService } from '@/services/api/basket.service';
import { checkoutService } from '@/services/api/checkout.service';
import { ordersService } from '@/services/api/orders.service';
import { LocalBasketItem } from '@/types/basket.types';
import { RecurrenceInterval, RECURRENCE_LABELS, CardType } from '@/types/order.types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { platformAlert } from '@/utils/alert';

// Recurrence options for subscriptions
const RECURRENCE_OPTIONS: { value: RecurrenceInterval; label: string }[] = [
  { value: '7.00:00:00', label: RECURRENCE_LABELS['7.00:00:00'] },
  { value: '14.00:00:00', label: RECURRENCE_LABELS['14.00:00:00'] },
  { value: '30.00:00:00', label: RECURRENCE_LABELS['30.00:00:00'] },
  { value: '60.00:00:00', label: RECURRENCE_LABELS['60.00:00:00'] },
  { value: '90.00:00:00', label: RECURRENCE_LABELS['90.00:00:00'] },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ isSubscription?: string }>();
  const theme = useThemedStyles();
  
  // Items
  const [items, setItems] = useState<LocalBasketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Card types
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  
  // Subscription options
  const [isSubscription, setIsSubscription] = useState(params.isSubscription === 'true');
  const [recurrenceInterval, setRecurrenceInterval] = useState<RecurrenceInterval>('30.00:00:00');
  
  // Address form
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('Україна');
  const [zipCode, setZipCode] = useState('');
  
  // Payment form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedCardType, setSelectedCardType] = useState<number>(1);
  
  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [basket, types] = await Promise.all([
        basketService.getBasket(),
        ordersService.getCardTypes().catch(() => [
          { id: 1, name: 'Visa' },
          { id: 2, name: 'MasterCard' },
          { id: 3, name: 'Amex' },
        ]),
      ]);
      setItems(basket.items);
      setCardTypes(types);
      if (types.length > 0) {
        setSelectedCardType(types[0].id);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
      platformAlert.alert('Помилка', 'Не вдалося завантажити дані');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatPrice = (price: number) => {
    return `₴${price.toFixed(0)}`;
  };

  const totalPrice = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19);
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  // Parse expiry to Date
  const parseExpiry = (expiry: string): Date => {
    const [month, year] = expiry.split('/');
    const fullYear = parseInt(`20${year}`, 10);
    return new Date(fullYear, parseInt(month, 10) - 1, 1);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Address validation
    if (!street.trim()) newErrors.street = "Вкажіть вулицю";
    if (!city.trim()) newErrors.city = "Вкажіть місто";
    if (!state.trim()) newErrors.state = "Вкажіть область";
    if (!country.trim()) newErrors.country = "Вкажіть країну";
    if (!zipCode.trim()) newErrors.zipCode = "Вкажіть поштовий індекс";
    
    // Payment validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      newErrors.cardNumber = "Невірний номер картки";
    }
    if (!cardHolderName.trim()) newErrors.cardHolderName = "Вкажіть ім'я власника";
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      newErrors.cardExpiry = "Формат: MM/YY";
    } else {
      const expiryDate = parseExpiry(cardExpiry);
      if (expiryDate < new Date()) {
        newErrors.cardExpiry = "Картка прострочена";
      }
    }
    if (cardCvv.length < 3) newErrors.cardCvv = "CVV має 3-4 цифри";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      platformAlert.alert('Помилка', 'Будь ласка, заповніть всі поля коректно');
      return;
    }

    if (items.length === 0) {
      platformAlert.alert('Помилка', 'Кошик порожній');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await checkoutService.checkout({
        street,
        city,
        state,
        country,
        zipCode,
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolderName,
        cardExpiration: parseExpiry(cardExpiry),
        cardSecurityNumber: cardCvv,
        cardTypeId: selectedCardType,
        isRecurring: isSubscription,
        recurrenceInterval: isSubscription ? recurrenceInterval : undefined,
      });

      if (result.success) {
        platformAlert.alert(
          'Успіх!',
          isSubscription 
            ? `Підписку #${result.order?.id} успішно оформлено!\nНаступна доставка: ${result.order?.nextRecurrenceDate ? new Date(result.order.nextRecurrenceDate).toLocaleDateString('uk-UA') : 'скоро'}`
            : `Замовлення #${result.order?.id} успішно оформлено!`,
          [
            {
              text: 'До замовлень',
              onPress: () => {
                router.replace('/order-history');
              },
            },
          ]
        );
      } else {
        platformAlert.alert('Помилка', result.error || 'Не вдалося оформити замовлення');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      platformAlert.alert('Помилка', error?.message || 'Не вдалося оформити замовлення');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${theme.bgPrimary}`}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View className={`flex-1 ${theme.bgPrimary}`}>
          <LinearGradient
            colors={isSubscription ? theme.gradientColors.violet : theme.gradientColors.orange}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View className="flex-row items-center justify-between pt-14 pb-6 px-6">
              <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold">Оформлення</Text>
              <View className="w-10" />
            </View>
          </LinearGradient>

          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-orange-100 w-24 h-24 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="shopping-cart" size={48} color="#f97316" />
            </View>
            <Text className="text-gray-800 font-bold text-xl">Кошик порожній</Text>
            <Text className="text-gray-500 text-center mt-2">
              Додайте товари до кошика для оформлення замовлення
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/shop')}
              className="bg-orange-500 px-6 py-3 rounded-xl mt-6"
            >
              <Text className="text-white font-bold">До магазину</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className={`flex-1 ${theme.bgPrimary}`}>
        {/* Header */}
        <LinearGradient
          colors={isSubscription ? theme.gradientColors.violet : theme.gradientColors.orange}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="flex-row items-center justify-between pt-14 pb-6 px-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">
              {isSubscription ? 'Оформлення підписки' : 'Оформлення замовлення'}
            </Text>
            <View className="w-10" />
          </View>
        </LinearGradient>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-6 gap-6">
              {/* Order Summary */}
              <View className={`${theme.bgCard} rounded-2xl p-4 border ${theme.borderColor}`}>
                <Text className={`${theme.textPrimary} font-bold text-lg mb-3`}>Ваше замовлення</Text>
                <View className="gap-2">
                  {items.map((item) => (
                    <View key={item.id} className="flex-row justify-between">
                      <Text className={theme.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                        {item.productName} × {item.quantity}
                      </Text>
                      <Text className={`${theme.textPrimary} font-semibold ml-2`}>
                        {formatPrice(item.unitPrice * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>
                <View className="border-t border-gray-200 mt-3 pt-3 flex-row justify-between">
                  <Text className={`${theme.textPrimary} font-bold`}>Разом ({totalItems} товарів):</Text>
                  <Text className="text-orange-600 font-bold text-lg">{formatPrice(totalPrice)}</Text>
                </View>
              </View>

              {/* Subscription Toggle */}
              <View className={`${theme.bgCard} rounded-2xl p-4 border ${theme.borderColor}`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${isSubscription ? 'bg-violet-100' : 'bg-gray-100'}`}>
                      <MaterialIcons name="autorenew" size={24} color={isSubscription ? '#8b5cf6' : '#9ca3af'} />
                    </View>
                    <View className="flex-1">
                      <Text className={`${theme.textPrimary} font-semibold`}>Оформити як підписку</Text>
                      <Text className={`${theme.textSecondary} text-sm`}>Регулярна доставка товарів</Text>
                    </View>
                  </View>
                  <Switch
                    value={isSubscription}
                    onValueChange={setIsSubscription}
                    trackColor={{ false: '#d1d5db', true: '#c4b5fd' }}
                    thumbColor={isSubscription ? '#8b5cf6' : '#f3f4f6'}
                  />
                </View>

                {isSubscription && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <Text className={`${theme.textSecondary} text-sm mb-3`}>Частота доставки:</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {RECURRENCE_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          onPress={() => setRecurrenceInterval(option.value)}
                          className={`px-4 py-2 rounded-xl ${
                            recurrenceInterval === option.value 
                              ? 'bg-violet-500' 
                              : theme.isDark ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <Text className={
                            recurrenceInterval === option.value 
                              ? 'text-white font-semibold' 
                              : theme.textSecondary
                          }>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Delivery Address */}
              <View className={`${theme.bgCard} rounded-2xl p-4 border ${theme.borderColor}`}>
                <View className="flex-row items-center gap-2 mb-4">
                  <MaterialIcons name="location-on" size={24} color="#f97316" />
                  <Text className={`${theme.textPrimary} font-bold text-lg`}>Адреса доставки</Text>
                </View>

                <View className="gap-4">
                  <View>
                    <Text className={`${theme.textSecondary} text-sm mb-1`}>Вулиця, будинок, квартира</Text>
                    <TextInput
                      value={street}
                      onChangeText={setStreet}
                      placeholder="вул. Хрещатик, 1, кв. 10"
                      placeholderTextColor="#9ca3af"
                      className={`${theme.isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl px-4 py-3`}
                    />
                    {errors.street && <Text className="text-red-500 text-xs mt-1">{errors.street}</Text>}
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className={`${theme.textSecondary} text-sm mb-1`}>Місто</Text>
                      <TextInput
                        value={city}
                        onChangeText={setCity}
                        placeholder="Київ"
                        placeholderTextColor="#9ca3af"
                        className={`${theme.isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl px-4 py-3`}
                      />
                      {errors.city && <Text className="text-red-500 text-xs mt-1">{errors.city}</Text>}
                    </View>
                    <View className="flex-1">
                      <Text className={`${theme.textSecondary} text-sm mb-1`}>Область</Text>
                      <TextInput
                        value={state}
                        onChangeText={setState}
                        placeholder="Київська"
                        placeholderTextColor="#9ca3af"
                        className={`${theme.isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl px-4 py-3`}
                      />
                      {errors.state && <Text className="text-red-500 text-xs mt-1">{errors.state}</Text>}
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className={`${theme.textSecondary} text-sm mb-1`}>Країна</Text>
                      <TextInput
                        value={country}
                        onChangeText={setCountry}
                        placeholder="Україна"
                        placeholderTextColor="#9ca3af"
                        className={`${theme.isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl px-4 py-3`}
                      />
                      {errors.country && <Text className="text-red-500 text-xs mt-1">{errors.country}</Text>}
                    </View>
                    <View className="flex-1">
                      <Text className={`${theme.textSecondary} text-sm mb-1`}>Індекс</Text>
                      <TextInput
                        value={zipCode}
                        onChangeText={setZipCode}
                        placeholder="01001"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        className={`${theme.isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl px-4 py-3`}
                      />
                      {errors.zipCode && <Text className="text-red-500 text-xs mt-1">{errors.zipCode}</Text>}
                    </View>
                  </View>
                </View>
              </View>

              {/* Payment */}
              <View className={`${theme.bgCard} rounded-2xl p-4 border ${theme.borderColor}`}>
                <View className="flex-row items-center gap-2 mb-4">
                  <MaterialIcons name="credit-card" size={24} color="#f97316" />
                  <Text className={`${theme.textPrimary} font-bold text-lg`}>Оплата карткою</Text>
                </View>

                {/* Card Type Selection */}
                {cardTypes.length > 0 && (
                  <View className="mb-4">
                    <Text className={`${theme.textSecondary} text-sm mb-2`}>Тип картки</Text>
                    <View className="flex-row gap-2">
                      {cardTypes.map((type) => (
                        <TouchableOpacity
                          key={type.id}
                          onPress={() => setSelectedCardType(type.id)}
                          className={`px-4 py-2 rounded-xl ${
                            selectedCardType === type.id 
                              ? 'bg-orange-500' 
                              : theme.isDark ? 'bg-gray-700' : 'bg-gray-100'
                          }`}
                        >
                          <Text className={
                            selectedCardType === type.id 
                              ? 'text-white font-semibold' 
                              : theme.textSecondary
                          }>
                            {type.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View className="gap-4">
                  <View>
                    <Text className={`${theme.textSecondary} text-sm mb-1`}>Номер картки</Text>
                    <TextInput
                      value={cardNumber}
                      onChangeText={(v) => setCardNumber(formatCardNumber(v))}
                      placeholder="0000 0000 0000 0000"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={19}
                      className={`${theme.isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl px-4 py-3`}
                    />
                    {errors.cardNumber && <Text className="text-red-500 text-xs mt-1">{errors.cardNumber}</Text>}
                  </View>

                  <View>
                    <Text className={`${theme.textSecondary} text-sm mb-1`}>Ім'я власника картки</Text>
                    <TextInput
                      value={cardHolderName}
                      onChangeText={setCardHolderName}
                      placeholder="IVAN PETRENKO"
                      placeholderTextColor="#9ca3af"
                      autoCapitalize="characters"
                      className={`${theme.isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl px-4 py-3`}
                    />
                    {errors.cardHolderName && <Text className="text-red-500 text-xs mt-1">{errors.cardHolderName}</Text>}
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className={`${theme.textSecondary} text-sm mb-1`}>Термін дії</Text>
                      <TextInput
                        value={cardExpiry}
                        onChangeText={(v) => setCardExpiry(formatExpiry(v))}
                        placeholder="MM/YY"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        maxLength={5}
                        className={`${theme.isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl px-4 py-3`}
                      />
                      {errors.cardExpiry && <Text className="text-red-500 text-xs mt-1">{errors.cardExpiry}</Text>}
                    </View>
                    <View className="flex-1">
                      <Text className={`${theme.textSecondary} text-sm mb-1`}>CVV</Text>
                      <TextInput
                        value={cardCvv}
                        onChangeText={(v) => setCardCvv(v.replace(/\D/g, '').substring(0, 4))}
                        placeholder="123"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        secureTextEntry
                        maxLength={4}
                        className={`${theme.isDark ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} rounded-xl px-4 py-3`}
                      />
                      {errors.cardCvv && <Text className="text-red-500 text-xs mt-1">{errors.cardCvv}</Text>}
                    </View>
                  </View>
                </View>
              </View>

              {/* Security Note */}
              <View className="flex-row items-center gap-2 px-2">
                <MaterialIcons name="lock" size={16} color="#9ca3af" />
                <Text className={`${theme.textSecondary} text-xs flex-1`}>
                  Ваші платіжні дані захищені шифруванням
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <View className={`${theme.bgCard} border-t ${theme.borderColor} px-6 py-4`}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`${isSubscription ? 'bg-violet-500' : 'bg-orange-500'} p-4 rounded-xl flex-row items-center justify-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialIcons 
                    name={isSubscription ? 'autorenew' : 'shopping-bag'} 
                    size={22} 
                    color="white" 
                  />
                  <Text className="text-white font-bold text-lg">
                    {isSubscription ? 'Оформити підписку' : 'Оплатити'} {formatPrice(totalPrice)}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

