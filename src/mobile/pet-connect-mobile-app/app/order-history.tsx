import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'expo-image';
import {
  ScrollView,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ordersService } from '@/services/api/orders.service';
import { OrderResponse, OrderStatus } from '@/types/order.types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { platformAlert } from '@/utils/alert';

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  draft: { label: 'Чернетка', color: '#6b7280', bgColor: '#f3f4f6', icon: 'edit' },
  submitted: { label: 'Оформлено', color: '#2563eb', bgColor: '#dbeafe', icon: 'receipt' },
  awaitingvalidation: { label: 'Перевірка', color: '#d97706', bgColor: '#fef3c7', icon: 'hourglass-top' },
  stockconfirmed: { label: 'Підтверджено', color: '#7c3aed', bgColor: '#ede9fe', icon: 'inventory' },
  paid: { label: 'Оплачено', color: '#059669', bgColor: '#d1fae5', icon: 'payment' },
  shipped: { label: 'Відправлено', color: '#0891b2', bgColor: '#cffafe', icon: 'local-shipping' },
  cancelled: { label: 'Скасовано', color: '#dc2626', bgColor: '#fee2e2', icon: 'cancel' },
};

// Placeholder style for product images
const PLACEHOLDER_STYLE = { bg: '#fef3c7', color: '#d97706' };

export default function OrderHistoryScreen() {
  const router = useRouter();
  const theme = useThemedStyles();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      // Get only regular (non-recurring) orders using the API filter
      const response = await ordersService.getRegularOrders({
        sortBy: '-orderDate', // Sort by date descending
      });
      // Filter out drafts (additional client-side filter for safety)
      const sortedOrders = (response.items || [])
        .filter(order => !order.isDraft);
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      platformAlert.alert('Помилка', 'Не вдалося завантажити історію замовлень');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, []);

  const handleImageError = (key: string) => {
    setImageErrors(prev => ({ ...prev, [key]: true }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthNames = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    return `₴${price.toFixed(0)}`;
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.submitted;
  };

  const handleCancelOrder = (order: OrderResponse) => {
    const canCancel = ['submitted', 'awaitingvalidation', 'stockconfirmed'].includes(order.orderStatus.toLowerCase());
    
    if (!canCancel) {
      platformAlert.alert('Неможливо скасувати', 'Це замовлення вже не можна скасувати');
      return;
    }

    platformAlert.alert(
      'Скасувати замовлення',
      `Ви впевнені, що хочете скасувати замовлення #${order.id}?`,
      [
        { text: 'Ні', style: 'cancel' },
        {
          text: 'Так, скасувати',
          style: 'destructive',
          onPress: async () => {
            try {
              await ordersService.cancelOrder(order.id);
              await loadOrders();
              setIsDetailModalVisible(false);
              platformAlert.alert('Готово', 'Замовлення скасовано');
            } catch (error) {
              platformAlert.alert('Помилка', 'Не вдалося скасувати замовлення');
            }
          },
        },
      ]
    );
  };

  const openOrderDetail = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsDetailModalVisible(true);
  };

  const renderOrderCard = ({ item: order }: { item: OrderResponse }) => {
    const statusConfig = getStatusConfig(order.orderStatus);
    const items = order.orderItems || [];
    const itemsCount = items.reduce((sum, item) => sum + item.units, 0);
    const firstItem = items[0];
    const firstItemKey = `${order.id}-${firstItem?.productId}`;
    const showPlaceholder = !firstItem?.pictureUrl || imageErrors[firstItemKey];

    return (
      <TouchableOpacity
        onPress={() => openOrderDetail(order)}
        className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm"
      >
        <View className="flex-row items-start justify-between mb-3">
          <View>
            <Text className="text-gray-800 font-bold text-lg">
              Замовлення #{order.id}
            </Text>
            <Text className="text-gray-500 text-sm">
              {formatDate(order.orderDate)} о {formatTime(order.orderDate)}
            </Text>
          </View>
          <View 
            className="px-3 py-1.5 rounded-full flex-row items-center gap-1"
            style={{ backgroundColor: statusConfig.bgColor }}
          >
            <MaterialIcons name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={{ color: statusConfig.color }} className="text-xs font-semibold">
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <View 
            className="w-16 h-16 rounded-xl items-center justify-center overflow-hidden"
            style={{ backgroundColor: PLACEHOLDER_STYLE.bg }}
          >
            {showPlaceholder ? (
              <MaterialIcons name="shopping-bag" size={28} color={PLACEHOLDER_STYLE.color} />
            ) : (
              <Image
                source={{ uri: firstItem.pictureUrl }}
                className="w-full h-full"
                contentFit="cover"
                onError={() => handleImageError(firstItemKey)}
              />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 font-semibold" numberOfLines={1}>
              {firstItem?.productName || 'Товари'}
            </Text>
            {items.length > 1 && (
              <Text className="text-gray-500 text-sm">
                +{items.length - 1} {items.length - 1 === 1 ? 'товар' : 'товарів'}
              </Text>
            )}
            <Text className="text-gray-400 text-sm mt-1">
              {itemsCount} {itemsCount === 1 ? 'товар' : itemsCount < 5 ? 'товари' : 'товарів'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-orange-600 font-bold text-lg">
              {formatPrice(order.total)}
            </Text>
            {order.isRecurring && (
              <View className="flex-row items-center mt-1">
                <MaterialIcons name="autorenew" size={14} color="#8b5cf6" />
                <Text className="text-violet-600 text-xs ml-1">Підписка</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="items-center py-16">
        <View className="bg-orange-100 w-24 h-24 rounded-full items-center justify-center mb-4">
          <MaterialIcons name="receipt-long" size={48} color="#f97316" />
        </View>
        <Text className="text-gray-800 font-bold text-xl">Немає замовлень</Text>
        <Text className="text-gray-500 text-center mt-2 px-8">
          Ваша історія замовлень порожня. Час зробити перше замовлення!
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/shop')}
          className="bg-orange-500 px-6 py-3 rounded-xl mt-6"
        >
          <Text className="text-white font-bold">Перейти до магазину</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          className="pt-14 pb-6 px-6"
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Історія замовлень</Text>
            <View className="w-10" />
          </View>

          {/* Stats */}
          {orders.length > 0 && (
            <View className="flex-row gap-4 mt-4">
              <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
                <Text className="text-white/80 text-sm">Всього</Text>
                <Text className="text-white text-3xl font-bold">{orders.length}</Text>
              </View>
              <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
                <Text className="text-white/80 text-sm">Сума</Text>
                <Text className="text-white text-2xl font-bold">
                  {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Orders List */}
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
          }
        />
      </View>

      {/* Order Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDetailModalVisible}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[85%]">
            <View className="items-center pt-4 pb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {selectedOrder && (
              <ScrollView className="px-6 pb-6" showsVerticalScrollIndicator={false}>
                {/* Order Header */}
                <View className="flex-row items-center justify-between mb-4">
                  <View>
                    <Text className="text-gray-800 font-bold text-xl">
                      Замовлення #{selectedOrder.id}
                    </Text>
                    <Text className="text-gray-500">
                      {formatDate(selectedOrder.orderDate)} о {formatTime(selectedOrder.orderDate)}
                    </Text>
                  </View>
                  <View 
                    className="px-3 py-1.5 rounded-full flex-row items-center gap-1"
                    style={{ backgroundColor: getStatusConfig(selectedOrder.orderStatus).bgColor }}
                  >
                    <MaterialIcons 
                      name={getStatusConfig(selectedOrder.orderStatus).icon} 
                      size={16} 
                      color={getStatusConfig(selectedOrder.orderStatus).color} 
                    />
                    <Text 
                      style={{ color: getStatusConfig(selectedOrder.orderStatus).color }} 
                      className="font-semibold"
                    >
                      {getStatusConfig(selectedOrder.orderStatus).label}
                    </Text>
                  </View>
                </View>

                {/* Recurring badge */}
                {selectedOrder.isRecurring && (
                  <View className="bg-violet-50 rounded-xl p-3 mb-4 flex-row items-center gap-2">
                    <MaterialIcons name="autorenew" size={20} color="#8b5cf6" />
                    <Text className="text-violet-700 font-semibold">Це замовлення за підпискою</Text>
                  </View>
                )}

                {/* Items */}
                <Text className="text-gray-700 font-bold mb-3">Товари</Text>
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  {(selectedOrder.orderItems || []).map((item, idx) => {
                    const itemKey = `modal-${selectedOrder.id}-${item.productId}-${idx}`;
                    const showPlaceholder = !item.pictureUrl || imageErrors[itemKey];
                    
                    return (
                      <View 
                        key={idx} 
                        className={`flex-row items-center gap-3 ${idx > 0 ? 'pt-3 mt-3 border-t border-gray-200' : ''}`}
                      >
                        <View 
                          className="w-12 h-12 rounded-lg items-center justify-center overflow-hidden"
                          style={{ backgroundColor: PLACEHOLDER_STYLE.bg }}
                        >
                          {showPlaceholder ? (
                            <MaterialIcons name="shopping-bag" size={20} color={PLACEHOLDER_STYLE.color} />
                          ) : (
                            <Image
                              source={{ uri: item.pictureUrl }}
                              className="w-full h-full"
                              contentFit="cover"
                              onError={() => handleImageError(itemKey)}
                            />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-700 font-semibold" numberOfLines={2}>
                            {item.productName}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {formatPrice(item.unitPrice)} × {item.units}
                          </Text>
                        </View>
                        <Text className="text-gray-800 font-bold">
                          {formatPrice(item.unitPrice * item.units)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Address */}
                <Text className="text-gray-700 font-bold mb-3">Адреса доставки</Text>
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <View className="flex-row items-start gap-3">
                    <MaterialIcons name="location-on" size={20} color="#6b7280" />
                    <View className="flex-1">
                      <Text className="text-gray-700">
                        {selectedOrder.address.street}
                      </Text>
                      <Text className="text-gray-500">
                        {selectedOrder.address.city}, {selectedOrder.address.state}
                      </Text>
                      <Text className="text-gray-500">
                        {selectedOrder.address.zipCode}, {selectedOrder.address.country}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Total */}
                <View className="bg-orange-50 rounded-xl p-4 mb-6">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-gray-700 font-semibold text-lg">Разом</Text>
                    <Text className="text-orange-600 font-bold text-2xl">
                      {formatPrice(selectedOrder.total)}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View className="gap-3 mb-6">
                  {['submitted', 'awaitingvalidation', 'stockconfirmed'].includes(selectedOrder.orderStatus.toLowerCase()) && (
                    <TouchableOpacity
                      onPress={() => handleCancelOrder(selectedOrder)}
                      className="bg-red-50 p-4 rounded-xl flex-row items-center justify-center gap-2"
                    >
                      <MaterialIcons name="cancel" size={20} color="#dc2626" />
                      <Text className="text-red-600 font-bold">Скасувати замовлення</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => setIsDetailModalVisible(false)}
                    className="bg-gray-100 p-4 rounded-xl items-center"
                  >
                    <Text className="text-gray-600 font-bold">Закрити</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

