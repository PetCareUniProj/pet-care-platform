import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { catalogService } from '@/services/api/catalog.service';
import { CatalogItem, Category } from '@/types/product.types';

export default function ShopScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        catalogService.getItems({ pageSize: 20 }),
        catalogService.getCategories(),
      ]);
      setProducts(productsData.items);
      setCategories(categoriesData.items);
    } catch (error) {
      console.error('Error loading shop data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || 
      product.categories?.some(c => c.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return `₴${price.toFixed(2)}`;
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
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <LinearGradient
          colors={['#fb923c', '#f59e0b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-14 pb-6 px-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Магазин</Text>
            <TouchableOpacity className="p-2 -mr-2">
              <MaterialIcons name="shopping-cart" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="bg-white/20 rounded-2xl flex-row items-center px-4 py-3 border border-white/30">
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
                        <TouchableOpacity className="bg-orange-500 p-2 rounded-xl">
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
    </>
  );
}

