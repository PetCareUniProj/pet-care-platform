import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Image } from 'expo-image';
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { catalogService } from '@/services/api/catalog.service';
import { basketService } from '@/services/api/basket.service';
import { subscriptionsService, CreateLocalSubscriptionDto } from '@/services/api/subscriptions.service';
import { CatalogItem, Category, Brand, ProductSortField } from '@/types/product.types';
import { RecurrenceInterval, RECURRENCE_LABELS } from '@/types/order.types';
import { getProductImageUrl } from '@/constants/api';
import { useThemedStyles } from '@/hooks/useThemedStyles';

const PAGE_SIZE = 10;

// Sort options
const SORT_OPTIONS: { value: ProductSortField; label: string }[] = [
  { value: 'name', label: 'Назва (А-Я)' },
  { value: '-name', label: 'Назва (Я-А)' },
  { value: 'price', label: 'Ціна (зростання)' },
  { value: '-price', label: 'Ціна (спадання)' },
];

// Category styling for placeholder images - using warm colors for pet store
const CATEGORY_STYLES: Record<number, { bg: string; color: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  1: { bg: '#fef3c7', color: '#d97706', icon: 'restaurant' },
  2: { bg: '#dbeafe', color: '#2563eb', icon: 'sports-baseball' },
  3: { bg: '#f3e8ff', color: '#7c3aed', icon: 'content-cut' },
  4: { bg: '#dcfce7', color: '#16a34a', icon: 'medical-services' },
  5: { bg: '#fce7f3', color: '#db2777', icon: 'checkroom' },
  6: { bg: '#e0e7ff', color: '#4f46e5', icon: 'night-shelter' },
  7: { bg: '#ccfbf1', color: '#0d9488', icon: 'local-shipping' },
  8: { bg: '#fed7aa', color: '#ea580c', icon: 'set-meal' },
};

// Default placeholder style - warm orange for pets
const DEFAULT_PLACEHOLDER = { bg: '#fef3c7', color: '#d97706', icon: 'pets' as keyof typeof MaterialIcons.glyphMap };

export default function ShopScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { width: screenWidth } = useWindowDimensions();
  const theme = useThemedStyles();
  
  // Calculate item width for 2 columns with padding
  const ITEM_WIDTH = (screenWidth - 48) / 2; // 16px padding on each side + 16px gap
  
  // Data
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ProductSortField>('name');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);

  // Product detail modal
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Subscription modal
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false);
  const [subscriptionFrequency, setSubscriptionFrequency] = useState<RecurrenceInterval>('30.00:00:00');

  // Get placeholder style for a product based on its first category
  const getPlaceholderStyle = (categoryIds: number[]) => {
    if (categoryIds.length === 0) return DEFAULT_PLACEHOLDER;
    const firstCategoryId = categoryIds[0];
    return CATEGORY_STYLES[firstCategoryId] || DEFAULT_PLACEHOLDER;
  };

  // Build query params for API
  const buildQueryParams = useCallback((page: number) => {
    const params: any = {
      page,
      pageSize: PAGE_SIZE,
      sortBy,
    };
    
    if (selectedCategory) {
      params.categoryId = selectedCategory;
    }
    
    if (selectedBrands.length === 1) {
      params.brandId = selectedBrands[0];
    }
    
    if (searchQuery.trim()) {
      params.name = searchQuery.trim();
    }
    
    return params;
  }, [selectedCategory, selectedBrands, searchQuery, sortBy]);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [categoriesData, brandsData] = await Promise.all([
        catalogService.getCategories({ pageSize: 25 }),
        catalogService.getBrands({ pageSize: 25 }),
      ]);
      
      setCategories(categoriesData.items);
      setBrands(brandsData.items);
      
      // Load cart count
      const basket = await basketService.getBasket();
      setCartCount(basket.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error: any) {
      console.error('Error loading initial data:', error);
    }
  };

  // Load products with current filters
  const loadProducts = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const params = buildQueryParams(page);
      const response = await catalogService.getItems(params);
      
      let filteredItems = response.items;
      
      // Client-side filtering for multiple brands (API only supports one brandId)
      if (selectedBrands.length > 1) {
        filteredItems = filteredItems.filter(item => 
          selectedBrands.includes(item.catalogBrandId)
        );
      }
      
      // Client-side price filtering
      const min = minPrice ? parseFloat(minPrice) : null;
      const max = maxPrice ? parseFloat(maxPrice) : null;
      
      if (min !== null || max !== null) {
        filteredItems = filteredItems.filter(item => {
          if (min !== null && item.price < min) return false;
          if (max !== null && item.price > max) return false;
          return true;
        });
      }
      
      if (append) {
        setProducts(prev => [...prev, ...filteredItems]);
      } else {
        setProducts(filteredItems);
      }
      
      setCurrentPage(page);
      setHasMore(response.items.length === PAGE_SIZE);
    } catch (error: any) {
      console.error('Error loading products:', error);
      if (page === 1) {
        Alert.alert(
          'Помилка завантаження',
          `Не вдалося завантажити товари.\n\n${error?.message || 'Невідома помилка'}`,
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts(1, false);
  }, [selectedCategory, selectedBrands, sortBy]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(1, false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load more products (infinite scroll)
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      loadProducts(currentPage + 1, true);
    }
  }, [currentPage, hasMore, isLoadingMore, isLoading]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProducts(1, false);
    // Update cart count
    const basket = await basketService.getBasket();
    setCartCount(basket.items.reduce((sum, item) => sum + item.quantity, 0));
    setRefreshing(false);
  }, [buildQueryParams]);

  // Apply price filter
  const applyFilters = () => {
    setIsFilterModalVisible(false);
    loadProducts(1, false);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedBrands([]);
    setMinPrice('');
    setMaxPrice('');
    setIsFilterModalVisible(false);
    loadProducts(1, false);
  };

  // Toggle brand selection
  const toggleBrand = (brandId: number) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Select category
  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    // Scroll to top when category changes
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Navigate to cart
  const handleCartPress = () => {
    router.push('/cart');
  };

  const formatPrice = (price: number) => {
    return `₴${price.toFixed(0)}`;
  };

  const handleAddToCart = async (product: CatalogItem, qty: number = 1) => {
    try {
      await basketService.addItem({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: qty,
        pictureUrl: getProductImageUrl(product.pictureFileName) || '',
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
        productImage: getProductImageUrl(selectedProduct.pictureFileName),
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

  // Get brand name by id
  const getBrandName = (brandId: number) => {
    return brands.find(b => b.id === brandId)?.name || '';
  };

  // Active filters count
  const activeFiltersCount = selectedBrands.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  // Track image load errors
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  
  const handleImageError = (productId: number) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  };

  // Render product item
  const renderProduct = ({ item }: { item: CatalogItem }) => {
    const placeholderStyle = getPlaceholderStyle(item.categoryIds);
    const imageUrl = getProductImageUrl(item.pictureFileName);
    const showPlaceholder = !imageUrl || imageErrors[item.id];
    
    return (
      <TouchableOpacity
        onPress={() => openProductModal(item)}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4"
        style={{ width: ITEM_WIDTH }}
      >
        <View 
          className="aspect-square items-center justify-center"
          style={{ backgroundColor: placeholderStyle.bg }}
        >
          {showPlaceholder ? (
            <MaterialIcons 
              name={placeholderStyle.icon} 
              size={48} 
              color={placeholderStyle.color} 
            />
          ) : (
            <Image
              source={{ uri: imageUrl }}
              className="w-full h-full"
              contentFit="cover"
              onError={() => handleImageError(item.id)}
            />
          )}
        </View>
        <View className="p-3">
          <Text className="text-gray-500 text-xs mb-1">{getBrandName(item.catalogBrandId)}</Text>
          <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>
            {item.name}
          </Text>
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-orange-600 font-bold text-lg">
              {formatPrice(item.price)}
            </Text>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
              className="bg-orange-500 p-2 rounded-xl"
            >
              <MaterialIcons name="add-shopping-cart" size={18} color="white" />
            </TouchableOpacity>
          </View>
          {item.availableStock <= 5 && item.availableStock > 0 && (
            <Text className="text-amber-600 text-xs mt-1">
              Залишилось: {item.availableStock}
            </Text>
          )}
          {item.availableStock === 0 && (
            <Text className="text-red-500 text-xs mt-1 font-semibold">
              Немає в наявності
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render footer (loading more indicator)
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#f97316" />
      </View>
    );
  };

  // Render empty list
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="items-center py-12">
        <MaterialIcons name="search-off" size={64} color="#d1d5db" />
        <Text className="text-gray-500 font-semibold mt-4">Товари не знайдено</Text>
        <Text className="text-gray-400 text-sm">Спробуйте змінити параметри пошуку</Text>
      </View>
    );
  };

  // Header component
  const renderHeader = () => (
    <>
      {/* Categories */}
      <View className="py-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleCategorySelect(null)}
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
                onPress={() => handleCategorySelect(category.id)}
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

      {/* Filter & Sort Buttons */}
      <View className="flex-row gap-3 px-4 mb-4">
        <TouchableOpacity
          onPress={() => setIsFilterModalVisible(true)}
          className={`flex-row items-center px-4 py-3 rounded-xl flex-1 ${
            activeFiltersCount > 0 ? 'bg-orange-100 border border-orange-300' : 'bg-white border border-gray-200'
          }`}
        >
          <MaterialIcons 
            name="tune" 
            size={20} 
            color={activeFiltersCount > 0 ? '#f97316' : '#6b7280'} 
          />
          <Text className={`ml-2 font-semibold ${activeFiltersCount > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
            Фільтри {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsSortModalVisible(true)}
          className="flex-row items-center px-4 py-3 rounded-xl bg-white border border-gray-200 flex-1"
        >
          <MaterialIcons name="sort" size={20} color="#6b7280" />
          <Text className="ml-2 font-semibold text-gray-600">Сортування</Text>
        </TouchableOpacity>
      </View>

      {/* Results count */}
      <View className="px-4 mb-2">
        <Text className="text-gray-500 text-sm">
          Знайдено товарів: {products.length}{hasMore ? '+' : ''}
        </Text>
      </View>
    </>
  );

  if (isLoading && products.length === 0) {
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
          <View className="flex-row items-center justify-between pt-14 px-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Магазин</Text>
            <TouchableOpacity onPress={handleCartPress} className="p-2 -mr-2 relative">
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
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Products List with Infinite Scroll */}
        <FlatList
          ref={flatListRef}
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold text-gray-800">Фільтри</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Price Filter */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-3">Ціна (₴)</Text>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <TextInput
                      placeholder="Від"
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="numeric"
                      className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
                    />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      placeholder="До"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="numeric"
                      className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
                    />
                  </View>
                </View>
              </View>

              {/* Brand Filter */}
              <View className="mb-6">
                <Text className="text-gray-700 font-semibold mb-3">Бренд</Text>
                <View className="flex-row flex-wrap gap-2">
                  {brands.map((brand) => (
                    <TouchableOpacity
                      key={brand.id}
                      onPress={() => toggleBrand(brand.id)}
                      className={`px-4 py-2 rounded-full ${
                        selectedBrands.includes(brand.id)
                          ? 'bg-orange-500'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          selectedBrands.includes(brand.id) ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {brand.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row gap-4 mt-4">
              <TouchableOpacity
                onPress={resetFilters}
                className="flex-1 bg-gray-200 p-4 rounded-xl items-center"
              >
                <Text className="font-bold text-gray-700">Скинути</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={applyFilters}
                className="flex-1 bg-orange-500 p-4 rounded-xl items-center"
              >
                <Text className="font-bold text-white">Застосувати</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSortModalVisible}
        onRequestClose={() => setIsSortModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold text-gray-800">Сортування</Text>
            </View>

            <View className="gap-2">
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    setSortBy(option.value);
                    setIsSortModalVisible(false);
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-xl ${
                    sortBy === option.value ? 'bg-orange-100' : 'bg-gray-50'
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      sortBy === option.value ? 'text-orange-600' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <MaterialIcons name="check" size={24} color="#f97316" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setIsSortModalVisible(false)}
              className="bg-gray-200 p-4 rounded-xl items-center mt-4"
            >
              <Text className="font-bold text-gray-700">Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                {(() => {
                  const placeholderStyle = getPlaceholderStyle(selectedProduct.categoryIds);
                  const imageUrl = getProductImageUrl(selectedProduct.pictureFileName);
                  const showPlaceholder = !imageUrl || imageErrors[selectedProduct.id];
                  return (
                    <View 
                      className="aspect-square rounded-2xl items-center justify-center mb-4 overflow-hidden"
                      style={{ backgroundColor: placeholderStyle.bg }}
                    >
                      {showPlaceholder ? (
                        <MaterialIcons 
                          name={placeholderStyle.icon} 
                          size={80} 
                          color={placeholderStyle.color} 
                        />
                      ) : (
                        <Image
                          source={{ uri: imageUrl }}
                          className="w-full h-full"
                          contentFit="cover"
                          onError={() => handleImageError(selectedProduct.id)}
                        />
                      )}
                    </View>
                  );
                })()}

                {/* Product Info */}
                <Text className="text-gray-500 text-sm mb-1">
                  {getBrandName(selectedProduct.catalogBrandId)}
                </Text>
                <Text className="text-gray-800 font-bold text-xl">{selectedProduct.name}</Text>
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
              {(['7.00:00:00', '14.00:00:00', '30.00:00:00'] as RecurrenceInterval[]).map((freq) => (
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
