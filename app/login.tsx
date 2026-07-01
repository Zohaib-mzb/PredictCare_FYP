import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../firebaseConfig'; 

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to handle Alerts on both Web and Mobile
  const showWebAlert = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert("Notice", message);
    }
  };

  const handleLogin = async () => {
    // 1. Basic Validation
    if (!email || !password) {
      showWebAlert("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      // 2. Attempt Firebase Login
      await signInWithEmailAndPassword(auth, email, password);
      
      console.log("Login Successful!");
      setLoading(false);
      
      // 3. Navigate to Dashboard
      router.replace('/(tabs)/explore'); 

    } catch (error: any) {
      setLoading(false);
      console.log("Login Error Code:", error.code); 

      // 4. Handle Specific Errors
      if (
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/invalid-credential' || 
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-login-credentials'
      ) {
        
        // Special confirm box for Web vs Mobile
        if (Platform.OS === 'web') {
          const createAccount = window.confirm("We could not find an account with this email/password.\n\nWould you like to create a new account?");
          if (createAccount) {
            router.push('/signup');
          }
        } else {
          Alert.alert(
            "Login Failed",
            "We could not find an account with these details. Would you like to create one?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Create Account", onPress: () => router.push('/signup') }
            ]
          );
        }

      } else if (error.code === 'auth/invalid-email') {
        showWebAlert("Please enter a valid email address.");
      } else {
        showWebAlert("Login Failed: " + error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        
        {/* Card Container */}
        <View style={styles.card}>
          <Text style={styles.appName}>PredictCare</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your email" 
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your password" 
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
             {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.linkText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>AI-Powered Early Disease Prediction System</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF4FA', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    marginBottom: 30,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F2C4A', 
    marginBottom: 30,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#F3F4F6', 
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#333',
  },
  button: {
    width: '100%',
    backgroundColor: '#0F2C4A', 
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#0F2C4A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
});