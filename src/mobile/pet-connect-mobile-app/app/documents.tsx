import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { documentsService } from '@/services/api/documents.service';
import { PetDocument, DocumentType, DOCUMENT_TYPE_INFO } from '@/types/document.types';
import { usePetsStore } from '@/store';
import { useThemedStyles } from '@/hooks/useThemedStyles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DocumentsScreen() {
  const router = useRouter();
  const theme = useThemedStyles();
  const { pets, fetchPets } = usePetsStore();
  const [documents, setDocuments] = useState<PetDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<DocumentType | null>(null);
  const [selectedPetFilter, setSelectedPetFilter] = useState<string | null>(null);

  // Add document modal
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>('other');
  const [newDocPetId, setNewDocPetId] = useState<string>('');
  const [newDocDescription, setNewDocDescription] = useState('');
  
  // Document viewer modal
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<PetDocument | null>(null);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      
      // Fetch pets first
      await fetchPets();
      
      // Initialize documents with current pets
      const currentPets = usePetsStore.getState().pets;
      if (currentPets.length > 0) {
        await documentsService.initializeWithPets(
          currentPets.map(p => ({ id: p.id, name: p.name }))
        );
      }
      
      const data = await documentsService.getAll();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleAddDocument = () => {
    if (pets.length === 0) {
      Alert.alert('Увага', 'Спочатку додайте улюбленця');
      return;
    }
    setNewDocPetId(pets[0].id);
    setNewDocName('');
    setNewDocType('other');
    setNewDocDescription('');
    setIsAddModalVisible(true);
  };

  const handlePickDocument = async () => {
    Alert.alert(
      'Додати документ',
      'Оберіть джерело',
      [
        {
          text: 'Камера',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            });
            if (!result.canceled) {
              handleCreateDocument(result.assets[0].uri, result.assets[0].fileSize);
            }
          },
        },
        {
          text: 'Галерея',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.8,
            });
            if (!result.canceled) {
              handleCreateDocument(result.assets[0].uri, result.assets[0].fileSize);
            }
          },
        },
        { text: 'Скасувати', style: 'cancel' },
      ]
    );
  };

  const handleCreateDocument = async (fileUri?: string, fileSize?: number) => {
    if (!newDocName.trim()) {
      Alert.alert('Помилка', 'Введіть назву документа');
      return;
    }
    if (!newDocPetId) {
      Alert.alert('Помилка', 'Оберіть улюбленця');
      return;
    }

    try {
      const petName = pets.find(p => p.id === newDocPetId)?.name || '';
      await documentsService.create({
        petId: newDocPetId,
        name: newDocName.trim(),
        type: newDocType,
        description: newDocDescription.trim() || undefined,
        fileUri,
        fileSize: fileSize ? `${(fileSize / 1024).toFixed(0)} КБ` : undefined,
        date: new Date().toISOString().split('T')[0],
      }, petName);

      setNewDocName('');
      setNewDocType('other');
      setNewDocDescription('');
      setIsAddModalVisible(false);
      await loadDocuments();
      Alert.alert('Успішно', 'Документ додано');
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося додати документ');
    }
  };

  const handleDeleteDocument = (doc: PetDocument) => {
    Alert.alert(
      'Видалити документ',
      `Ви впевнені, що хочете видалити "${doc.name}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await documentsService.delete(doc.id);
              await loadDocuments();
              Alert.alert('Готово', 'Документ видалено');
            } catch (error) {
              Alert.alert('Помилка', 'Не вдалося видалити документ');
            }
          },
        },
      ]
    );
  };

  const handleViewDocument = async (doc: PetDocument) => {
    if (doc.fileUri) {
      // Open document viewer modal for images
      if (doc.fileUri.match(/\.(jpg|jpeg|png|gif|webp)$/i) || doc.fileUri.startsWith('file://')) {
        setViewingDocument(doc);
        setIsViewerVisible(true);
      } else {
        // Try to open with system viewer
        try {
          const canShare = await Sharing.isAvailableAsync();
          if (canShare) {
            await Sharing.shareAsync(doc.fileUri);
          } else {
            Alert.alert('Помилка', 'Не вдається відкрити цей тип файлу');
          }
        } catch (error) {
          Alert.alert('Помилка', 'Не вдалося відкрити документ');
        }
      }
    } else {
      Alert.alert(
        doc.name,
        `Тип: ${DOCUMENT_TYPE_INFO[doc.type].label}\n` +
        `Дата: ${formatDate(doc.date)}\n` +
        (doc.description ? `\nОпис: ${doc.description}` : '') +
        (doc.expiryDate ? `\nДійсний до: ${formatDate(doc.expiryDate)}` : '') +
        '\n\nЦей документ не має прикріпленого файлу.'
      );
    }
  };

  const handleShareDocument = async (doc: PetDocument) => {
    if (!doc.fileUri) {
      Alert.alert('Помилка', 'Немає файлу для поширення');
      return;
    }
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(doc.fileUri, {
          mimeType: 'image/*',
          dialogTitle: `Поділитися: ${doc.name}`,
        });
      } else {
        Alert.alert('Помилка', 'Поширення не доступне на цьому пристрої');
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      Alert.alert('Помилка', 'Не вдалося поділитися документом');
    }
  };

  // Apply filters
  let filteredDocuments = documents;
  if (selectedFilter) {
    filteredDocuments = filteredDocuments.filter((d) => d.type === selectedFilter);
  }
  if (selectedPetFilter) {
    filteredDocuments = filteredDocuments.filter((d) => d.petId === selectedPetFilter);
  }

  // Group by pet
  const documentsByPet = filteredDocuments.reduce((acc, doc) => {
    const key = doc.petName || 'Невідомий';
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {} as Record<string, PetDocument[]>);

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${theme.bgPrimary}`}>
        <ActivityIndicator size="large" color="#6b7280" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6b7280']} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={theme.gradientColors.gray}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="flex-row items-center justify-between pt-14 pb-6 px-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Документи</Text>
            <TouchableOpacity onPress={handleAddDocument} className="p-2 -mr-2">
              <MaterialIcons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row gap-4 mt-2 p-4">
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
          {/* Pet Filter Chips */}
          {pets.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
              <View className="flex-row gap-2 px-2">
                <TouchableOpacity
                  onPress={() => setSelectedPetFilter(null)}
                  className={`px-4 py-2 rounded-full ${
                    !selectedPetFilter ? 'bg-gray-800' : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text className={!selectedPetFilter ? 'text-white font-semibold' : 'text-gray-600'}>
                    Всі улюбленці
                  </Text>
                </TouchableOpacity>
                {pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    onPress={() => setSelectedPetFilter(pet.id)}
                    className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                      selectedPetFilter === pet.id ? 'bg-gray-800' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <Text className={selectedPetFilter === pet.id ? 'text-white font-semibold' : 'text-gray-600'}>
                      {pet.type === 'cat' ? '🐱' : '🐕'} {pet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Type Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
            <View className="flex-row gap-2 px-2">
              <TouchableOpacity
                onPress={() => setSelectedFilter(null)}
                className={`px-4 py-2 rounded-full ${
                  !selectedFilter ? 'bg-gray-800' : 'bg-white border border-gray-200'
                }`}
              >
                <Text className={!selectedFilter ? 'text-white font-semibold' : 'text-gray-600'}>
                  Всі типи
                </Text>
              </TouchableOpacity>
              {Object.entries(DOCUMENT_TYPE_INFO).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setSelectedFilter(key as DocumentType)}
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
                const typeInfo = DOCUMENT_TYPE_INFO[doc.type];
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
                        {doc.fileSize && (
                          <Text className="text-gray-400 text-xs">{doc.fileSize}</Text>
                        )}
                      </View>
                      <Text className="text-gray-400 text-xs mt-1">{formatDate(doc.date)}</Text>
                      {doc.expiryDate && (
                        <Text className="text-amber-600 text-xs">
                          Дійсний до: {formatDate(doc.expiryDate)}
                        </Text>
                      )}
                    </View>
                    <View className="flex-row gap-1">
                      <TouchableOpacity 
                        className="p-2"
                        onPress={() => handleViewDocument(doc)}
                      >
                        <MaterialIcons name="visibility" size={22} color="#6b7280" />
                      </TouchableOpacity>
                      {doc.fileUri && (
                        <TouchableOpacity 
                          className="p-2"
                          onPress={() => handleShareDocument(doc)}
                        >
                          <MaterialIcons name="share" size={22} color="#3b82f6" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => handleDeleteDocument(doc)} className="p-2">
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
                {pets.length === 0 
                  ? 'Спочатку додайте улюбленця'
                  : 'Додайте документи вашого улюбленця'
                }
              </Text>
              {pets.length === 0 && (
                <TouchableOpacity
                  onPress={() => router.push('/pets/create')}
                  className="bg-gray-800 px-6 py-3 rounded-xl mt-4"
                >
                  <Text className="text-white font-bold">Додати улюбленця</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Add Document CTA */}
          {pets.length > 0 && (
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
          )}
        </View>
      </ScrollView>

      {/* Add Document Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 gap-4">
            <View className="items-center mb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full mb-4" />
              <Text className="text-xl font-bold text-gray-800">Новий документ</Text>
            </View>

            {/* Pet selector */}
            <View className="gap-2">
              <Text className="text-gray-600 font-semibold">Улюбленець</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {pets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      onPress={() => setNewDocPetId(pet.id)}
                      className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                        newDocPetId === pet.id ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <Text className={newDocPetId === pet.id ? 'text-white font-semibold' : 'text-gray-600'}>
                        {pet.type === 'cat' ? '🐱' : '🐕'} {pet.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Document name */}
            <View className="gap-2">
              <Text className="text-gray-600 font-semibold">Назва</Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 text-gray-800"
                placeholder="Наприклад: Паспорт вакцинації"
                value={newDocName}
                onChangeText={setNewDocName}
              />
            </View>

            {/* Document type */}
            <View className="gap-2">
              <Text className="text-gray-600 font-semibold">Тип документа</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {Object.entries(DOCUMENT_TYPE_INFO).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setNewDocType(key as DocumentType)}
                      className={`px-4 py-2 rounded-full flex-row items-center gap-2 ${
                        newDocType === key ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                    >
                      <MaterialIcons
                        name={value.icon as any}
                        size={16}
                        color={newDocType === key ? 'white' : value.color}
                      />
                      <Text className={newDocType === key ? 'text-white font-semibold' : 'text-gray-600'}>
                        {value.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Description */}
            <View className="gap-2">
              <Text className="text-gray-600 font-semibold">Опис (необов'язково)</Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 text-gray-800"
                placeholder="Короткий опис документа"
                value={newDocDescription}
                onChangeText={setNewDocDescription}
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-4 mt-2">
              <TouchableOpacity
                className="flex-1 bg-gray-200 p-4 rounded-xl items-center"
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text className="font-bold text-gray-700">Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-800 p-4 rounded-xl items-center flex-row justify-center gap-2"
                onPress={handlePickDocument}
              >
                <MaterialIcons name="attach-file" size={20} color="white" />
                <Text className="font-bold text-white">Додати файл</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="bg-green-500 p-4 rounded-xl items-center"
              onPress={() => handleCreateDocument()}
            >
              <Text className="font-bold text-white">Зберегти без файлу</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isViewerVisible}
        onRequestClose={() => setIsViewerVisible(false)}
      >
        <View className="flex-1 bg-black">
          {/* Header */}
          <View className="absolute top-0 left-0 right-0 z-10 pt-14 px-6 pb-4 flex-row items-center justify-between bg-black/50">
            <TouchableOpacity 
              onPress={() => setIsViewerVisible(false)} 
              className="p-2 bg-white/20 rounded-full"
            >
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1 mx-4">
              <Text className="text-white font-bold text-lg" numberOfLines={1}>
                {viewingDocument?.name}
              </Text>
              {viewingDocument && (
                <Text className="text-white/70 text-sm">
                  {DOCUMENT_TYPE_INFO[viewingDocument.type].label} • {formatDate(viewingDocument.date)}
                </Text>
              )}
            </View>
            {viewingDocument?.fileUri && (
              <TouchableOpacity 
                onPress={() => viewingDocument && handleShareDocument(viewingDocument)} 
                className="p-2 bg-white/20 rounded-full"
              >
                <MaterialIcons name="share" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Image */}
          <View className="flex-1 items-center justify-center">
            {viewingDocument?.fileUri ? (
              <Image
                source={{ uri: viewingDocument.fileUri }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.7 }}
                contentFit="contain"
              />
            ) : (
              <View className="items-center">
                <MaterialIcons name="insert-drive-file" size={80} color="#6b7280" />
                <Text className="text-white mt-4">Файл не прикріплено</Text>
              </View>
            )}
          </View>

          {/* Footer with description */}
          {viewingDocument?.description && (
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/50">
              <Text className="text-white/80 text-sm">{viewingDocument.description}</Text>
              {viewingDocument.expiryDate && (
                <Text className="text-amber-400 text-sm mt-2">
                  Дійсний до: {formatDate(viewingDocument.expiryDate)}
                </Text>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}
