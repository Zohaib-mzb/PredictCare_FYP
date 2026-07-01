import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

// IMPORTANT: Replace this with your laptop's IP Address for physical device testing
const API_URL = "http://192.168.1.2:8000/predict"; 

export default function LocalRiskScannerScreen() {
  const router = useRouter();

  // --- STATE VARIABLES ---
  const [region, setRegion] = useState('Punjab');
  const [disease, setDisease] = useState('Dengue');
  
  // Environmental variables
  const [weatherData, setWeatherData] = useState({
    rainfall: '', // mm
    humidity: '', // %
    temperature: '', // °C
  });
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  // --- INPUT HANDLER ---
  const handleInputChange = (key: keyof typeof weatherData, value: string) => {
    setWeatherData(prev => ({ ...prev, [key]: value }));
  };

  // --- TOGGLE HANDLER FOR REGION/DISEASE ---
  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
  };

  // --- AI RISK CALCULATION (API Call) ---
  const handleAnalyze = async () => {
    if (!weatherData.temperature || !weatherData.humidity) {
      Alert.alert("Input Required", "Please enter at least the current temperature and humidity for an accurate reading.");
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      // 1. Call your FastAPI backend
      const response = await axios.post(API_URL, { 
        region: region, 
        disease: disease 
      });

      if (response.data) {
        const forecastCases = response.data.forecast_cases;
        const totalForecast = forecastCases.reduce((a: number, b: number) => a + b, 0);
        const temp = parseFloat(weatherData.temperature);
        const hum = parseFloat(weatherData.humidity);

        // Calculate a risk multiplier based on local inputs vs. baseline
        let riskMultiplier = 1.0;
        let riskReason = "";

        if (disease === 'Dengue') {
           if (temp > 25 && hum > 60) {
             riskMultiplier = 1.3;
             riskReason = "High temperatures combined with elevated humidity create ideal breeding conditions for Aedes mosquitoes in your area.";
           } else {
             riskMultiplier = 0.8;
             riskReason = "Current local weather conditions are slightly less favorable for mosquito breeding, lowering immediate risk.";
           }
        } else if (disease === 'COVID-19') {
           if (temp < 20) {
              riskMultiplier = 1.1;
              riskReason = "Cooler local temperatures may increase indoor crowding, slightly elevating respiratory transmission risk.";
           } else {
              riskMultiplier = 0.9;
              riskReason = "Current weather conditions do not show significant environmental exacerbation for viral transmission.";
           }
        } else if (disease === 'Malaria') {
           if (temp > 20 && hum > 50) {
              riskMultiplier = 1.2;
              riskReason = "Warm and humid conditions favor the breeding of Anopheles mosquitoes, increasing local Malaria transmission risk.";
           } else {
              riskMultiplier = 0.8;
              riskReason = "Lower temperatures or drier conditions currently reduce mosquito activity in your local environment.";
           }
        } else if (disease === 'Typhoid') {
           if (temp > 25) {
              riskMultiplier = 1.1;
              riskReason = "Warmer temperatures can accelerate bacterial growth in unprotected water and food sources. Maintain strict hygiene.";
           } else {
              riskMultiplier = 0.9;
              riskReason = "Standard environmental risk. Ensure safe drinking water and general food hygiene.";
           }
        }

        const adjustedRiskScore = Math.min(100, Math.round((totalForecast / 1000) * riskMultiplier * 10));

        // 3. Determine Color and Level
        let riskLevel = "Low";
        let color = "#27AE60"; // Green
        let advice = "Continue standard hygiene practices. No immediate severe threat detected based on local environment.";

        if (adjustedRiskScore > 75) {
          riskLevel = "High";
          color = "#E74C3C"; // Red
          advice = `Immediate precautions advised. Based on ${region}'s AI forecast and your local weather, ${disease} transmission risk is critical.`;
        } else if (adjustedRiskScore > 40) {
          riskLevel = "Moderate";
          color = "#F39C12"; // Orange
          advice = `Stay vigilant. Environmental factors in ${region} are moderately favorable for ${disease} spread.`;
        }

        // 4. Set Result
        setResult({
          disease: disease,
          region: region,
          score: adjustedRiskScore,
          level: riskLevel,
          reason: riskReason,
          advice: advice,
          color: color,
          backendForecast: totalForecast
        });
      }
    } catch (error) {
       Alert.alert("Connection Error", "Could not connect to the AI model. Ensure your backend is running.");
       console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setWeatherData({ rainfall: '', humidity: '', temperature: '' });
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Local Environmental Risk</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- INPUT FORM CARD --- */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Target Parameters</Text>

          {/* Region Selection */}
          <Text style={styles.label}>Select Region</Text>
          <View style={styles.gridGroup}>
             {['Punjab', 'Sindh', 'Balochistan', 'Khyber Pakhtunkhwa'].map(r => (
               <TouchableOpacity 
                 key={r}
                 style={[styles.gridBtn, region === r && styles.gridBtnActive]} 
                 onPress={() => toggleSelection(setRegion, r)}>
                 <Text style={[styles.gridText, region === r && styles.gridTextActive, r === 'Khyber Pakhtunkhwa' && {fontSize: 11}]} numberOfLines={1}>
                   {r}
                 </Text>
               </TouchableOpacity>
             ))}
          </View>
          
          <Text style={[styles.label, {marginTop: 20}]}>Select Disease Target</Text>
          <View style={styles.gridGroup}>
             {['Dengue', 'COVID-19', 'Typhoid', 'Malaria'].map(d => (
               <TouchableOpacity 
                 key={d}
                 style={[styles.gridBtn, disease === d && styles.gridBtnActive]} 
                 onPress={() => toggleSelection(setDisease, d)}>
                 <Text style={[styles.gridText, disease === d && styles.gridTextActive]}>{d}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Local Weather Conditions</Text>
          
          {/* Weather Inputs */}
          <View style={styles.inputRow}>
             <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Temp (°C)</Text>
                <TextInput 
                  style={styles.input} placeholder="e.g. 32" placeholderTextColor="#999" keyboardType="numeric"
                  value={weatherData.temperature} onChangeText={(v) => handleInputChange('temperature', v)}
                />
             </View>
             <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Humidity (%)</Text>
                <TextInput 
                  style={styles.input} placeholder="e.g. 65" placeholderTextColor="#999" keyboardType="numeric"
                  value={weatherData.humidity} onChangeText={(v) => handleInputChange('humidity', v)}
                />
             </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
             {result ? (
                 <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                    <Text style={styles.resetButtonText}>Scan New Area</Text>
                 </TouchableOpacity>
             ) : (
                <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze} disabled={analyzing}>
                    {analyzing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.analyzeButtonText}>Run Environmental Scan</Text>
                    )}
                </TouchableOpacity>
             )}
          </View>
        </View>

        {/* --- RESULTS SECTION --- */}
        {result && (
            <>
                <View style={styles.resultCard}>
                    <View style={[styles.resultStrip, { backgroundColor: result.color }]} />
                    <View style={styles.resultContent}>
                        <View style={styles.aiHeader}>
                            <MaterialCommunityIcons name="radar" size={24} color="#0F2C4A" />
                            <Text style={styles.aiTitle}>Live Risk Assessment</Text>
                        </View>
                        
                        <Text style={styles.resultLabel}>Threat Level in {result.region}:</Text>
                        <Text style={[styles.diseaseText, { color: result.color }]}>
                            {result.level} Risk <Text style={styles.probText}>({result.score}/100 Score)</Text>
                        </Text>

                        <Text style={styles.resultLabel}>AI Reasoning:</Text>
                        <Text style={styles.reasonText}>{result.reason}</Text>
                        
                        <Text style={[styles.resultLabel, {marginTop: 10}]}>Backend Forecast:</Text>
                        <Text style={styles.reasonText}>{result.backendForecast} projected cases this week regionally.</Text>
                    </View>
                </View>

                <View style={styles.adviceCard}>
                    <View style={styles.aiHeader}>
                        <MaterialCommunityIcons name="shield-check-outline" size={24} color="#F39C12" />
                        <Text style={styles.aiTitle}>Recommended Precautions</Text>
                    </View>
                    <Text style={styles.adviceText}>{result.advice}</Text>
                </View>
            </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBF4FA' },
  header: {
    backgroundColor: '#0F2C4A', flexDirection: 'row', alignItems: 'center', padding: 15, paddingTop: Platform.OS === 'android' ? 40 : 15,
  },
  backButton: { marginRight: 15 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3,
  },
  sectionTitle: { fontSize: 16, color: '#333', marginBottom: 15, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#0F2C4A', fontWeight: '600', marginBottom: 8 },
  
  // New 2x2 Grid Styling
  gridGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  gridBtn: {
    width: '48%', 
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridBtnActive: { 
    backgroundColor: '#0F2C4A', 
    borderColor: '#0F2C4A' 
  },
  gridText: { 
    color: '#64748B', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  gridTextActive: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  inputWrapper: { flex: 1 },
  inputLabel: { fontSize: 12, color: '#64748B', marginBottom: 4 },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#333',
  },
  
  buttonContainer: { marginTop: 25 },
  analyzeButton: { backgroundColor: '#27AE60', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  analyzeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  resetButton: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ccc', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  resetButtonText: { color: '#666', fontWeight: '600', fontSize: 16 },
  
  resultCard: {
    backgroundColor: 'white', borderRadius: 12, flexDirection: 'row', overflow: 'hidden', marginBottom: 15, elevation: 2,
  },
  resultStrip: { width: 6 },
  resultContent: { flex: 1, padding: 15 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F2C4A' },
  resultLabel: { fontSize: 12, color: '#888', marginTop: 5 },
  diseaseText: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  probText: { fontSize: 14, fontWeight: 'normal', color: '#666' },
  reasonText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  
  adviceCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, elevation: 2, marginBottom: 30 },
  adviceText: { fontSize: 14, color: '#475569', lineHeight: 20 },
});