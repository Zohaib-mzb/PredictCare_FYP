import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { auth } from '../../firebaseConfig';

const screenWidth = Dimensions.get("window").width;

// REPLACE THIS WITH YOUR ACTUAL LOCAL IP ADDRESS
const API_URL = "http://192.168.1.2:8000/predict";

interface DiseasePrediction {
  dates: string[];
  cases: number[];
  displayCases: string;
  trend: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  // Advanced Tooltip State
  const [tooltip, setTooltip] = useState({
    visible: false, x: 0, y: 0, value: 0, disease: '', day: '',
    provincialData: { sindh: 0, punjab: 0, balochistan: 0 }
  });

  const defaultDates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const defaultCases = [0, 0, 0, 0, 0, 0, 0];

  // 1. STATE FOR NATIONAL DATA (Used for Cards & Graph Lines)
  const [nationalPredictions, setNationalPredictions] = useState<Record<string, DiseasePrediction>>({
    dengue: { dates: defaultDates, cases: defaultCases, displayCases: "Loading...", trend: "Calculating..." },
    covid: { dates: defaultDates, cases: defaultCases, displayCases: "Loading...", trend: "Calculating..." },
    typhoid: { dates: defaultDates, cases: defaultCases, displayCases: "Loading...", trend: "Calculating..." },
    malaria: { dates: defaultDates, cases: defaultCases, displayCases: "Loading...", trend: "Calculating..." },
  });

  // 2. STATE FOR PROVINCIAL DATA (Used only for Tooltip Breakdowns)
  const [provincialData, setProvincialData] = useState<Record<string, Record<string, number[]>>>({
    dengue: { sindh: defaultCases, punjab: defaultCases, balochistan: defaultCases },
    covid: { sindh: defaultCases, punjab: defaultCases, balochistan: defaultCases },
    typhoid: { sindh: defaultCases, punjab: defaultCases, balochistan: defaultCases },
    malaria: { sindh: defaultCases, punjab: defaultCases, balochistan: defaultCases },
  });

  const calculateTrend = (cases: number[]): string => {
    if (!cases || cases.length < 7) return "Stable trend (±0%)";
    const today = cases[0];
    const nextWeek = cases[6];
    const difference = nextWeek - today;
    if (today === 0 && difference === 0) return "Stable trend (0 cases)";
    if (today === 0 && difference > 0) return `Expected increase: +${difference} cases`;
    const percentage = ((difference / today) * 100).toFixed(0);
    const absolutePercentage = Math.abs(Number(percentage));
    if (difference > 0) return `Expected increase: ${absolutePercentage}%`;
    if (difference < 0) return `Expected decrease: ${absolutePercentage}%`;
    return "Stable trend (±0%)";
  };

  const sanitizeChartData = (cases: number[]) => {
    if (!cases || cases.length === 0) return [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
    const isAllZeros = cases.every(val => val === 0);
    return isAllZeros ? [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1] : cases;
  };

  // --- FETCH ALL DATA (NATIONAL AND PROVINCIAL) ---
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Fetch National Data (For Cards & Graph Lines)
        const nationalPayloads = [
          axios.post(API_URL, { region: "Pakistan (National)", disease: "Dengue" }),
          axios.post(API_URL, { region: "Pakistan (National)", disease: "COVID-19" }),
          axios.post(API_URL, { region: "Pakistan (National)", disease: "Typhoid" }),
          axios.post(API_URL, { region: "Pakistan (National)", disease: "Malaria" })
        ];

        const nationalResults = await Promise.allSettled(nationalPayloads);
        const newNationalData = { ...nationalPredictions };
        const keys = ['dengue', 'covid', 'typhoid', 'malaria'];

        nationalResults.forEach((result, index) => {
          const key = keys[index];
          if (result.status === 'fulfilled') {
            const forecastDates = result.value.data.forecast_dates;
            const forecastCases = result.value.data.forecast_cases;
            newNationalData[key] = {
              dates: forecastDates,
              cases: forecastCases,
              displayCases: `${forecastCases[6].toLocaleString()} cases`,
              trend: calculateTrend(forecastCases)
            };
          }
        });
        setNationalPredictions(newNationalData);

        // 2. Fetch Provincial Data (Silent Background Fetch for Tooltips)
        const regions = ["Sindh", "Punjab", "Balochistan"];
        const diseases = ["Dengue", "COVID-19", "Typhoid", "Malaria"];
        const newProvincialData = { ...provincialData };

        for (let dIndex = 0; dIndex < diseases.length; dIndex++) {
          const dKey = keys[dIndex];
          const diseaseName = diseases[dIndex];
          
          const provPayloads = regions.map(region => 
            axios.post(API_URL, { region: region, disease: diseaseName })
          );
          
          const provResults = await Promise.allSettled(provPayloads);
          
          if (provResults[0].status === 'fulfilled') newProvincialData[dKey].sindh = provResults[0].value.data.forecast_cases;
          if (provResults[1].status === 'fulfilled') newProvincialData[dKey].punjab = provResults[1].value.data.forecast_cases;
          if (provResults[2].status === 'fulfilled') newProvincialData[dKey].balochistan = provResults[2].value.data.forecast_cases;
        }
        setProvincialData(newProvincialData);

      } catch (error) {
        console.error("Data fetch error:", error);
      }
    };

    fetchAllData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuVisible(false);
      router.replace('/login');
    } catch (error) {
      Alert.alert("Error", "Failed to log out");
    }
  };

  const handleNavigation = (screenName: string) => {
    setMenuVisible(false); 
    if (screenName === 'Local Risk Scanner') router.push('/local-scanner');
    else if (screenName === 'Statistics') router.push('/disease_statistics'); 
    else if (screenName === 'Advisory') router.push('/health-advisory');
    else if (screenName !== 'Dashboard') Alert.alert("Coming Soon", `Under construction.`);
  };

  // --- 4-LINE GRAPH CONFIGURATION ---
  const mainGraphData = {
    labels: nationalPredictions.dengue.dates,
    datasets: [
      { data: sanitizeChartData(nationalPredictions.dengue.cases), color: () => '#E74C3C', name: 'dengue' }, // Red
      { data: sanitizeChartData(nationalPredictions.covid.cases), color: () => '#8E44AD', name: 'covid' },   // Purple
      { data: sanitizeChartData(nationalPredictions.typhoid.cases), color: () => '#3498DB', name: 'typhoid' }, // Blue
      { data: sanitizeChartData(nationalPredictions.malaria.cases), color: () => '#F39C12', name: 'malaria' }  // Orange
    ],
    legend: ["Dengue", "COVID-19", "Typhoid", "Malaria"]
  };

  const handleDataPointClick = (data: any) => {
    const diseaseKey = data.dataset.name;
    const dayIndex = data.index;
    const dayName = mainGraphData.labels[dayIndex];
    
    // Retrieve the silent provincial data for this specific day
    const sCases = provincialData[diseaseKey].sindh[dayIndex] || 0;
    const pCases = provincialData[diseaseKey].punjab[dayIndex] || 0;
    const bCases = provincialData[diseaseKey].balochistan[dayIndex] || 0;

    const displayNames: Record<string, string> = {
        dengue: "Dengue", covid: "COVID-19", typhoid: "Typhoid", malaria: "Malaria"
    };

    setTooltip({
      visible: true,
      x: data.x,
      y: data.y,
      value: data.value,
      disease: displayNames[diseaseKey],
      day: dayName,
      provincialData: { sindh: sCases, punjab: pCases, balochistan: bCases }
    });
    
    setTimeout(() => setTooltip(prev => ({ ...prev, visible: false })), 5000);
  };

  const cardsData = [
    {
      id: 1, title: "Dengue", icon: <MaterialCommunityIcons name="virus" size={24} color="#0F2C4A" />,
      statLabel: "Next 7 Days (National):", statValue: nationalPredictions.dengue.displayCases,
      predLabel: "Prediction Insight:", predValue: nationalPredictions.dengue.trend,
    },
    {
      id: 2, title: "COVID-19", icon: <MaterialCommunityIcons name="face-mask" size={28} color="#0F2C4A" />,
      statLabel: "Next 7 Days (National):", statValue: nationalPredictions.covid.displayCases,
      predLabel: "Prediction Insight:", predValue: nationalPredictions.covid.trend,
    },
    {
      id: 3, title: "TYPHOID", icon: <FontAwesome5 name="bacteria" size={30} color="#0F2C4A" />,
      statLabel: "Next 7 Days (National):", statValue: nationalPredictions.typhoid.displayCases,
      predLabel: "Prediction Insight:", predValue: nationalPredictions.typhoid.trend,
    },
    {
      id: 4, title: "MALARIA", icon: <FontAwesome5 name="bug" size={32} color="#0F2C4A" />,
      statLabel: "Next 7 Days (National):", statValue: nationalPredictions.malaria.displayCases,
      predLabel: "Prediction Insight:", predValue: nationalPredictions.malaria.trend,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PredictCare</Text>
        <View style={{ width: 32 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Early Disease Prediction for Pakistan</Text>

        <View style={styles.mainGraphCard}>
          <Text style={styles.mainGraphTitle}>7-Day National AI Forecast</Text>
          <Text style={styles.mainGraphSub}>Tap any dot to view provincial breakdown.</Text>
          
          <View style={{ position: 'relative' }}>
            <LineChart
              data={mainGraphData}
              width={screenWidth - 60}
              height={240}
              chartConfig={{
                backgroundGradientFrom: "#fff", backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                strokeWidth: 3,
                propsForDots: { r: "5", strokeWidth: "2", stroke: "#fff" }
              }}
              bezier
              style={styles.mainChart}
              onDataPointClick={handleDataPointClick}
              withShadow={false}
            />

            {/* ADVANCED PROVINCIAL TOOLTIP */}
            {tooltip.visible && (
              <View style={[styles.tooltipBox, { 
                  left: tooltip.x > screenWidth / 2 ? tooltip.x - 160 : tooltip.x + 10, 
                  top: Math.max(0, tooltip.y - 80) 
                }]}>
                <Text style={styles.toolTitle}>{tooltip.disease} on {tooltip.day}</Text>
                <Text style={styles.toolTotal}>National: {Math.round(tooltip.value)}</Text>
                <View style={styles.toolDivider} />
                <Text style={styles.toolProv}>Sindh: {Math.round(tooltip.provincialData.sindh)}</Text>
                <Text style={styles.toolProv}>Punjab: {Math.round(tooltip.provincialData.punjab)}</Text>
                <Text style={styles.toolProv}>Balochistan: {Math.round(tooltip.provincialData.balochistan)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.grid}>
          {cardsData.map((card) => (
            <View key={card.id} style={styles.card}>
              <View style={styles.cardHeader}>
                {card.icon}
                <Text style={styles.cardTitle}>{card.title}</Text>
              </View>
              <View style={styles.statContainer}>
                <Text style={styles.statLabel}>{card.statLabel}</Text>
                <Text style={styles.statValue}>{card.statValue}</Text>
              </View>
              <View style={styles.statContainer}>
                <Text style={styles.statLabel}>{card.predLabel}</Text>
                <Text style={styles.predValue}>{card.predValue}</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => router.push({ pathname: '/analysis/[id]', params: { id: card.title.toLowerCase() } })}
              >
                <Text style={styles.actionButtonText}>View Analysis</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* --- SIDE MENU --- */}
      <Modal visible={menuVisible} transparent={true} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.menuItems}>
              <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                <MaterialCommunityIcons name="view-grid-outline" size={24} color="#0F2C4A" />
                <Text style={styles.menuText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Statistics')}>
                <MaterialCommunityIcons name="chart-bar" size={24} color="#0F2C4A" />
                <Text style={styles.menuText}>Disease Statistics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Local Risk Scanner')}>
                <MaterialCommunityIcons name="stethoscope" size={24} color="#0F2C4A" />
                <Text style={styles.menuText}>Local Risk Scanner</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation('Advisory')}>
                <MaterialCommunityIcons name="file-document-outline" size={24} color="#0F2C4A" />
                <Text style={styles.menuText}>Health Advisory</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.menuFooter}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#E74C3C" />
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setMenuVisible(false)} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EBF4FA' },
  header: {
    backgroundColor: '#0F2C4A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 15, paddingTop: Platform.OS === 'android' ? 40 : 15, 
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F2C4A', textAlign: 'center', marginBottom: 20 },
  
  /* --- STYLES FOR GRAPH --- */
  mainGraphCard: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  mainGraphTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F2C4A', marginBottom: 2 },
  mainGraphSub: { fontSize: 12, color: '#64748B', marginBottom: 15 },
  mainChart: { borderRadius: 12, marginLeft: -15 },
  
  /* --- NEW STYLES FOR ADVANCED TOOLTIP --- */
  tooltipBox: { position: 'absolute', backgroundColor: 'rgba(15, 44, 74, 0.95)', padding: 12, borderRadius: 8, width: 160, zIndex: 100 },
  toolTitle: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  toolTotal: { color: '#E74C3C', fontSize: 12, fontWeight: '900', marginBottom: 4 },
  toolDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  toolProv: { color: '#94A3B8', fontSize: 11, marginVertical: 2 },

  /* --- ORIGINAL CARD STYLES --- */
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: 'white', width: '48%', borderRadius: 12, padding: 15, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F2C4A', flex: 1 },
  statContainer: { marginBottom: 10 },
  statLabel: { fontSize: 11, color: '#64748B', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  predValue: { fontSize: 12, fontWeight: 'bold', color: '#0F2C4A' },
  actionButton: { backgroundColor: '#0F2C4A', paddingVertical: 10, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  actionButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  menuContainer: { width: '70%', backgroundColor: 'white', height: '100%', justifyContent: 'space-between' },
  menuHeader: { backgroundColor: '#0F2C4A', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  menuItems: { padding: 20, flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, gap: 15 },
  menuText: { fontSize: 16, color: '#0F2C4A', fontWeight: '500' },
  menuFooter: { padding: 20, borderTopWidth: 1, borderTopColor: '#F0F0F0', marginBottom: 20 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: '#E74C3C', borderRadius: 8, gap: 10 },
  logoutText: { color: '#E74C3C', fontSize: 16, fontWeight: '600' },
});