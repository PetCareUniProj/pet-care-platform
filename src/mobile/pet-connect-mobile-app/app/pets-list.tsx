import React, { useEffect, useState, useCallback } from 'react';
import { Image } from 'expo-image';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { usePetsStore } from '@/store';
import { Pet } from '@/types/pet.types';
import * as ImagePicker from 'expo-image-picker';
import { platformAlert } from '@/utils/alert';

const PET_TYPE_EMOJI: Record<string, string> = {
  cat: '🐱',
  dog: '🐕',
  bird: '🐦',
  rabbit: '🐰',
  hamster: '🐹',
  fish: '🐠',
  other: '🐾',
};

const quickActions = [
  { id: 'weight', icon: 'monitor-weight', label: 'Зважити', color: '#22c55e', bg: 'bg-green-100' },
  { id: 'event', icon: 'event-note', label: 'Подія', color: '#3b82f6', bg: 'bg-blue-100' },
  { id: 'note', icon: 'edit-note', label: 'Нотатка', color: '#f59e0b', bg: 'bg-amber-100' },
  { id: 'photo', icon: 'camera-alt', label: 'Фото', color: '#8b5cf6', bg: 'bg-violet-100' },
];

export default function PetsListScreen() {
  const router = useRouter();
  const { pets, fetchPets, isLoading, addPetWeight, addPetNote, uploadPetPhoto } = usePetsStore();
  const [refreshing, setRefreshing] = useState(false);

  // Weight modal
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [selectedPetForWeight, setSelectedPetForWeight] = useState<Pet | null>(null);
  const [newWeight, setNewWeight] = useState('');

  // Note modal
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [selectedPetForNote, setSelectedPetForNote] = useState<Pet | null>(null);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchPets();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  }, []);

  const handlePetPress = (pet: Pet) => {
    router.push({ pathname: '/pets/[id]', params: { id: pet.id } });
  };

  const handleAddPet = () => {
    router.push('/pets/create');
  };

  const handleQuickAction = async (actionId: string, pet: Pet) => {
    switch (actionId) {
      case 'weight':
        setSelectedPetForWeight(pet);
        setNewWeight(pet.weight?.toString() || '');
        setIsWeightModalVisible(true);
        break;
      case 'event':
        router.push({
          pathname: '/(tabs)/calendar',
          params: { selectedPetId: pet.id }
        });
        break;
      case 'note':
        setSelectedPetForNote(pet);
        setIsNoteModalVisible(true);
        break;
      case 'photo':
        handlePickPhoto(pet);
        break;
    }
  };

  const handlePickPhoto = async (pet: Pet) => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      platformAlert.alert('Потрібні дозволи', 'Для фото потрібні дозволи на доступ до камери та галереї.');
      return;
    }

    platformAlert.alert('Виберіть джерело', 'Звідки ви хочете вибрати фото?', [
      {
        text: 'Камера',
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) {
            await uploadPetPhoto(pet.id, result.assets[0].uri);
            platformAlert.alert('Успішно', 'Фото оновлено');
          }
        },
      },
      {
        text: 'Галерея',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) {
            await uploadPetPhoto(pet.id, result.assets[0].uri);
            platformAlert.alert('Успішно', 'Фото оновлено');
          }
        },
      },
      { text: 'Скасувати', style: 'cancel' },
    ]);
  };

  const handleAddWeight = async () => {
    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 0) {
      platformAlert.alert('Помилка', 'Введіть коректну вагу');
      return;
    }
    if (selectedPetForWeight) {
      await addPetWeight(selectedPetForWeight.id, weightValue);
      setNewWeight('');
      setIsWeightModalVisible(false);
      platformAlert.alert('Успішно', `Вагу ${selectedPetForWeight.name} оновлено: ${weightValue} кг`);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      platformAlert.alert('Помилка', 'Введіть текст нотатки');
      return;
    }
    if (selectedPetForNote) {
      await addPetNote(selectedPetForNote.id, newNote.trim());
      setNewNote('');
      setIsNoteModalVisible(false);
      platformAlert.alert('Успішно', 'Нотатку додано');
    }
  };

  if (isLoading && pets.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#ef4444', '#dc2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View className="flex-row items-center justify-between mb-4 pt-14 px-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold">Мої улюбленці</Text>
            <TouchableOpacity onPress={handleAddPet} className="p-2 -mr-2">
              <MaterialIcons name="add" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View className="flex-row gap-4 mt-2 pb-6 px-6">
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <Text className="text-white/80 text-sm">Всього</Text>
              <Text className="text-white text-3xl font-bold">{pets.length}</Text>
            </View>
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <Text className="text-white/80 text-sm">Середній профіль</Text>
              <Text className="text-white text-3xl font-bold">
                {pets.length > 0
                  ? Math.round(pets.reduce((sum, p) => sum + (p.profileCompleteness || 0), 0) / pets.length)
                  : 0}%
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-6 py-6 gap-4 -mt-4">
          {pets.length === 0 ? (
            <TouchableOpacity
              onPress={handleAddPet}
              className="bg-white border-2 border-dashed border-red-200 rounded-2xl p-12 items-center"
            >
              <View className="bg-red-100 w-24 h-24 rounded-full items-center justify-center mb-4">
                <MaterialIcons name="pets" size={48} color="#ef4444" />
              </View>
              <Text className="text-gray-800 font-bold text-xl">Немає улюбленців</Text>
              <Text className="text-gray-500 text-center mt-2">
                Натисніть, щоб додати першого улюбленця
              </Text>
            </TouchableOpacity>
          ) : (
            pets.map((pet) => (
              <View key={pet.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Pet Header */}
                <TouchableOpacity
                  onPress={() => handlePetPress(pet)}
                  className="p-4 flex-row items-center gap-4"
                >
                  <View className="relative">
                    <Image
                      source={
                        pet.photoUrl
                          ? { uri: pet.photoUrl }
                          : require('@/assets/images/pet-cat-mock-profile-image.png')
                      }
                      className="w-20 h-20 rounded-2xl bg-gray-100"
                      style={{ width: 80, height: 80 }}
                    />
                    <View
                      className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full items-center justify-center border-2 border-white ${
                        (pet.profileCompleteness || 0) >= 80 ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    >
                      <MaterialIcons
                        name={(pet.profileCompleteness || 0) >= 80 ? 'check' : 'priority-high'}
                        size={16}
                        color="white"
                      />
                    </View>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xl">{PET_TYPE_EMOJI[pet.type] || '🐾'}</Text>
                      <Text className="text-gray-800 font-bold text-lg">{pet.name}</Text>
                    </View>
                    <Text className="text-gray-500 text-sm">
                      {pet.breed || 'Порода не вказана'}
                    </Text>
                    <View className="flex-row items-center gap-4 mt-1">
                      {pet.age && (
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="cake" size={12} color="#9ca3af" />
                          <Text className="text-gray-400 text-xs">{pet.age}</Text>
                        </View>
                      )}
                      {pet.weight && (
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="fitness-center" size={12} color="#9ca3af" />
                          <Text className="text-gray-400 text-xs">{pet.weight} {pet.weightUnit || 'кг'}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <MaterialIcons name="chevron-right" size={24} color="#d1d5db" />
                </TouchableOpacity>

                {/* Quick Actions */}
                <View className="border-t border-gray-100 p-3 bg-gray-50">
                  <View className="flex-row justify-around">
                    {quickActions.map((action) => (
                      <TouchableOpacity
                        key={action.id}
                        onPress={() => handleQuickAction(action.id, pet)}
                        className="items-center py-1"
                      >
                        <View className={`w-11 h-11 rounded-xl items-center justify-center ${action.bg} mb-1`}>
                          <MaterialIcons name={action.icon as any} size={22} color={action.color} />
                        </View>
                        <Text className="text-gray-500 text-[10px] font-medium">{action.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Add Pet CTA */}
          {pets.length > 0 && (
            <TouchableOpacity
              onPress={handleAddPet}
              className="bg-red-50 border-2 border-dashed border-red-200 rounded-2xl p-6 flex-row items-center justify-center gap-4"
            >
              <View className="bg-red-100 w-14 h-14 rounded-full items-center justify-center">
                <MaterialIcons name="add" size={28} color="#ef4444" />
              </View>
              <View>
                <Text className="text-red-700 font-bold text-lg">Додати улюбленця</Text>
                <Text className="text-red-500 text-sm">Створити новий профіль</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Weight Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWeightModalVisible}
        onRequestClose={() => setIsWeightModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-[90%] gap-4">
            <View className="items-center mb-2">
              <View className="bg-green-100 w-16 h-16 rounded-full items-center justify-center mb-2">
                <MaterialIcons name="monitor-weight" size={32} color="#22c55e" />
              </View>
              <Text className="text-xl font-bold text-gray-800">Зважування</Text>
              <Text className="text-gray-500">{selectedPetForWeight?.name}</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 border border-gray-200 rounded-xl p-4 text-gray-800 text-2xl text-center font-bold"
                keyboardType="numeric"
                placeholder="0.0"
                value={newWeight}
                onChangeText={setNewWeight}
              />
              <Text className="text-xl font-bold text-gray-500">{selectedPetForWeight?.weightUnit || 'кг'}</Text>
            </View>

            {selectedPetForWeight?.weight && (
              <Text className="text-gray-400 text-center text-sm">
                Попередня вага: {selectedPetForWeight.weight} {selectedPetForWeight.weightUnit || 'кг'}
              </Text>
            )}

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 bg-gray-200 p-3 rounded-xl items-center"
                onPress={() => {
                  setNewWeight('');
                  setIsWeightModalVisible(false);
                }}
              >
                <Text className="font-bold text-gray-700">Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-green-500 p-3 rounded-xl items-center"
                onPress={handleAddWeight}
              >
                <Text className="font-bold text-white">Зберегти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Note Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNoteModalVisible}
        onRequestClose={() => setIsNoteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-[90%] gap-4">
            <View className="items-center mb-2">
              <View className="bg-amber-100 w-16 h-16 rounded-full items-center justify-center mb-2">
                <MaterialIcons name="edit-note" size={32} color="#f59e0b" />
              </View>
              <Text className="text-xl font-bold text-gray-800">Нова нотатка</Text>
              <Text className="text-gray-500">{selectedPetForNote?.name}</Text>
            </View>

            <TextInput
              className="border border-gray-200 rounded-xl p-4 h-32 text-gray-800"
              multiline
              placeholder="Напишіть щось про вашого улюбленця..."
              textAlignVertical="top"
              value={newNote}
              onChangeText={setNewNote}
            />

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 bg-gray-200 p-3 rounded-xl items-center"
                onPress={() => {
                  setNewNote('');
                  setIsNoteModalVisible(false);
                }}
              >
                <Text className="font-bold text-gray-700">Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-amber-500 p-3 rounded-xl items-center"
                onPress={handleAddNote}
              >
                <Text className="font-bold text-white">Зберегти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
