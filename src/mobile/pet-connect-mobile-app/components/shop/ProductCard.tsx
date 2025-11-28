import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { CatalogItem } from '@/types/product.types';
import { getProductImageUrl } from '@/constants/api';

// Category styling for placeholder images
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

const DEFAULT_PLACEHOLDER = { bg: '#fef3c7', color: '#d97706', icon: 'pets' as keyof typeof MaterialIcons.glyphMap };

export function getPlaceholderStyle(categoryIds: number[]) {
  if (!categoryIds || categoryIds.length === 0) return DEFAULT_PLACEHOLDER;
  const firstCategoryId = categoryIds[0];
  return CATEGORY_STYLES[firstCategoryId] || DEFAULT_PLACEHOLDER;
}

interface ProductImageProps {
  pictureFileName?: string | null;
  categoryIds: number[];
  size?: 'small' | 'medium' | 'large';
}

export function ProductImage({ pictureFileName, categoryIds, size = 'medium' }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const placeholderStyle = getPlaceholderStyle(categoryIds);
  const imageUrl = getProductImageUrl(pictureFileName);
  
  const iconSize = size === 'small' ? 32 : size === 'large' ? 80 : 48;
  
  const showImage = imageUrl && !hasError;

  return (
    <View 
      className="w-full h-full items-center justify-center"
      style={{ backgroundColor: placeholderStyle.bg }}
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          contentFit="cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <MaterialIcons 
          name={placeholderStyle.icon} 
          size={iconSize} 
          color={placeholderStyle.color} 
        />
      )}
    </View>
  );
}

interface ProductCardProps {
  product: CatalogItem;
  width: number;
  brandName?: string;
  onPress: () => void;
  onAddToCart: () => void;
}

export function ProductCard({ product, width, brandName, onPress, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => `₴${price.toFixed(0)}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4"
      style={{ width }}
    >
      <View className="aspect-square">
        <ProductImage 
          pictureFileName={product.pictureFileName} 
          categoryIds={product.categoryIds}
        />
      </View>
      <View className="p-3">
        {brandName && (
          <Text className="text-gray-500 text-xs mb-1">{brandName}</Text>
        )}
        <Text className="text-gray-800 font-semibold text-sm" numberOfLines={2}>
          {product.name}
        </Text>
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-orange-600 font-bold text-lg">
            {formatPrice(product.price)}
          </Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
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
  );
}

