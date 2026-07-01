import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // We will build our own custom header
        tabBarStyle: { display: 'none' }, // Hides the bottom tab bar to match your design
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Dashboard',
        }}
      />
      {/* You can add other screens here later if needed */}
    </Tabs>
  );
}