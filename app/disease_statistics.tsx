import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

const DISEASES = ['Dengue', 'Typhoid', 'Malaria', 'COVID-19'];
const PROVINCES = ['Punjab', 'Sindh', 'Balochistan', 'Khyber Pakhtunkhwa'];

// Now maps to EXACTLY 1 city to match your AI's data integrity
const PROVINCE_CITY_MAP: Record<string, string> = {
  'Punjab': 'Lahore',
  'Sindh': 'Karachi',
  'Balochistan': 'Quetta',
  'Khyber Pakhtunkhwa': 'Peshawar'
};

export default function DiseaseStatisticsScreen() {
  const router = useRouter();

  const [selectedDisease, setSelectedDisease] = useState('Dengue');
  const [selectedProvince, setSelectedProvince] = useState('Punjab');
  
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState<string[]>([]);
  const [cityData, setCityData] = useState<number[]>([]);

  const targetCity = PROVINCE_CITY_MAP[selectedProvince];

  // --- FETCH REAL AI DATA ---
  useEffect(() => {
    const fetch12MonthData = async () => {
      setLoading(true);
      try {
        // IMPORTANT: Replace with your actual local IP address!
        const API_URL = "https://predictcare-backend.onrender.com/predict_12_months"; 
        
        const response = await axios.post(API_URL, {
          province: selectedProvince,
          city: targetCity,
          disease: selectedDisease
        });

        setMonths(response.data.months);
        setCityData(response.data.cases);
      } catch (error) {
        console.error("Error fetching 12-month prediction:", error);
        // Fallback flatline on error so it doesn't crash the app
        setMonths(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
        setCityData(Array(12).fill(0.1)); 
      } finally {
        setLoading(false);
      }
    };

    fetch12MonthData();
  }, [selectedDisease, selectedProvince]); 

  const chartConfig = {
    backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    strokeWidth: 3,
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#0F2C4A" },
    decimalPlaces: 0
  };

  const sanitizeData = (data: number[]) => {
    if (!data || data.length === 0) return Array(12).fill(0.1);
    const isAllZeros = data.every(val => val === 0);
    return isAllZeros ? Array(12).fill(0.1) : data;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Predictive Statistics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.filterCard}>
          <Text style={styles.sectionTitle}>Global Filters</Text>
          
          <Text style={styles.label}>Target Disease</Text>
          <View style={styles.gridGroup}>
             {DISEASES.map(d => (
               <TouchableOpacity 
                 key={d}
                 style={[styles.gridBtn, selectedDisease === d && styles.gridBtnActive]} 
                 onPress={() => setSelectedDisease(d)}>
                 <Text style={[styles.gridText, selectedDisease === d && styles.gridTextActive]}>{d}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <Text style={[styles.label, {marginTop: 20}]}>Target Province</Text>
          <View style={styles.gridGroup}>
             {PROVINCES.map(p => (
               <TouchableOpacity 
                 key={p}
                 style={[styles.gridBtn, selectedProvince === p && styles.gridBtnActive]} 
                 onPress={() => setSelectedProvince(p)}>
                 <Text style={[styles.gridText, selectedProvince === p && styles.gridTextActive, p === 'Khyber Pakhtunkhwa' && {fontSize: 11}]} numberOfLines={1}>
                   {p}
                 </Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={20} color="#0F2C4A" />
            <Text style={styles.infoText}>
                Live AI Data: Showing past 6 months vs next 5 months forecast based on real environmental data.
            </Text>
        </View>

        {loading ? (
           <View style={{marginTop: 50, alignItems: 'center'}}>
              <ActivityIndicator size="large" color="#0F2C4A" />
              <Text style={{marginTop: 10, color: '#0F2C4A'}}>Generating AI Forecast...</Text>
           </View>
        ) : (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>{targetCity}</Text>
                <Text style={styles.chartSub}>12-Month AI Timeline</Text>
            </View>
            
            <View style={styles.todayLine}>
               <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>Now</Text>
               </View>
            </View>
            
            <LineChart
              data={{
                labels: months,
                datasets: [{ data: sanitizeData(cityData), color: () => '#0F2C4A' }]
              }}
              width={screenWidth - 70}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyle}
              withShadow={false}
              fromZero={true}
            />
            <View style={styles.legendContainer}>
                <View style={styles.legendDotPast} />
                <Text style={styles.legendText}>Past AI Prediction</Text>
                <View style={[styles.legendDotPast, {marginLeft: 15, backgroundColor: '#E74C3C'}]} />
                <Text style={styles.legendText}>Future Forecast</Text>
            </View>
          </View>
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
  filterCard: { backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 20, elevation: 3 },
  sectionTitle: { fontSize: 16, color: '#333', marginBottom: 15, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#0F2C4A', fontWeight: '600', marginBottom: 8 },
  gridGroup: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  gridBtn: { width: '48%', paddingVertical: 12, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  gridBtnActive: { backgroundColor: '#0F2C4A', borderColor: '#0F2C4A' },
  gridText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  gridTextActive: { color: 'white', fontWeight: 'bold' },
  infoBanner: { flexDirection: 'row', backgroundColor: '#DFEAF2', padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center', gap: 10 },
  infoText: { flex: 1, fontSize: 12, color: '#0F2C4A', lineHeight: 16 },
  chartCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 25, elevation: 3, position: 'relative' },
  chartHeader: { marginBottom: 10, alignItems: 'center' },
  chartTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F2C4A' },
  chartSub: { fontSize: 12, color: '#64748B' },
  chartStyle: { borderRadius: 12, marginLeft: -15, marginTop: 10 },
  todayLine: { position: 'absolute', width: 2, height: 195, backgroundColor: '#E74C3C', opacity: 0.8, left: '54.5%', top: 60, zIndex: 10, borderStyle: 'dashed', alignItems: 'center' },
  todayBadge: { backgroundColor: '#E74C3C', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, top: -10 },
  todayBadgeText: { color: 'white', fontSize: 8, fontWeight: 'bold' },
  legendContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  legendDotPast: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#0F2C4A', marginRight: 5 },
  legendText: { fontSize: 12, color: '#64748B' }
});