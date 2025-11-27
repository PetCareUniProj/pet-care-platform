import React, { useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { usePetsStore } from '@/store';
import { Pet } from '@/types/pet.types';
import { UpcomingEventsSection } from '@/components/pets';

export default function PetDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedPet, fetchPetById, isLoading, uploadPetPhoto, addPetNote, updatePet } = usePetsStore();
  
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState('');

  useEffect(() => {
    if (id) {
      fetchPetById(id);
    }
  }, [id]);

  useEffect(() => {
    if (selectedPet) {
        setEditName(selectedPet.name);
        setEditWeight(selectedPet.weight?.toString() || '');
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

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Виберіть джерело',
      'Звідки ви хочете вибрати фото?',
      [
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
                await uploadPetPhoto(id, result.assets[0].uri);
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
                await uploadPetPhoto(id, result.assets[0].uri);
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
      ]
    );
  };

  const handleAddNote = async () => {
    if (newNote.trim() && id) {
      await addPetNote(id, newNote);
      setNewNote('');
      setIsNoteModalVisible(false);
    }
  };

  const handleSaveEdit = async () => {
      if (id && selectedPet) {
          await updatePet(id, {
              name: editName,
              weight: parseFloat(editWeight) || undefined
          });
          setIsEditing(false);
      }
  }

  if (isLoading || !selectedPet) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  const pet = selectedPet;

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header with Pet Image */}
      <LinearGradient
        colors={['#fb923c', '#f59e0b']} // orange-400 to amber-500
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        className="rounded-b-3xl pb-8 overflow-hidden relative"
      >
        {/* Background Paw Icons */}
        <MaterialIcons name="pets" size={120} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', top: 40, left: -20, transform: [{ rotate: '-20deg' }] }} />
        <MaterialIcons name="pets" size={80} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', bottom: 20, right: -10, transform: [{ rotate: '15deg' }] }} />
        <MaterialIcons name="pets" size={60} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', top: 100, right: 40, transform: [{ rotate: '30deg' }] }} />

        <View className="flex-row justify-between items-center p-6 pt-12 relative z-10">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="bg-white/20 p-2 rounded-full border border-white/30 active:bg-white/30"
          >
             <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="flex-row gap-2">
            <TouchableOpacity 
                onPress={() => setIsEditing(!isEditing)}
                className="bg-white/20 p-2 rounded-full flex-row items-center border border-white/30 active:bg-white/30"
            >
                <MaterialIcons name={isEditing ? "close" : "edit"} size={20} color="white" />
                <Text className="text-white ml-2 font-semibold">{isEditing ? "Скасувати" : "Редагувати"}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={handlePickImage}
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
                source={pet.photoUrl ? { uri: pet.photoUrl } : require('@/assets/images/pet-cat-mock-profile-image.png')}
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
                onPress={handlePickImage}
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
                <Text className="text-white text-3xl font-bold text-center">
                {pet.name}
                </Text>
            )}
            
            <Text className="text-white opacity-90 text-center text-lg">
              {pet.type === 'cat' ? 'Кіт' : pet.type === 'dog' ? 'Собака' : pet.type} • {pet.breed || 'Без породи'}
            </Text>

            {/* Profile Completeness */}
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
            
            {isEditing && (
                <TouchableOpacity 
                    onPress={handleSaveEdit}
                    className="bg-white px-6 py-2 rounded-full mt-4"
                >
                    <Text className="text-orange-500 font-bold">Зберегти зміни</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Pet Information */}
      <View className="pb-8">
        {/* Basic Information Cards - Default Background */}
        <View className="p-6 -mt-4 gap-6">
          <Text className="text-xl font-bold text-gray-800 ml-1">Основна інформація</Text>

          <View className="gap-3">
            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between border border-gray-100">
              <View className="flex-row items-center gap-4">
                <MaterialIcons name="cake" size={24} color="#f97316" />
                <View>
                  <Text className="font-bold text-gray-800">Дата народження</Text>
                  <Text className="text-gray-500">{pet.birthDate || 'Не вказано'}</Text>
                </View>
              </View>
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-700 text-xs font-bold">{pet.age || 'Вік невідомий'}</Text>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
              <MaterialIcons name="fitness-center" size={24} color="#f97316" />
              <View>
                <Text className="font-bold text-gray-800">Вага</Text>
                {isEditing ? (
                    <TextInput 
                        value={editWeight}
                        onChangeText={setEditWeight}
                        keyboardType="numeric"
                        className="bg-white border border-gray-300 rounded px-2 py-0 text-gray-800"
                    />
                ) : (
                    <Text className="text-gray-500">{pet.weight} {pet.weightUnit}</Text>
                )}
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
              <MaterialIcons name="palette" size={24} color="#f97316" />
              <View>
                <Text className="font-bold text-gray-800">Колір шерсті</Text>
                <Text className="text-gray-500">{pet.color || 'Не вказано'}</Text>
              </View>
            </View>

            <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center gap-4 border border-gray-100">
              <MaterialIcons name="transgender" size={24} color="#f97316" />
              <View>
                <Text className="font-bold text-gray-800">Стать</Text>
                <Text className="text-gray-500">{pet.gender === 'male' ? 'Хлопчик' : pet.gender === 'female' ? 'Дівчинка' : 'Невідомо'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Upcoming Events Section */}
        <LinearGradient
          colors={['rgba(251, 146, 60, 0.08)', 'rgba(245, 158, 11, 0.08)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <UpcomingEventsSection petId={pet.id} petName={pet.name} maxEvents={3} />
        </LinearGradient>

        {/* Health Information - Gradient Background */}
        <LinearGradient
          colors={['rgba(251, 146, 60, 0.05)', 'rgba(245, 158, 11, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className=""
        >
          <View className="gap-4 py-6 px-6">
            <Text className="text-xl font-bold text-gray-800 ml-1">Здоров'я та ліки</Text>

            {/* Vaccination Status */}
            <View className="gap-3">
              <Text className="font-semibold text-gray-600 ml-1 uppercase text-xs">Вакцинації</Text>
              {pet.vaccinationStatus?.map((vaccination, index) => (
                <View key={index} className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-bold text-gray-800">{vaccination.name}</Text>
                    <Text className="text-gray-500 text-sm">{vaccination.date}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-full ${vaccination.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-xs font-bold ${vaccination.status === 'completed' ? 'text-green-700' : 'text-orange-700'}`}>
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

        {/* Notes - Default Background */}
        <View className="p-6 gap-4">
          <Text className="text-xl font-bold text-gray-800 ml-1">Нотатки</Text>

          <View className="flex-row flex-wrap gap-3">
            {pet.notes?.map((note, index) => (
              <View key={index} className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl w-[48%] mb-1">
                <Text className="text-gray-700 italic text-sm">
                  {note}
                </Text>
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
    </ScrollView>
    </>
  );
}
