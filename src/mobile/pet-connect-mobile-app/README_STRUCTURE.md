# Структура проекту Pet Connect Mobile App

## Створена структура

### 📁 Папки та файли

```
pet-connect-mobile-app/
├── app/
│   ├── (auth)/              # Екрани автентифікації
│   │   ├── _layout.tsx
│   │   ├── onboarding.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/             # Основні вкладки
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── explore.tsx
│   │   └── profile.tsx
│   └── _layout.tsx         # Root layout
│
├── services/
│   └── api/                # API сервіси
│       ├── client.ts       # Axios instance з interceptors
│       ├── auth.service.ts
│       ├── pets.service.ts
│       ├── reminders.service.ts
│       ├── catalog.service.ts
│       ├── basket.service.ts
│       ├── orders.service.ts
│       ├── subscriptions.service.ts
│       └── index.ts
│
├── types/                  # TypeScript типи
│   ├── api.types.ts
│   ├── auth.types.ts
│   ├── pet.types.ts
│   ├── reminder.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── subscription.types.ts
│   └── index.ts
│
├── utils/                  # Допоміжні функції
│   ├── storage.ts         # Secure storage та AsyncStorage
│   ├── validation.ts      # Валідація форм
│   ├── format.ts          # Форматування дат, валют тощо
│   └── index.ts
│
├── constants/              # Константи
│   ├── api.ts             # API endpoints та конфігурація
│   └── theme.ts           # Теми (вже існує)
│
├── store/                  # State management
│   └── index.ts           # Заглушка для Redux/Zustand
│
├── components/             # Компоненти (вже існує)
├── hooks/                  # Кастомні хуки (вже існує)
└── assets/                 # Ресурси (вже існує)
```

## Основні компоненти

### 1. API Client (`services/api/client.ts`)
- Axios instance з налаштуваннями
- Interceptors для токенів
- Автоматичний refresh токенів
- Retry logic для мережевих помилок
- Обробка помилок

### 2. Services
- **auth.service.ts** - автентифікація через Keycloak
- **pets.service.ts** - CRUD операції для тварин
- **reminders.service.ts** - управління нагадуваннями
- **catalog.service.ts** - каталог товарів
- **basket.service.ts** - кошик покупок
- **orders.service.ts** - замовлення
- **subscriptions.service.ts** - підписки

### 3. Types
Повний набір TypeScript типів для всіх сутностей системи:
- Auth (User, AuthTokens, LoginCredentials)
- Pet (Pet, CreatePetDto, UpdatePetDto)
- Reminder (Reminder, CreateReminderDto)
- Product (Product, Brand, Category)
- Order (Order, OrderItem, Basket)
- Subscription (Subscription, CreateSubscriptionDto)

### 4. Utils
- **storage.ts** - робота з SecureStore та AsyncStorage
- **validation.ts** - валідація форм (email, phone, password тощо)
- **format.ts** - форматування дат, валют, телефонів

### 5. Constants
- **api.ts** - всі API endpoints для мікросервісів
- Конфігурація Keycloak
- Timeout та retry налаштування

### 6. Auth Screens
- **onboarding.tsx** - екран привітання для нових користувачів
- **login.tsx** - вхід в систему
- **register.tsx** - реєстрація
- **forgot-password.tsx** - відновлення паролю

## Наступні кроки

1. **Встановити залежності:**
   ```bash
   npm install
   ```

2. **Налаштувати environment variables:**
   Створити `.env` файл з:
   ```
   EXPO_PUBLIC_API_GATEWAY_URL=http://localhost:3000
   EXPO_PUBLIC_KEYCLOAK_URL=http://localhost:8080
   EXPO_PUBLIC_KEYCLOAK_REALM=pet-care-platform
   EXPO_PUBLIC_KEYCLOAK_CLIENT_ID=pet-connect-mobile
   ```

3. **Реалізувати state management:**
   - Додати Redux Toolkit або Zustand
   - Налаштувати auth state
   - Додати інші slices/stores

4. **Створити компоненти:**
   - Компоненти для тварин (PetCard, PetList)
   - Компоненти для нагадувань
   - Компоненти для магазину
   - UI компоненти (Loading, Error, Empty states)

5. **Додати навігацію:**
   - Налаштувати guards для захищених роутів
   - Додати deep linking

6. **Інтегрувати з backend:**
   - Підключити до реальних API endpoints
   - Реалізувати Keycloak OAuth2/OIDC
   - Додати обробку помилок
