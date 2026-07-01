import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function for Web Alerts
  const showWebAlert = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert("Error", message);
    }
  };

  const handleSignup = async () => {
    // 1. STRICT VALIDATION CHECKS
    
    // Check if empty
    if (!fullName || !email || !password || !confirmPassword) {
      showWebAlert("Please fill in all fields.");
      return;
    }

    // Check Name Length
    if (fullName.length < 3) {
      showWebAlert("Full Name must be at least 3 characters long.");
      return;
    }

    // Check Email Format (Simple check for @ and .)
    if (!email.includes("@") || !email.includes(".")) {
      showWebAlert("Please enter a valid email address (e.g., user@email.com).");
      return;
    }

    // Check Password Length
    if (password.length < 6) {
      showWebAlert("Password should be at least 6 characters long.");
      return;
    }

    // Check Matching Passwords
    if (password !== confirmPassword) {
      showWebAlert("Passwords do not match.");
      return;
    }

    // 2. FIREBASE CREATION
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's display name
      await updateProfile(user, {
        displayName: fullName,
      });

      setLoading(false);
      
      // Success Alert
      if (Platform.OS === 'web') {
        window.alert("Success! Account created successfully. Please login.");
        router.push('/login');
      } else {
        Alert.alert("Success", "Account created successfully! Please login.", [
          { text: "OK", onPress: () => router.push('/login') }
        ]);
      }

    } catch (error: any) {
      setLoading(false);
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "That email address is already in use!";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "That email address is invalid!";
      }
      showWebAlert(errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <Text style={styles.appName}>PredictCare</Text>
          <Text style={styles.subTitle}>Create Account</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your full name" 
              placeholderTextColor="#A0A0A0"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email */}
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

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Create a password" 
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

           {/* Confirm Password */}
           <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Confirm your password" 
              placeholderTextColor="#A0A0A0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Your data is securely stored and used only for prediction purposes.
          </Text>

          <View style={styles.loginRow}>
             <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.linkText}>Login</Text>
            </TouchableOpacity>
          </View>
         
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF4FA', 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    paddingVertical: 30,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F2C4A',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 25,
    fontWeight: '500',
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
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    color: '#333',
  },
  linkText: {
    color: '#0F2C4A',
    fontWeight: 'bold',
  },
});