# Pet Connect: Mobile App

This repository contains the source code for the "Pet Connect" mobile application. This is a cross-platform companion app for pet owners, built with React Native, that empowers them to manage their pet's health, schedule appointments, and seamlessly purchase products from the Pet Connect e-commerce platform.

## Key Features

-   **Pet Profiles**: Create and manage detailed profiles for multiple pets.
-   **Proactive Reminders**: A robust system for notifications about vaccinations, parasite treatments, and medication schedules.
-   **Interactive Calendar**: View and manage upcoming appointments and important events.
-   **E-commerce Integration**: Browse the product catalog and place orders directly from within the app.
-   **Push Notifications**: Real-time alerts for reminders and order status updates.
-   **Offline Support**: Basic access to critical information (like pet profiles) even without an internet connection.

## Tech Stack

-   **Framework**: [React Native](https://reactnative.dev/)
-   **Language**: TypeScript
-   **State Management**: Redux Toolkit (or similar like Zustand)
-   **Navigation**: [React Navigation](https://reactnavigation.org/)
-   **API Communication**: Axios / React Query

## Prerequisites

To build and run this project locally, you will need the following installed on your machine:

-   [Node.js](https://nodejs.org/en/) (v18.x or higher) & Yarn/NPM
-   [Watchman](https://facebook.github.io/watchman/) (recommended for macOS)
-   The React Native CLI (`npx react-native --version`)
-   **For iOS**: Xcode and CocoaPods
-   **For Android**: Android Studio and the Android SDK

Please follow the official [React Native environment setup guide](https://reactnative.dev/docs/environment-setup) for detailed instructions.

## Getting Started

Follow these steps to get the application running on your local machine.

**1. Clone the repository:**
```bash
git clone https://github.com/PetCareUniProj/pet-connect-mobile.git
cd pet-connect-mobile
```

**2. Install JavaScript dependencies:**
```bash
npm install
```

**3. Install native dependencies (for iOS):**
```bash
cd ios && pod install
```

**4. Configure environment variables:**
Create a `.env` file in the root directory by copying the example file.
```bash
cp .env.example .env
```
Now, open the `.env` file and set the API gateway URL.

**Example `.env`:**
```env
# The main entry point for all backend APIs
API_GATEWAY_URL=http://localhost:3000
```

**5. Run the application:**

**For iOS:**
```bash
npm run ios
```

**For Android:**
```bash
npm run android
```

## Available Scripts

```bash
# Install all dependencies
$ npm install

# Run on the iOS simulator
$ npm run ios

# Run on the Android emulator/device
$ npm run android

# Run the linter
$ npm run lint
```

# Run tests
$ npm run test
