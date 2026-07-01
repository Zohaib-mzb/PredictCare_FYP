import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';

export default function Index() {
  // Temporary logic: We assume user is NOT logged in initially.
  // Later, we will connect Firebase here to check real login status.
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a quick check (like checking local storage)
    setTimeout(() => {
      setIsLoggedIn(false); // Change to true to test Dashboard flow later
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0F2C4A" />
      </View>
    );
  }

  // If logged in, go to Dashboard (Tabs). If not, go to Login.
  return isLoggedIn ? <Redirect href="/(tabs)/explore" /> : <Redirect href="/login" />;
}