import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';

interface Document {
  id: string;
  name: string;
  type: 'vaccination' | 'passport' | 'insurance' | 'medical' | 'other';
  petName: string;
  date: string;
  fileSize?: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Паспорт Мурзика',
    type: 'passport',
    petName: 'Мурзик',
    date: '2024-01-15',
    fileSize: '2.3 МБ',
  },
  {
    id: '2',
    name: 'Сертифікат вакцинації',
    type: 'vaccination',
    petName: 'Мурзик',
    date: '2024-10-15',
    fileSize: '1.1 МБ',
  },
  {
    id: '3',
    name: 'Страховий поліс',
    type: 'insurance',
    petName: 'Барон',
    date: '2024-06-01',
    fileSize: '540 КБ',
  },
  {
    id: '4',
    name: 'Виписка з клініки',
    type: 'medical',
    petName: 'Мурзик',
    date: '2024-11-20',
    fileSize: '890 КБ',
  },
];

const DOCUMENT_TYPES = {
  vaccination: { icon: 'vaccines', color: '#22c55e', bg: 'bg-green-100', label: 'Вакцинація' },
  passport: { icon: 'badge', color: '#3b82f6', bg: 'bg-blue-100', label: 'Паспорт' },
  insurance: { icon: 'security', color: '#8b5cf6', bg: 'bg-violet-100', label: 'Страховка' },
  medical: { icon: 'medical-services', color: '#ef4444', bg: 'bg-red-100', label: 'Медичний' },
  other: { icon: 'description', color: '#6b7280', bg: 'bg-gray-100', label: 'Інше' },
};

export default function DocumentsScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleAddDocument = () => {
    Alert.alert(
      'Додати документ',
      'Оберіть джерело',
      [
        { text: 'Камера', onPress: () => {} },
        { text: 'Галерея', onPress: () => {} },
        { text: 'Файли', onPress: () => {} },
        { text: 'Скасувати', style: 'cancel' },
      ]
    );
  };

  const handleDeleteDocument = (id: string) => {
    Alert.alert(
      'Видалити документ',
      'Ви впевнені, що хочете видалити цей документ?',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => {
            setDocuments((prev) => prev.filter((d) => d.id !== id));
          },
        },
      ]
    );
  };

  const filteredDocuments = selectedFilter
    ? documents.filter((d) => d.type === selectedFilter)
    : documents;

  // Group by pet
  const documentsByPet = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.petName]) acc[doc.petName] = [];
    acc[doc.petName].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#6b7280', '#4b5563']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="pt-14 pb-8 px-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Документи</Text>
            <TouchableOpacity onPress={handleAddDocument} className="p-2 -mr-2">
              <MaterialIcons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row gap-4 mt-2">
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <Text className="text-white/80 text-sm">Всього документів</Text>
              <Text className="text-white text-3xl font-bold">{documents.length}</Text>
            </View>
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <Text className="text-white/80 text-sm">Улюбленців</Text>
              <Text className="text-white text-3xl font-bold">{Object.keys(documentsByPet).length}</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-6 py-6 gap-6 -mt-4">
          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
            <View className="flex-row gap-2 px-2">
              <TouchableOpacity
                onPress={() => setSelectedFilter(null)}
                className={`px-4 py-2 rounded-full ${
                  !selectedFilter ? 'bg-gray-800' : 'bg-white border border-gray-200'
                }`}
              >
                <Text className={!selectedFilter ? 'text-white font-semibold' : 'text-gray-600'}>
                  Всі
                </Text>
              </TouchableOpacity>
              {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedFilter(key)}
                  className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                    selectedFilter === key ? 'bg-gray-800' : 'bg-white border border-gray-200'
                  }`}
                >
                  <MaterialIcons
                    name={value.icon as any}
                    size={16}
                    color={selectedFilter === key ? 'white' : value.color}
                  />
                  <Text className={selectedFilter === key ? 'text-white font-semibold' : 'text-gray-600'}>
                    {value.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Documents List */}
          {Object.entries(documentsByPet).map(([petName, petDocs]) => (
            <View key={petName} className="gap-3">
              <Text className="text-lg font-bold text-gray-800 ml-1">📋 {petName}</Text>

              {petDocs.map((doc) => {
                const typeInfo = DOCUMENT_TYPES[doc.type];
                return (
                  <TouchableOpacity
                    key={doc.id}
                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex-row items-center gap-4"
                  >
                    <View className={`${typeInfo.bg} w-14 h-14 rounded-xl items-center justify-center`}>
                      <MaterialIcons name={typeInfo.icon as any} size={28} color={typeInfo.color} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-semibold" numberOfLines={1}>
                        {doc.name}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className={`${typeInfo.bg} px-2 py-0.5 rounded`}>
                          <Text style={{ color: typeInfo.color }} className="text-xs font-semibold">
                            {typeInfo.label}
                          </Text>
                        </View>
                        <Text className="text-gray-400 text-xs">{doc.fileSize}</Text>
                      </View>
                      <Text className="text-gray-400 text-xs mt-1">{formatDate(doc.date)}</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity className="p-2">
                        <MaterialIcons name="visibility" size={22} color="#6b7280" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteDocument(doc.id)} className="p-2">
                        <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {filteredDocuments.length === 0 && (
            <View className="items-center py-12">
              <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="folder-open" size={48} color="#9ca3af" />
              </View>
              <Text className="text-gray-800 font-bold text-xl">Немає документів</Text>
              <Text className="text-gray-500 text-center mt-2">
                Додайте документи вашого улюбленця
              </Text>
            </View>
          )}

          {/* Add Document CTA */}
          <TouchableOpacity
            onPress={handleAddDocument}
            className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-6 flex-row items-center justify-center gap-3"
          >
            <View className="bg-gray-200 w-12 h-12 rounded-full items-center justify-center">
              <MaterialIcons name="add" size={28} color="#6b7280" />
            </View>
            <View>
              <Text className="text-gray-700 font-bold">Додати документ</Text>
              <Text className="text-gray-500 text-sm">Фото, PDF або скан</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

