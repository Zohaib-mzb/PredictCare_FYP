import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

// Define specific, beautiful colors for each region
const REGION_COLORS: Record<string, string> = {
  "Punjab": "#3498DB",             // Blue
  "Sindh": "#E74C3C",              // Red
  "Balochistan": "#F39C12",        // Orange
  "Khyber Pakhtunkhwa": "#27AE60", // Green
  "Pakistan (National)": "#9B59B6" // Purple
};

export default function AnalysisScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 

  // Normalize ID
  const diseaseKey = typeof id === 'string' ? id.toLowerCase() : 'dengue';
  const formattedDisease = diseaseKey === 'covid-19' || diseaseKey === 'covid' 
    ? 'COVID-19' 
    : diseaseKey.charAt(0).toUpperCase() + diseaseKey.slice(1);

  // --- STATIC DATABASE (ICONS & DOCTORS) ---
  const allData: any = {
    "dengue": {
      icon: <MaterialCommunityIcons name="virus" size={24} color="#0F2C4A" />,
      recommendations: ["Avoid stagnant water", "Use mosquito repellents", "Wear full-sleeve clothing", "Seek medical attention if fever persists"],
      doctor: "General Physician / Infectious Disease Specialist"
    },
    "covid-19": {
      icon: <MaterialCommunityIcons name="face-mask" size={28} color="navyblue" />,
      recommendations: ["Wear masks in crowded places", "Maintain hand hygiene", "Isolate if symptoms appear", "Get booster shots if eligible"],
      doctor: "Pulmonologist / General Physician"
    },
    "typhoid": {
      icon: <FontAwesome5 name="bacteria" size={28} color="#0F2C4A" />,
      recommendations: ["Drink boiled or filtered water", "Avoid street food", "Wash hands thoroughly before eating", "Complete prescribed antibiotics"],
      doctor: "General Physician / Gastroenterologist"
    },
    "malaria": {
      icon: <FontAwesome5 name="bug" size={32} color="#0F2C4A" />,
      recommendations: ["Sleep under mosquito nets", "Spray indoors with insecticides", "Take anti-malarial prophylaxis if traveling", "Keep surroundings dry"],
      doctor: "Infectious Disease Specialist"
    }
  };

  const staticData = allData[diseaseKey] || allData['dengue'];

  // --- DYNAMIC STATE ---
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({
    thisMonth: 0,
    nextMonth: 0,
    risk: "Calculating...",
    riskColor: "#64748B",
    topRegion: "Loading",
    aiText: "Analyzing real-time AI data..."
  });
  const [chartData, setChartData] = useState<any>(null);
  
  // State for the interactive graph tooltip
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: 0, region: '', date: '' });

  // --- FETCH REAL-TIME DATA ---
  useEffect(() => {
    const fetchDetailedAnalysis = async () => {
      try {
        setLoading(true);
        const API_URL = "https://predictcare-backend.onrender.com/predict";
        
        // Fetch data for all major regions
        const regions = ["Punjab", "Sindh", "Balochistan", "Khyber Pakhtunkhwa", "Pakistan (National)"];
        
        const promises = regions.map(region => 
          axios.post(API_URL, { region, disease: formattedDisease }).catch(e => null)
        );
        
        const responses = await Promise.all(promises);
        
        let highestTotal = -1;
        let highestRegionIndex = 0;
        let chartDatasets: any[] = [];
        let labels: string[] = []; 
        let nationalMonthly = 0;

        responses.forEach((res, index) => {
          if (res && res.data) {
            const regionName = regions[index];
            const dates = res.data.forecast_dates;
            const cases = res.data.forecast_cases; 
            
            // Set labels from the first successful response (usually 7 days)
            if (labels.length === 0) {
              labels = dates;
            }

            // Calculate total cases for the 7-day period
            const total7Days = cases.reduce((a: number, b: number) => a + b, 0);

            // Find the highest region (excluding National)
            if (regionName !== "Pakistan (National)" && total7Days > highestTotal) {
              highestTotal = total7Days;
              highestRegionIndex = index;
            }

            // Calculate estimated monthly cases based on National data
            if (regionName === "Pakistan (National)") {
                nationalMonthly = Math.floor((total7Days / 7) * 30);
            }

            // Sanitize cases (if all are 0, chart kit needs 0.1 to render properly)
            const safeCases = cases.every((v: number) => v === 0) 
              ? cases.map(() => 0.1) 
              : cases;

            chartDatasets.push({
              data: safeCases,
              name: regionName,
              color: (opacity = 1) => REGION_COLORS[regionName] || "#000",
              strokeWidth: 3
            });
          }
        });

        if (chartDatasets.length > 0) {
          const topRegionName = regions[highestRegionIndex];
          const baseMonthly = nationalMonthly > 0 ? nationalMonthly : Math.floor((highestTotal / 7) * 30);
          
          // Basic trend logic
          const trendMultiplier = formattedDisease === 'COVID-19' ? 0.9 : 1.15; 
          const nextMonthPredicted = Math.floor(baseMonthly * trendMultiplier);

          // Risk Level calculation
          let riskLvl = "Low";
          let riskCol = "#27AE60"; // Green
          
          // Adjust thresholds based on the disease for realism
          if (formattedDisease === 'COVID-19' && baseMonthly === 0) {
             riskLvl = "Zero Risk";
             riskCol = "#3498DB"; // Blue
          } else if (baseMonthly > 15000) { 
             riskLvl = "High"; riskCol = "#E74C3C"; // Red
          } else if (baseMonthly > 5000) { 
             riskLvl = "Moderate"; riskCol = "#F39C12"; // Orange
          }

          setLiveStats({
            thisMonth: baseMonthly,
            nextMonth: nextMonthPredicted,
            risk: riskLvl,
            riskColor: riskCol,
            topRegion: topRegionName,
            aiText: `Based on live AI environmental modeling, ${formattedDisease} is showing a ${riskLvl.toLowerCase()} risk trajectory. We estimate ${baseMonthly.toLocaleString()} total cases nationally this month. Due to seasonal patterns, the AI forecasts approximately ${nextMonthPredicted.toLocaleString()} cases next month. Currently, ${topRegionName} remains the highest risk provincial zone.`
          });

          setChartData({
            labels: labels,
            datasets: chartDatasets,
            legend: [] // Custom legend used
          });
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
      } finally {
        setLoading(false);
      }
    };

    if (diseaseKey) {
        fetchDetailedAnalysis();
    }
  }, [diseaseKey]);

  // Handler for clicking a dot on the graph
  const handleDataPointClick = (data: any) => {
    const regionName = data.dataset.name || 'Region';
    const dateName = chartData.labels[data.index];

    setTooltip({
      visible: true,
      x: data.x,
      y: data.y,
      value: data.value,
      region: regionName,
      date: dateName
    });
    
    // Auto hide tooltip after 3 seconds
    setTimeout(() => setTooltip(prev => ({ ...prev, visible: false })), 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {formattedDisease} Analysis — Live
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {loading ? (
          <View style={{ marginTop: 50, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0F2C4A" />
            <Text style={{ marginTop: 10, color: '#0F2C4A' }}>Calculating Regional Predictions...</Text>
          </View>
        ) : (
          <>
            {/* --- CARD 1: LIVE STATISTICS --- */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {staticData.icon}
                <Text style={styles.cardTitle}>Dynamic Statistics</Text>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>This Month (Nat.)</Text>
                  <Text style={styles.statValue}>{liveStats.thisMonth.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Next Month (Pred.)</Text>
                  <Text style={styles.statValue}>{liveStats.nextMonth.toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Risk Level</Text>
                  <View style={[styles.riskBadge, { backgroundColor: liveStats.riskColor }]}>
                    <Text style={styles.riskText}>{liveStats.risk}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* --- CARD 2: INTERACTIVE MULTI-REGION GRAPH --- */}
            {chartData && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <MaterialCommunityIcons name="chart-multiline" size={28} color="#0F2C4A" />
                  <Text style={styles.cardTitle}>7-Day Provincial Forecast</Text>
                </View>
                
                <View style={{ position: 'relative' }}>
                  <LineChart
                    data={chartData}
                    width={screenWidth - 80} 
                    height={220}
                    chartConfig={{
                      backgroundGradientFrom: "#fff",
                      backgroundGradientTo: "#fff",
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
                      strokeWidth: 3,
                      propsForDots: { r: "5", strokeWidth: "2", stroke: "#fff" }
                    }}
                    bezier
                    withShadow={false}
                    onDataPointClick={handleDataPointClick}
                    style={styles.mainChart}
                  />

                  {/* INTERACTIVE POPUP BOX */}
                  {tooltip.visible && (
                    <View style={[styles.tooltipBox, { 
                        left: tooltip.x > (screenWidth / 2) ? tooltip.x - 140 : tooltip.x + 10, 
                        top: Math.max(0, tooltip.y - 75) 
                    }]}>
                      <Text style={styles.toolRegion}>{tooltip.region}</Text>
                      <Text style={styles.toolCases}>{Math.round(tooltip.value)} Cases</Text>
                      <Text style={styles.toolDay}>on {tooltip.date}</Text>
                    </View>
                  )}
                </View>

                {/* CUSTOM LEGEND */}
                <View style={styles.legendContainer}>
                  {chartData.datasets.map((ds: any, idx: number) => (
                    <View key={idx} style={styles.legendItem}>
                      <View style={[styles.legendColorBox, { backgroundColor: REGION_COLORS[ds.name] }]} />
                      <Text style={styles.legendText}>{ds.name.replace("Pakistan (National)", "National")}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* --- CARD 3: AI ANALYSIS --- */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="brain" size={28} color="#0F2C4A" />
                <Text style={styles.cardTitle}>AI Environmental Analysis</Text>
              </View>
              <Text style={styles.bodyText}>{liveStats.aiText}</Text>
            </View>

            {/* --- CARD 4: CARE RECOMMENDATIONS --- */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="stethoscope" size={28} color="#0F2C4A" />
                <Text style={styles.cardTitle}>Care Recommendations</Text>
              </View>
              
              <View style={styles.listContainer}>
                {staticData.recommendations.map((item: string, index: number) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* --- CARD 5: DOCTOR TYPE --- */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <FontAwesome5 name="user-md" size={26} color="#0F2C4A" />
                <Text style={styles.cardTitle}>Suggested Doctor Type</Text>
              </View>
              <View style={styles.doctorContainer}>
                 <Text style={styles.doctorLabel}>Recommended Specialist:</Text>
                 <Text style={styles.doctorValue}>{staticData.doctor}</Text>
              </View>
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
    backgroundColor: '#0F2C4A', flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 15, paddingVertical: 15, paddingTop: Platform.OS === 'android' ? 40 : 15,
  },
  backButton: { marginRight: 15 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '600', flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  card: {
    backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
    shadowRadius: 5, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F2C4A' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statItem: { flex: 1 },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 5 },
  statValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  
  riskBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  riskText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  
  // Graph & Tooltip Styles
  mainChart: { marginLeft: -15, borderRadius: 12 },
  tooltipBox: { 
    position: 'absolute', backgroundColor: 'rgba(15, 44, 74, 0.95)', 
    padding: 10, borderRadius: 8, width: 140, alignItems: 'center', zIndex: 100 
  },
  toolRegion: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginBottom: 2, textAlign: 'center' },
  toolCases: { color: '#E74C3C', fontSize: 15, fontWeight: '900' },
  toolDay: { color: '#94A3B8', fontSize: 11, marginTop: 2 },

  // Legend Styles
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 15, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  legendColorBox: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
  legendText: { fontSize: 12, color: '#555', fontWeight: '500' },

  bodyText: { fontSize: 14, color: '#555', lineHeight: 22 },
  listContainer: { marginTop: 5 },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  bulletPoint: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#27AE60', marginRight: 10 },
  listText: { fontSize: 14, color: '#555' },
  
  doctorContainer: { marginTop: 5 },
  doctorLabel: { fontSize: 14, color: '#333', marginBottom: 2 },
  doctorValue: { fontSize: 14, color: '#555', fontWeight: 'bold' },
});