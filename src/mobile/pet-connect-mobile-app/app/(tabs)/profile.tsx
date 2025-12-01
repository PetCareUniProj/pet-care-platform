import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Modal, TextInput, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { usePetsStore } from '@/store';
import { Pet } from '@/types/pet.types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
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

// Quick actions for each pet
const petQuickActions = [
  { id: 'weight', icon: 'monitor-weight', label: 'Зважити', color: '#22c55e', bg: 'bg-green-100' },
  { id: 'event', icon: 'event', label: 'Подія', color: '#3b82f6', bg: 'bg-blue-100' },
  { id: 'note', icon: 'note-add', label: 'Нотатка', color: '#f59e0b', bg: 'bg-amber-100' },
  { id: 'photo', icon: 'add-a-photo', label: 'Фото', color: '#8b5cf6', bg: 'bg-violet-100' },
];

export default function PetProfileScreen() {
  const router = useRouter();
  const { pets, fetchPets, isLoading, addPetWeight, addPetNote, uploadPetPhoto } = usePetsStore();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useThemedStyles();

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPets();
    setRefreshing(false);
  };

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
    const ImagePicker = await import('expo-image-picker');
    
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      platformAlert.alert('Потрібні дозволи', 'Для зміни фото потрібні дозволи на доступ до камери та галереї.');
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
            platformAlert.alert('Успішно', 'Фото додано до галереї');
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
            platformAlert.alert('Успішно', 'Фото додано до галереї');
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
      platformAlert.alert('Успішно', `Вагу ${selectedPetForWeight.name} оновлено`);
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
      <View className={`flex-1 justify-center items-center ${theme.bgPrimary}`}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView 
      className={`flex-1 ${theme.bgPrimary}`}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f97316']} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={theme.gradientColors.orange}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View className="flex-row items-center justify-between rounded-b-[40px] px-6 pt-16">
          <Text className="text-white text-2xl font-bold">Мої улюбленці</Text>
          <TouchableOpacity 
            onPress={handleAddPet}
            className="bg-white/20 px-4 py-2 rounded-full flex-row items-center gap-2 border border-white/30"
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-semibold">Додати</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        {pets.length > 0 && (
          <View className="flex-row gap-4 p-4">
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <Text className="text-white/80 text-sm">Всього</Text>
              <Text className="text-white text-3xl font-bold">{pets.length}</Text>
            </View>
            <View className="flex-1 bg-white/20 rounded-2xl p-4 border border-white/30">
              <Text className="text-white/80 text-sm">Середній профіль</Text>
              <Text className="text-white text-3xl font-bold">
                {Math.round(pets.reduce((sum, p) => sum + (p.profileCompleteness || 0), 0) / pets.length)}%
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>

      <View className="px-6 py-6 gap-6 -mt-4">
        {pets.length === 0 ? (
          <TouchableOpacity
            onPress={handleAddPet}
            className={`${theme.bgCard} border-2 border-dashed border-orange-200 rounded-2xl p-12 items-center`}
          >
            <View className="bg-orange-100 w-24 h-24 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="pets" size={48} color="#f97316" />
            </View>
            <Text className={`${theme.textPrimary} font-bold text-xl`}>Додайте улюбленця</Text>
            <Text className={`${theme.textSecondary} text-center mt-2`}>
              Створіть профіль для вашого першого улюбленця та почніть відстежувати його здоров'я
            </Text>
            <View className="bg-orange-500 px-6 py-3 rounded-xl mt-6">
              <Text className="text-white font-bold">Додати зараз</Text>
            </View>
          </TouchableOpacity>
        ) : (
          pets.map((pet) => (
            <View key={pet.id} className={`${theme.bgCard} rounded-2xl border ${theme.borderColor} shadow-sm overflow-hidden`}>
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
                    className={`w-20 h-20 rounded-2xl ${theme.isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    style={{ width: 80, height: 80 }}
                  />
                  <View
                    className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full items-center justify-center border-2 ${theme.isDark ? 'border-gray-800' : 'border-white'} ${
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
                    <Text className={`${theme.textPrimary} font-bold text-lg`}>{pet.name}</Text>
                  </View>
                  <Text className={`${theme.textSecondary} text-sm`}>
                    {pet.breed || 'Порода не вказана'}
                  </Text>
                  <View className="flex-row items-center gap-4 mt-2">
                    {pet.age && (
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="cake" size={14} color={theme.iconColorMuted} />
                        <Text className={`${theme.textMuted} text-xs`}>{pet.age}</Text>
                      </View>
                    )}
                    {pet.weight && (
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons name="fitness-center" size={14} color={theme.iconColorMuted} />
                        <Text className={`${theme.textMuted} text-xs`}>{pet.weight} {pet.weightUnit || 'кг'}</Text>
                      </View>
                    )}
                    {pet.gender && (
                      <View className="flex-row items-center gap-1">
                        <MaterialIcons 
                          name={pet.gender === 'male' ? 'male' : 'female'} 
                          size={14} 
                          color={theme.iconColorMuted}
                        />
                        <Text className={`${theme.textMuted} text-xs`}>
                          {pet.gender === 'male' ? 'Хлопчик' : 'Дівчинка'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <MaterialIcons name="chevron-right" size={24} color={theme.chevronColor} />
              </TouchableOpacity>

              {/* Profile Progress */}
              {(pet.profileCompleteness || 0) < 100 && (
                <View className="px-4 pb-3">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className={`${theme.textSecondary} text-xs`}>Заповненість профілю</Text>
                    <Text className={`${theme.isDark ? 'text-gray-400' : 'text-gray-600'} text-xs font-semibold`}>{pet.profileCompleteness || 0}%</Text>
                  </View>
                  <View className={`${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'} h-2 rounded-full overflow-hidden`}>
                    <View
                      className={`h-full rounded-full ${
                        (pet.profileCompleteness || 0) >= 80 ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${pet.profileCompleteness || 0}%` }}
                    />
                  </View>
                </View>
              )}

              {/* Quick Actions */}
              <View className={`border-t ${theme.borderColor} px-2 py-3`}>
                <View className="flex-row justify-around">
                  {petQuickActions.map((action) => (
                    <TouchableOpacity
                      key={action.id}
                      onPress={() => handleQuickAction(action.id, pet)}
                      className="items-center py-2 px-3"
                    >
                      <View className={`w-12 h-12 rounded-xl items-center justify-center ${action.bg} mb-1`}>
                        <MaterialIcons name={action.icon as any} size={24} color={action.color} />
                      </View>
                      <Text className={`${theme.isDark ? 'text-gray-400' : 'text-gray-600'} text-xs font-medium`}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Last Activity */}
              {pet.weightHistory && pet.weightHistory.length > 0 && (
                <View className={`border-t ${theme.borderColor} px-4 py-3 ${theme.isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="history" size={16} color="#9ca3af" />
                    <Text className="text-gray-500 text-xs">
                      Останнє зважування: {pet.weight} {pet.weightUnit || 'кг'} • {
                        new Date(pet.weightHistory[pet.weightHistory.length - 1].date).toLocaleDateString('uk', {
                          day: 'numeric',
                          month: 'short'
                        })
                      }
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))
        )}

        {/* Add Pet Card */}
        {pets.length > 0 && (
          <TouchableOpacity
            onPress={handleAddPet}
            className={`${theme.isDark ? 'bg-orange-900/30' : 'bg-orange-50'} border-2 border-dashed border-orange-200 rounded-2xl p-6 flex-row items-center justify-center gap-4`}
          >
            <View className="bg-orange-100 w-14 h-14 rounded-full items-center justify-center">
              <MaterialIcons name="add" size={28} color="#f97316" />
            </View>
            <View>
              <Text className={`${theme.isDark ? 'text-orange-400' : 'text-orange-700'} font-bold text-lg`}>Додати улюбленця</Text>
              <Text className="text-orange-500 text-sm">Створити новий профіль</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Weight Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isWeightModalVisible}
        onRequestClose={() => setIsWeightModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`${theme.bgCard} p-6 rounded-2xl w-[90%] gap-4`}>
            <View className="items-center mb-2">
              <View className="bg-green-100 w-16 h-16 rounded-full items-center justify-center mb-2">
                <MaterialIcons name="monitor-weight" size={32} color="#22c55e" />
              </View>
              <Text className={`text-xl font-bold ${theme.textPrimary}`}>Зважування</Text>
              <Text className={theme.textSecondary}>{selectedPetForWeight?.name}</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TextInput
                className={`flex-1 border ${theme.borderColorMedium} rounded-xl p-4 ${theme.textPrimary} text-2xl text-center font-bold ${theme.bgInput}`}
                keyboardType="numeric"
                placeholder="0.0"
                placeholderTextColor={theme.isDark ? '#6b7280' : '#9ca3af'}
                value={newWeight}
                onChangeText={setNewWeight}
              />
              <Text className={`text-xl font-bold ${theme.textSecondary}`}>{selectedPetForWeight?.weightUnit || 'кг'}</Text>
            </View>

            {selectedPetForWeight?.weight && (
              <Text className={`${theme.textMuted} text-center text-sm`}>
                Попередня вага: {selectedPetForWeight.weight} {selectedPetForWeight.weightUnit || 'кг'}
              </Text>
            )}

            <View className="flex-row gap-4">
              <TouchableOpacity
                className={`flex-1 ${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'} p-3 rounded-xl items-center`}
                onPress={() => {
                  setNewWeight('');
                  setIsWeightModalVisible(false);
                }}
              >
                <Text className={`font-bold ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>Скасувати</Text>
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
          <View className={`${theme.bgCard} p-6 rounded-2xl w-[90%] gap-4`}>
            <View className="items-center mb-2">
              <View className="bg-amber-100 w-16 h-16 rounded-full items-center justify-center mb-2">
                <MaterialIcons name="note-add" size={32} color="#f59e0b" />
              </View>
              <Text className={`text-xl font-bold ${theme.textPrimary}`}>Нова нотатка</Text>
              <Text className={theme.textSecondary}>{selectedPetForNote?.name}</Text>
            </View>

            <TextInput
              className={`border ${theme.borderColorMedium} rounded-xl p-4 h-32 ${theme.textPrimary} ${theme.bgInput}`}
              multiline
              placeholder="Напишіть щось про вашого улюбленця..."
              placeholderTextColor={theme.isDark ? '#6b7280' : '#9ca3af'}
              textAlignVertical="top"
              value={newNote}
              onChangeText={setNewNote}
            />

            <View className="flex-row gap-4">
              <TouchableOpacity
                className={`flex-1 ${theme.isDark ? 'bg-gray-700' : 'bg-gray-200'} p-3 rounded-xl items-center`}
                onPress={() => {
                  setNewNote('');
                  setIsNoteModalVisible(false);
                }}
              >
                <Text className={`font-bold ${theme.isDark ? 'text-gray-300' : 'text-gray-700'}`}>Скасувати</Text>
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
    </ScrollView>
  );
}
