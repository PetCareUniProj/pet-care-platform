import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'expo-image';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { catalogService } from '@/services/api/catalog.service';
import { basketService } from '@/services/api/basket.service';
import { subscriptionsService, CreateLocalSubscriptionDto } from '@/services/api/subscriptions.service';
import { CatalogItem, Category } from '@/types/product.types';
import { RecurrenceInterval, RECURRENCE_LABELS } from '@/types/order.types';

export default function ShopScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Subscription modal
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false);
  const [subscriptionFrequency, setSubscriptionFrequency] = useState<RecurrenceInterval>('Monthly');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        catalogService.getItems({ pageSize: 50 }),
        catalogService.getCategories(),
      ]);
      setProducts(productsData.items);
      setCategories(categoriesData.items);
      
      // Update cart count
      const basket = await basketService.getBasket();
      setCartCount(basket.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || 
      product.categories?.some(c => c.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return `₴${price.toFixed(0)}`;
  };

  const handleAddToCart = async (product: CatalogItem, qty: number = 1) => {
    try {
      await basketService.addItem({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: qty,
        pictureUrl: product.pictureUri,
      });
      
      const basket = await basketService.getBasket();
      setCartCount(basket.items.reduce((sum, item) => sum + item.quantity, 0));
      
      Alert.alert('Успішно', `${product.name} додано до кошика`);
      setIsProductModalVisible(false);
      setQuantity(1);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося додати товар до кошика');
    }
  };

  const handleCreateSubscription = async () => {
    if (!selectedProduct) return;

    try {
      const dto: CreateLocalSubscriptionDto = {
        productId: String(selectedProduct.id),
        productName: selectedProduct.name,
        productImage: selectedProduct.pictureUri,
        frequency: subscriptionFrequency,
        price: selectedProduct.price,
        quantity: quantity,
      };

      await subscriptionsService.create(dto);
      
      Alert.alert('Успішно', `Підписку на "${selectedProduct.name}" створено`);
      setIsSubscriptionModalVisible(false);
      setIsProductModalVisible(false);
      setQuantity(1);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося створити підписку');
    }
  };

  const openProductModal = (product: CatalogItem) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsProductModalVisible(true);
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-gray-50 ">
        {/* Header */}
        <LinearGradient
          colors={['#fb923c', '#f59e0b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-14 pb-6 px-6"
        >
          <View className="flex-row items-center justify-between pt-14 px-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Магазин</Text>
            <TouchableOpacity className="p-2 -mr-2 relative">
              <MaterialIcons name="shopping-cart" size={24} color="white" />
              {cartCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-white/20 rounded-2xl flex-row items-center px-4 py-3 border border-white/30 m-4">
            <MaterialIcons name="search" size={22} color="white" />
            <TextInput
              placeholder="Пошук товарів..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-white text-base"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
          }
        >
          {/* Categories */}
          <View className="py-4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setSelectedCategory(null)}
                  className={`px-5 py-3 rounded-full ${
                    !selectedCategory ? 'bg-orange-500' : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text className={`font-semibold ${!selectedCategory ? 'text-white' : 'text-gray-600'}`}>
                    Всі
                  </Text>
                </TouchableOpacity>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    className={`px-5 py-3 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-orange-500'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        selectedCategory === category.id ? 'text-white' : 'text-gray-600'
                      }`}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Products Grid */}
          <View className="px-4 pb-8">
            {filteredProducts.length === 0 ? (
              <View className="items-center py-12">
                <MaterialIcons name="search-off" size={64} color="#d1d5db" />
                <Text className="text-gray-500 font-semibold mt-4">Товари не знайдено</Text>
                <Text className="text-gray-400 text-sm">Спробуйте змінити параметри пошуку</Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-4">
                {filteredProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => openProductModal(product)}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                    style={{ width: '47%' }}
                  >
                    <View className="aspect-square bg-gray-100 items-center justify-center">
                      {product.pictureUri ? (
                        <Image
                          source={{ uri: product.pictureUri }}
                          className="w-full h-full"
                          contentFit="cover"
                        />
                      ) : (
                        <MaterialIcons name="inventory-2" size={48} color="#d1d5db" />
                      )}
                    </View>
                    <View className="p-3">
                      <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>
                        {product.name}
                      </Text>
                      {product.brand && (
                        <Text className="text-gray-400 text-xs mt-1">{product.brand.name}</Text>
                      )}
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-orange-600 font-bold text-lg">
                          {formatPrice(product.price)}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => handleAddToCart(product)}
                          className="bg-orange-500 p-2 rounded-xl"
                        >
                          <MaterialIcons name="add-shopping-cart" size={18} color="white" />
                        </TouchableOpacity>
                      </View>
                      {product.availableStock <= 5 && product.availableStock > 0 && (
                        <Text className="text-amber-600 text-xs mt-1">
                          Залишилось: {product.availableStock}
                        </Text>
                      )}
                      {product.availableStock === 0 && (
                        <Text className="text-red-500 text-xs mt-1 font-semibold">
                          Немає в наявності
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Product Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isProductModalVisible}
        onRequestClose={() => setIsProductModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
            </View>

            {selectedProduct && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View className="aspect-square bg-gray-100 rounded-2xl items-center justify-center mb-4 overflow-hidden">
                  {selectedProduct.pictureUri ? (
                    <Image
                      source={{ uri: selectedProduct.pictureUri }}
                      className="w-full h-full"
                      contentFit="cover"
                    />
                  ) : (
                    <MaterialIcons name="inventory-2" size={80} color="#d1d5db" />
                  )}
                </View>

                {/* Product Info */}
                <Text className="text-gray-800 font-bold text-xl">{selectedProduct.name}</Text>
                {selectedProduct.brand && (
                  <Text className="text-gray-500 text-sm mt-1">{selectedProduct.brand.name}</Text>
                )}
                {selectedProduct.description && (
                  <Text className="text-gray-600 mt-2">{selectedProduct.description}</Text>
                )}

                <Text className="text-orange-600 font-bold text-2xl mt-4">
                  {formatPrice(selectedProduct.price)}
                </Text>

                {/* Quantity Selector */}
                <View className="flex-row items-center justify-between mt-6 bg-gray-50 rounded-xl p-4">
                  <Text className="text-gray-700 font-semibold">Кількість</Text>
                  <View className="flex-row items-center gap-4">
                    <TouchableOpacity
                      onPress={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-gray-200 w-10 h-10 rounded-full items-center justify-center"
                    >
                      <MaterialIcons name="remove" size={20} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-gray-800 font-bold text-xl w-8 text-center">{quantity}</Text>
                    <TouchableOpacity
                      onPress={() => setQuantity(quantity + 1)}
                      className="bg-orange-500 w-10 h-10 rounded-full items-center justify-center"
                    >
                      <MaterialIcons name="add" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Total */}
                <View className="flex-row items-center justify-between mt-4 bg-orange-50 rounded-xl p-4">
                  <Text className="text-gray-700 font-semibold">Разом</Text>
                  <Text className="text-orange-600 font-bold text-xl">
                    {formatPrice(selectedProduct.price * quantity)}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="mt-6 gap-3">
                  <TouchableOpacity
                    onPress={() => handleAddToCart(selectedProduct, quantity)}
                    className="bg-orange-500 p-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <MaterialIcons name="add-shopping-cart" size={22} color="white" />
                    <Text className="text-white font-bold text-lg">Додати до кошика</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsSubscriptionModalVisible(true)}
                    className="bg-violet-500 p-4 rounded-xl flex-row items-center justify-center gap-2"
                  >
                    <MaterialIcons name="autorenew" size={22} color="white" />
                    <Text className="text-white font-bold text-lg">Оформити підписку</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsProductModalVisible(false)}
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

      {/* Subscription Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSubscriptionModalVisible}
        onRequestClose={() => setIsSubscriptionModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-[90%] gap-4">
            <View className="items-center mb-2">
              <View className="bg-violet-100 w-16 h-16 rounded-full items-center justify-center mb-2">
                <MaterialIcons name="autorenew" size={32} color="#8b5cf6" />
              </View>
              <Text className="text-xl font-bold text-gray-800">Нова підписка</Text>
              <Text className="text-gray-500 text-center mt-1">
                {selectedProduct?.name}
              </Text>
            </View>

            <Text className="text-gray-600 font-semibold">Періодичність доставки</Text>
            <View className="flex-row flex-wrap gap-2">
              {(['Weekly', 'Biweekly', 'Monthly'] as RecurrenceInterval[]).map((freq) => (
                <TouchableOpacity
                  key={freq}
                  onPress={() => setSubscriptionFrequency(freq)}
                  className={`px-4 py-3 rounded-xl flex-1 items-center ${
                    subscriptionFrequency === freq ? 'bg-violet-500' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      subscriptionFrequency === freq ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {RECURRENCE_LABELS[freq]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="bg-violet-50 p-4 rounded-xl">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Ціна за доставку</Text>
                <Text className="text-gray-800 font-semibold">
                  {formatPrice((selectedProduct?.price || 0) * quantity)}
                </Text>
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-gray-600">Кількість</Text>
                <Text className="text-gray-800 font-semibold">{quantity} шт.</Text>
              </View>
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 bg-gray-200 p-4 rounded-xl items-center"
                onPress={() => setIsSubscriptionModalVisible(false)}
              >
                <Text className="font-bold text-gray-700">Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-violet-500 p-4 rounded-xl items-center"
                onPress={handleCreateSubscription}
              >
                <Text className="font-bold text-white">Підписатись</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
