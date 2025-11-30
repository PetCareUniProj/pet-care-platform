// Tab index - redirects to dashboard
// This is used as the initial route for the tabs group

import { Redirect } from 'expo-router';

export default function TabsIndex() {
  // Redirect to dashboard as the main tab screen
  return <Redirect href="/(tabs)/dashboard" />;
}
