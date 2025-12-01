import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePetsStore } from '@/store';
import { Pet, PetType, PetGender, PetPhoto } from '@/types/pet.types';
import { UpcomingEventsSection } from '@/components/pets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PET_TYPES: { type: PetType; label: string }[] = [
  { type: 'cat', label: 'Кіт' },
  { type: 'dog', label: 'Собака' },
  { type: 'bird', label: 'Птах' },
  { type: 'rabbit', label: 'Кролик' },
  { type: 'hamster', label: "Хом'як" },
  { type: 'fish', label: 'Рибка' },
  { type: 'other', label: 'Інше' },
];

export default function PetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    selectedPet,
    fetchPetById,
    isLoading,
    uploadPetPhoto,
    addPetNote,
    updatePet,
    deletePet,
    addPetWeight,
    addPhotoToGallery,
    updateGalleryPhoto,
  } = usePetsStore();

  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Weight modal
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Photo viewer modal
  const [selectedPhoto, setSelectedPhoto] = useState<PetPhoto | null>(null);
  const [isPhotoViewerVisible, setIsPhotoViewerVisible] = useState(false);
  const [editingPhotoCaption, setEditingPhotoCaption] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<PetType>('cat');
  const [editBreed, setEditBreed] = useState('');
  const [editGender, setEditGender] = useState<PetGender>('male');
  const [editColor, setEditColor] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editMicrochip, setEditMicrochip] = useState('');
  const [editIsNeutered, setEditIsNeutered] = useState(false);
  const [editAllergies, setEditAllergies] = useState('');
  const [editSpecialNeeds, setEditSpecialNeeds] = useState('');
  const [editVetName, setEditVetName] = useState('');
  const [editVetPhone, setEditVetPhone] = useState('');
  const [editVetAddress, setEditVetAddress] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPetById(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedPet) {
      setEditName(selectedPet.name);
      setEditType(selectedPet.type);
      setEditBreed(selectedPet.breed || '');
      setEditGender(selectedPet.gender);
      setEditColor(selectedPet.color || '');
      setEditWeight(selectedPet.weight?.toString() || '');
      setEditBirthDate(selectedPet.birthDate || '');
      setEditMicrochip(selectedPet.microchip || '');
      setEditIsNeutered(selectedPet.isNeutered || false);
      setEditAllergies(selectedPet.allergies?.join(', ') || '');
      setEditSpecialNeeds(selectedPet.specialNeeds || '');
      setEditVetName(selectedPet.vetName || '');
      setEditVetPhone(selectedPet.vetPhone || '');
      setEditVetAddress(selectedPet.vetAddress || '');
    }
  }, [selectedPet]);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert(
        'Потрібні дозволи',
        'Для зміни фото потрібні дозволи на доступ до камери та галереї.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handlePickImage = async (forGallery = false) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert('Виберіть джерело', 'Звідки ви хочете вибрати фото?', [
      {
        text: 'Камера',
        onPress: async () => {
          try {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });

            if (!result.canceled && id) {
              if (forGallery) {
                await addPhotoToGallery(id, result.assets[0].uri);
              } else {
                await uploadPetPhoto(id, result.assets[0].uri);
              }
            }
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося відкрити камеру');
          }
        },
      },
      {
        text: 'Галерея',
        onPress: async () => {
          try {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });

            if (!result.canceled && id) {
              if (forGallery) {
                await addPhotoToGallery(id, result.assets[0].uri);
              } else {
                await uploadPetPhoto(id, result.assets[0].uri);
              }
            }
          } catch (error) {
            Alert.alert('Помилка', 'Не вдалося відкрити галерею');
          }
        },
      },
      {
        text: 'Скасувати',
        style: 'cancel',
      },
    ]);
  };

  const handleAddNote = async () => {
    if (newNote.trim() && id) {
      await addPetNote(id, newNote);
      setNewNote('');
      setIsNoteModalVisible(false);
    }
  };

  const handleAddWeight = async () => {
    const weightValue = parseFloat(newWeight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert('Помилка', 'Введіть коректну вагу');
      return;
    }
    if (id) {
      await addPetWeight(id, weightValue);
      setNewWeight('');
      setIsWeightModalVisible(false);
    }
  };

  const handleSaveEdit = async () => {
    if (id && selectedPet) {
      const allergiesArray = editAllergies
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a);

      const newWeight = parseFloat(editWeight);
      const weightChanged = newWeight !== selectedPet.weight && !isNaN(newWeight);

      // If weight changed via edit, add to history
      if (weightChanged) {
        await addPetWeight(id, newWeight);
      }

      await updatePet(id, {
        name: editName,
        type: editType,
        breed: editBreed || undefined,
        gender: editGender,
        color: editColor || undefined,
        weight: newWeight || undefined,
        birthDate: editBirthDate || undefined,
        microchip: editMicrochip || undefined,
        isNeutered: editIsNeutered,
        allergies: allergiesArray.length > 0 ? allergiesArray : undefined,
        specialNeeds: editSpecialNeeds || undefined,
        vetName: editVetName || undefined,
        vetPhone: editVetPhone || undefined,
        vetAddress: editVetAddress || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleDeletePet = () => {
    Alert.alert(
      'Видалити профіль',
      `Ви впевнені, що хочете видалити профіль "${selectedPet?.name}"? Цю дію неможливо скасувати.`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              const success = await deletePet(id);
              if (success) {
                router.back();
              }
            }
          },
        },
      ]
    );
  };

  const handleSavePhotoCaption = async () => {
    if (selectedPhoto && id) {
      await updateGalleryPhoto(id, selectedPhoto.id, { caption: editingPhotoCaption });
      setSelectedPhoto({ ...selectedPhoto, caption: editingPhotoCaption });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  if (isLoading || !selectedPet) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const pet = selectedPet;
  const showProfileCompleteness = (pet.profileCompleteness || 0) < 100;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        {/* Header with Pet Image */}
        <LinearGradient
          colors={['#fb923c', '#f59e0b']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
        >
          {/* Background Paw Icons */}
          <MaterialIcons
            name="pets"
            size={120}
            color="rgba(255,255,255,0.1)"
            style={{ position: 'absolute', top: 40, left: -20, transform: [{ rotate: '-20deg' }] }}
          />
          <MaterialIcons
            name="pets"
            size={80}
            color="rgba(255,255,255,0.1)"
            style={{ position: 'absolute', bottom: 20, right: -10, transform: [{ rotate: '15deg' }] }}
          />

          <View className="flex-row justify-between items-center p-6 pt-16 rounded-b-[40px] relative z-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/20 p-2 rounded-full border border-white/30 active:bg-white/30"
            >
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-row gap-2">
              {/* Weight button */}
              <TouchableOpacity
                onPress={() => setIsWeightModalVisible(true)}
                className="bg-white/20 p-2 rounded-full border border-white/30 active:bg-white/30"
              >
                <MaterialIcons name="monitor-weight" size={20} color="white" />
              </TouchableOpacity>

              {/* Edit/Cancel button */}
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                className="bg-white/20 p-2 rounded-full flex-row items-center border border-white/30 active:bg-white/30"
              >
                <MaterialIcons name={isEditing ? 'close' : 'edit'} size={20} color="white" />
                <Text className="text-white ml-2 font-semibold">
                  {isEditing ? 'Скасувати' : 'Редагувати'}
                </Text>
              </TouchableOpacity>

              {/* Delete button (only in edit mode) */}
              {isEditing && (
                <TouchableOpacity
                  onPress={handleDeletePet}
                  className="bg-red-500/80 p-2 rounded-full border border-white/30 active:bg-red-600"
                >
                  <MaterialIcons name="delete" size={20} color="white" />
                </TouchableOpacity>
              )}

              {/* Camera button */}
              <TouchableOpacity
                onPress={() => handlePickImage(false)}
                className="bg-white/20 p-2 rounded-full border border-white/30 active:bg-white/30"
              >
                <MaterialIcons name="camera-alt" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="items-center px-6 gap-4 pb-4 mb-4 relative z-10">
            <View className="relative" style={{ width: 128, height: 128 }}>
              <View className="rounded-full overflow-hidden" style={{ width: 128, height: 128 }}>
                <Image
                  source={
                    pet.photoUrl
                      ? { uri: pet.photoUrl }
                      : require('@/assets/images/pet-cat-mock-profile-image.png')
                  }
                  className="w-full h-full"
                  style={{ width: 128, height: 128 }}
                  contentFit="cover"
                />
              </View>
              <View
                className="absolute rounded-full border-4 border-white shadow-lg pointer-events-none"
                style={{ width: 128, height: 128, zIndex: 1 }}
              />
              {isEditing && (
                <TouchableOpacity
                  onPress={() => handlePickImage(false)}
                  className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full border-2 border-white"
                  style={{ zIndex: 2 }}
                >
                  <MaterialIcons name="add-a-photo" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>

            <View className="items-center gap-1">
              {isEditing ? (
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  className="bg-white/20 text-white text-3xl font-bold text-center rounded-lg px-4 py-1 border border-white/50"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
              ) : (
                <Text className="text-white text-3xl font-bold text-center">{pet.name}</Text>
              )}

              <Text className="text-white opacity-90 text-center text-lg">
                {PET_TYPES.find((t) => t.type === pet.type)?.label || pet.type} •{' '}
                {pet.breed || 'Без породи'}
              </Text>

              {/* Profile Completeness - only show if < 100% */}
              {showProfileCompleteness && (
                <View className="items-center mt-4 w-full gap-2">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={20} color="white" />
                    <Text className="text-white font-semibold">Заповненість профілю</Text>
                  </View>
                  <View className="bg-black/20 rounded-full p-1 w-48 h-4 overflow-hidden">
                    <View
                      className="bg-white h-full rounded-full"
                      style={{ width: `${pet.profileCompleteness || 50}%` }}
                    />
                  </View>
                  <Text className="text-white font-bold">{pet.profileCompleteness || 50}%</Text>
                </View>
              )}

              {isEditing && (
                <TouchableOpacity onPress={handleSaveEdit} className="bg-white px-6 py-2 rounded-full mt-4">
                  <Text className="text-orange-500 font-bold">Зберегти зміни</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Pet Information */}
        <View className="pb-8">
          {/* Basic Information Cards */}
          <View className="p-6 -mt-6 gap-6">
            <Text className="text-xl font-bold text-gray-800 ml-1">Основна інформація</Text>

            <View className="gap-3">
              {/* Type (editable) */}
              {isEditing && (
                <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <Text className="font-bold text-gray-800 mb-2">Тип тварини</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {PET_TYPES.map((item) => (
                        <TouchableOpacity
                          key={item.type}
                          onPress={() => setEditType(item.type)}
                          className={`px-4 py-2 rounded-full ${
                            editType === item.type
                              ? 'bg-orange-500'
                              : 'bg-gray-200'
                          }`}
                        >
                          <Text
                            className={`font-semibold ${
                              editType === item.type ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Birth Date */}
              <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between border border-gray-100">
                <View className="flex-row items-center gap-4 flex-1">
                  <MaterialIcons name="cake" size={24} color="#f97316" />
                  <View className="flex-1">
                    <Text className="font-bold text-gray-800">Дата народження</Text>
                    {isEditing ? (
                      <TextInput
                        value={editBirthDate}
                        onChangeText={setEditBirthDate}
                        placeholder="DD.MM.YYYY"
                        className="bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800"
                      />
                    ) : (
                      <Text className="text-gray-500">{pet.birthDate || 'Не вказано'}</Text>
                    )}
                  </View>
                </View>
                {!isEditing && (
                  <View className="bg-orange-100 px-3 py-1 rounded-full">
                    <Text className="text-orange-700 text-xs font-bold">{pet.age || 'Вік невідомий'}</Text>
                  </View>
                )}
              </View>

              {/* Weight */}
              <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
                <MaterialIcons name="fitness-center" size={24} color="#f97316" />
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">Вага</Text>
                  {isEditing ? (
                    <TextInput
                      value={editWeight}
                      onChangeText={setEditWeight}
                      keyboardType="numeric"
                      className="bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800"
                    />
                  ) : (
                    <Text className="text-gray-500">
                      {pet.weight ? `${pet.weight} ${pet.weightUnit || 'kg'}` : 'Не вказано'}
                    </Text>
                  )}
                </View>
              </View>

              {/* Color */}
              <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
                <MaterialIcons name="palette" size={24} color="#f97316" />
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">Колір</Text>
                  {isEditing ? (
                    <TextInput
                      value={editColor}
                      onChangeText={setEditColor}
                      placeholder="Колір шерсті..."
                      className="bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800"
                    />
                  ) : (
                    <Text className="text-gray-500">{pet.color || 'Не вказано'}</Text>
                  )}
                </View>
              </View>

              {/* Gender */}
              <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
                <MaterialIcons name="transgender" size={24} color="#f97316" />
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">Стать</Text>
                  {isEditing ? (
                    <View className="flex-row gap-2 mt-1">
                      <TouchableOpacity
                        onPress={() => setEditGender('male')}
                        className={`px-3 py-1 rounded-full ${
                          editGender === 'male' ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                      >
                        <Text className={editGender === 'male' ? 'text-white' : 'text-gray-600'}>
                          Хлопчик
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setEditGender('female')}
                        className={`px-3 py-1 rounded-full ${
                          editGender === 'female' ? 'bg-pink-500' : 'bg-gray-200'
                        }`}
                      >
                        <Text className={editGender === 'female' ? 'text-white' : 'text-gray-600'}>
                          Дівчинка
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text className="text-gray-500">
                      {pet.gender === 'male'
                        ? 'Хлопчик'
                        : pet.gender === 'female'
                        ? 'Дівчинка'
                        : 'Невідомо'}
                    </Text>
                  )}
                </View>
              </View>

              {/* Breed */}
              <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
                <MaterialIcons name="pets" size={24} color="#f97316" />
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">Порода</Text>
                  {isEditing ? (
                    <TextInput
                      value={editBreed}
                      onChangeText={setEditBreed}
                      placeholder="Порода..."
                      className="bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800"
                    />
                  ) : (
                    <Text className="text-gray-500">{pet.breed || 'Не вказано'}</Text>
                  )}
                </View>
              </View>

              {/* Microchip */}
              <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
                <MaterialIcons name="memory" size={24} color="#f97316" />
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">Мікрочіп</Text>
                  {isEditing ? (
                    <TextInput
                      value={editMicrochip}
                      onChangeText={setEditMicrochip}
                      placeholder="UA123456789"
                      className="bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800"
                    />
                  ) : (
                    <Text className="text-gray-500">{pet.microchip || 'Не вказано'}</Text>
                  )}
                </View>
              </View>

              {/* Neutered */}
              <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between border border-gray-100">
                <View className="flex-row items-center gap-4">
                  <MaterialIcons name="content-cut" size={24} color="#f97316" />
                  <Text className="font-bold text-gray-800">Стерилізовано</Text>
                </View>
                {isEditing ? (
                  <Switch
                    value={editIsNeutered}
                    onValueChange={setEditIsNeutered}
                    trackColor={{ false: '#e5e7eb', true: '#fdba74' }}
                    thumbColor={editIsNeutered ? '#f97316' : '#9ca3af'}
                  />
                ) : (
                  <Text className={`font-semibold ${pet.isNeutered ? 'text-green-600' : 'text-gray-400'}`}>
                    {pet.isNeutered ? 'Так' : 'Ні'}
                  </Text>
                )}
              </View>

              {/* Allergies */}
              {(isEditing || (pet.allergies && pet.allergies.length > 0)) && (
                <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <View className="flex-row items-center gap-4 mb-2">
                    <MaterialIcons name="warning" size={24} color="#f97316" />
                    <Text className="font-bold text-gray-800">Алергії</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      value={editAllergies}
                      onChangeText={setEditAllergies}
                      placeholder="Через кому: риба, курка..."
                      className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-800"
                    />
                  ) : (
                    <View className="flex-row flex-wrap gap-2 ml-10">
                      {pet.allergies?.map((allergy, index) => (
                        <View key={index} className="bg-red-100 px-3 py-1 rounded-full">
                          <Text className="text-red-700 text-sm font-medium">{allergy}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Special Needs */}
              {(isEditing || pet.specialNeeds) && (
                <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <View className="flex-row items-center gap-4 mb-2">
                    <MaterialIcons name="accessibility" size={24} color="#f97316" />
                    <Text className="font-bold text-gray-800">Особливі потреби</Text>
                  </View>
                  {isEditing ? (
                    <TextInput
                      value={editSpecialNeeds}
                      onChangeText={setEditSpecialNeeds}
                      placeholder="Опишіть особливі потреби..."
                      multiline
                      className="bg-white border border-gray-300 rounded px-2 py-2 text-gray-800 min-h-[60px]"
                      textAlignVertical="top"
                    />
                  ) : (
                    <Text className="text-gray-600 ml-10">{pet.specialNeeds}</Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Vet Information */}
          {(isEditing || pet.vetName || pet.vetPhone) && (
            <View className="px-6 pb-6 gap-4">
              <Text className="text-xl font-bold text-gray-800 ml-1">Ветеринар</Text>

              <View className="bg-blue-50 p-4 rounded-2xl border border-blue-100 gap-3">
                {/* Vet Name */}
                <View className="flex-row items-center gap-4">
                  <MaterialIcons name="local-hospital" size={24} color="#3b82f6" />
                  <View className="flex-1">
                    <Text className="font-bold text-gray-800">Клініка / Лікар</Text>
                    {isEditing ? (
                      <TextInput
                        value={editVetName}
                        onChangeText={setEditVetName}
                        placeholder="Назва клініки..."
                        className="bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800"
                      />
                    ) : (
                      <Text className="text-gray-500">{pet.vetName || 'Не вказано'}</Text>
                    )}
                  </View>
                </View>

                {/* Vet Phone */}
                <View className="flex-row items-center gap-4">
                  <MaterialIcons name="phone" size={24} color="#3b82f6" />
                  <View className="flex-1">
                    <Text className="font-bold text-gray-800">Телефон</Text>
                    {isEditing ? (
                      <TextInput
                        value={editVetPhone}
                        onChangeText={setEditVetPhone}
                        placeholder="+380 50 123 45 67"
                        keyboardType="phone-pad"
                        className="bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800"
                      />
                    ) : (
                      <Text className="text-gray-500">{pet.vetPhone || 'Не вказано'}</Text>
                    )}
                  </View>
                </View>

                {/* Vet Address */}
                {(isEditing || pet.vetAddress) && (
                  <View className="flex-row items-center gap-4">
                    <MaterialIcons name="location-on" size={24} color="#3b82f6" />
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800">Адреса</Text>
                      {isEditing ? (
                        <TextInput
                          value={editVetAddress}
                          onChangeText={setEditVetAddress}
                          placeholder="Адреса клініки..."
                          className="bg-white border border-gray-300 rounded px-2 py-1 mt-1 text-gray-800"
                        />
                      ) : (
                        <Text className="text-gray-500">{pet.vetAddress}</Text>
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Upcoming Events Section */}
          <LinearGradient
            colors={['rgba(251, 146, 60, 0.08)', 'rgba(245, 158, 11, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <UpcomingEventsSection petId={pet.id} petName={pet.name} maxEvents={3} />
          </LinearGradient>

          {/* Health Information */}
          <LinearGradient
            colors={['rgba(251, 146, 60, 0.05)', 'rgba(245, 158, 11, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View className="gap-4 py-6 px-6">
              <Text className="text-xl font-bold text-gray-800 ml-1">Здоров'я та ліки</Text>

              {/* Vaccination Status */}
              <View className="gap-3">
                <Text className="font-semibold text-gray-600 ml-1 uppercase text-xs">Вакцинації</Text>
                {pet.vaccinationStatus?.map((vaccination, index) => (
                  <View
                    key={index}
                    className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800">{vaccination.name}</Text>
                      <Text className="text-gray-500 text-sm">{vaccination.date}</Text>
                    </View>
                    <View
                      className={`px-2 py-1 rounded-full ${
                        vaccination.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          vaccination.status === 'completed' ? 'text-green-700' : 'text-orange-700'
                        }`}
                      >
                        {vaccination.status === 'completed' ? 'Виконано' : 'Заплановано'}
                      </Text>
                    </View>
                  </View>
                ))}
                {(!pet.vaccinationStatus || pet.vaccinationStatus.length === 0) && (
                  <Text className="text-gray-400 text-center italic">Немає записів про вакцинацію</Text>
                )}
              </View>
            </View>
          </LinearGradient>

          {/* Notes */}
          <View className="p-6 gap-4">
            <Text className="text-xl font-bold text-gray-800 ml-1">Нотатки</Text>

            <View className="flex-row flex-wrap gap-3">
              {pet.notes?.map((note, index) => (
                <View
                  key={index}
                  className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl w-[48%] mb-1"
                >
                  <Text className="text-gray-700 italic text-sm">{note}</Text>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => setIsNoteModalVisible(true)}
                className="bg-gray-50 border border-gray-200 border-dashed p-3 rounded-xl w-[48%] items-center justify-center h-20 active:bg-gray-100"
              >
                <MaterialIcons name="add" size={24} color="#9ca3af" />
                <Text className="text-gray-400 text-xs font-bold mt-1">Додати нотатку</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weight History */}
          {pet.weightHistory && pet.weightHistory.length > 0 && (
            <View className="p-6 gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-800 ml-1">Історія ваги</Text>
                <TouchableOpacity
                  onPress={() => setIsWeightModalVisible(true)}
                  className="bg-orange-100 px-3 py-1 rounded-full flex-row items-center gap-1"
                >
                  <MaterialIcons name="add" size={16} color="#f97316" />
                  <Text className="text-orange-600 font-semibold text-sm">Додати</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                {pet.weightHistory
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <View
                      key={index}
                      className={`flex-row items-center justify-between py-3 ${
                        index < pet.weightHistory!.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <View className="bg-orange-100 w-10 h-10 rounded-full items-center justify-center">
                          <MaterialIcons name="monitor-weight" size={20} color="#f97316" />
                        </View>
                        <Text className="font-bold text-gray-800 text-lg">
                          {entry.weight} {pet.weightUnit || 'kg'}
                        </Text>
                      </View>
                      <Text className="text-gray-500">{formatDate(entry.date)}</Text>
                    </View>
                  ))}
              </View>
            </View>
          )}

          {/* Photo Gallery */}
          <View className="p-6 gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-800 ml-1">Галерея</Text>
              <TouchableOpacity
                onPress={() => handlePickImage(true)}
                className="bg-orange-100 px-3 py-1 rounded-full flex-row items-center gap-1"
              >
                <MaterialIcons name="add-a-photo" size={16} color="#f97316" />
                <Text className="text-orange-600 font-semibold text-sm">Додати фото</Text>
              </TouchableOpacity>
            </View>

            {pet.photoGallery && pet.photoGallery.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3">
                  {pet.photoGallery.map((photo) => (
                    <TouchableOpacity
                      key={photo.id}
                      onPress={() => {
                        setSelectedPhoto(photo);
                        setEditingPhotoCaption(photo.caption || '');
                        setIsPhotoViewerVisible(true);
                      }}
                      className="relative"
                    >
                      <Image
                        source={{ uri: photo.uri }}
                        style={{ width: 120, height: 120, borderRadius: 16 }}
                        contentFit="cover"
                      />
                      {photo.caption && (
                        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 rounded-b-2xl">
                          <Text className="text-white text-xs text-center" numberOfLines={1}>
                            {photo.caption}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View className="bg-gray-50 rounded-2xl p-8 items-center border border-gray-100">
                <MaterialIcons name="photo-library" size={48} color="#d1d5db" />
                <Text className="text-gray-400 mt-2">Немає фотографій</Text>
                <TouchableOpacity
                  onPress={() => handlePickImage(true)}
                  className="mt-3 bg-orange-500 px-4 py-2 rounded-full"
                >
                  <Text className="text-white font-semibold">Додати перше фото</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Add Note Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isNoteModalVisible}
          onRequestClose={() => setIsNoteModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-6 rounded-2xl w-[90%] gap-4">
              <Text className="text-xl font-bold text-gray-800">Нова нотатка</Text>
              <TextInput
                className="border border-gray-200 rounded-xl p-4 h-32 text-start"
                multiline
                placeholder="Напишіть щось про вашого улюбленця..."
                textAlignVertical="top"
                value={newNote}
                onChangeText={setNewNote}
              />
              <View className="flex-row gap-4">
                <TouchableOpacity
                  className="flex-1 bg-gray-200 p-3 rounded-xl items-center"
                  onPress={() => setIsNoteModalVisible(false)}
                >
                  <Text className="font-bold text-gray-700">Скасувати</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-orange-500 p-3 rounded-xl items-center"
                  onPress={handleAddNote}
                >
                  <Text className="font-bold text-white">Зберегти</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
                <View className="bg-orange-100 w-16 h-16 rounded-full items-center justify-center mb-2">
                  <MaterialIcons name="monitor-weight" size={32} color="#f97316" />
                </View>
                <Text className="text-xl font-bold text-gray-800">Зважування</Text>
                <Text className="text-gray-500">Введіть поточну вагу улюбленця</Text>
              </View>

              <View className="flex-row items-center gap-2">
                <TextInput
                  className="flex-1 border border-gray-200 rounded-xl p-4 text-gray-800 text-2xl text-center font-bold"
                  keyboardType="numeric"
                  placeholder="0.0"
                  value={newWeight}
                  onChangeText={setNewWeight}
                />
                <Text className="text-xl font-bold text-gray-500">{pet.weightUnit || 'kg'}</Text>
              </View>

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
                  className="flex-1 bg-orange-500 p-3 rounded-xl items-center"
                  onPress={handleAddWeight}
                >
                  <Text className="font-bold text-white">Зберегти</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Photo Viewer Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isPhotoViewerVisible}
          onRequestClose={() => setIsPhotoViewerVisible(false)}
        >
          <View className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row justify-between items-center p-4 pt-12">
              <TouchableOpacity onPress={() => setIsPhotoViewerVisible(false)}>
                <MaterialIcons name="close" size={28} color="white" />
              </TouchableOpacity>
              {isEditing && (
                <TouchableOpacity onPress={handleSavePhotoCaption}>
                  <Text className="text-orange-500 font-bold text-lg">Зберегти</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Photo */}
            <View className="flex-1 justify-center items-center">
              {selectedPhoto && (
                <Image
                  source={{ uri: selectedPhoto.uri }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                  contentFit="contain"
                />
              )}
            </View>

            {/* Caption and Date */}
            <View className="p-6 pb-12">
              {isEditing ? (
                <TextInput
                  value={editingPhotoCaption}
                  onChangeText={setEditingPhotoCaption}
                  placeholder="Додати підпис..."
                  placeholderTextColor="#9ca3af"
                  className="bg-white/10 text-white p-4 rounded-xl border border-white/20"
                />
              ) : (
                selectedPhoto?.caption && (
                  <Text className="text-white text-lg text-center">{selectedPhoto.caption}</Text>
                )
              )}
              {selectedPhoto && (
                <Text className="text-gray-400 text-center mt-2">
                  {formatDate(selectedPhoto.date)}
                </Text>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}
