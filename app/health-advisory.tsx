import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Linking, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HealthAdvisoryScreen() {
  const router = useRouter();

  // --- CURATED ARTICLES DATA (25+ ITEMS) ---
  const articles = [
    // --- INFECTIOUS DISEASES ---
    {
      id: '1',
      title: "Dengue and Severe Dengue: Key Facts",
      source: "World Health Organization (WHO)",
      category: "Dengue",
      icon: <MaterialCommunityIcons name="virus" size={24} color="#0F2C4A" />,
      color: "#E74C3C", // Red
      url: "https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue"
    },
    {
      id: '2',
      title: "COVID-19 Advice for the Public: Myth Busters",
      source: "World Health Organization (WHO)",
      category: "COVID-19",
      icon: <MaterialCommunityIcons name="face-mask" size={28} color="white" />,
      color: "#2980B9", // Blue
      url: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters"
    },
    {
      id: '3',
      title: "Influenza (Seasonal): Symptoms and Treatment",
      source: "CDC (Centers for Disease Control)",
      category: "Flu",
      icon: <FontAwesome5 name="head-side-cough" size={24} color="white" />,
      color: "#F39C12", // Orange
      url: "https://www.cdc.gov/flu/symptoms/symptoms.htm"
    },
    {
      id: '4',
      title: "Malaria: Prevention and Control",
      source: "World Health Organization (WHO)",
      category: "Malaria",
      icon: <MaterialCommunityIcons name="spider-web" size={28} color="white" />,
      color: "#8E44AD", // Purple
      url: "https://www.who.int/news-room/fact-sheets/detail/malaria"
    },
    {
      id: '5',
      title: "Typhoid Fever: Risks and Vaccination",
      source: "CDC (Centers for Disease Control)",
      category: "Typhoid",
      icon: <FontAwesome5 name="bacteria" size={24} color="white" />,
      color: "#D35400", // Dark Orange
      url: "https://www.cdc.gov/typhoid-fever/index.html"
    },

    // --- HEART & CHRONIC CONDITIONS ---
    {
      id: '6',
      title: "Cardiovascular Diseases: Keeping Your Heart Healthy",
      source: "World Health Organization (WHO)",
      category: "Heart Health",
      icon: <MaterialCommunityIcons name="heart-pulse" size={28} color="white" />,
      color: "#C0392B", // Dark Red
      url: "https://www.who.int/health-topics/cardiovascular-diseases"
    },
    {
      id: '7',
      title: "Diabetes: Symptoms, Causes, and Prevention",
      source: "Mayo Clinic",
      category: "Diabetes",
      icon: <MaterialCommunityIcons name="water-percent" size={28} color="white" />,
      color: "#3498DB", // Light Blue
      url: "https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444"
    },
    {
      id: '8',
      title: "Hypertension (High Blood Pressure) Explained",
      source: "World Health Organization (WHO)",
      category: "Blood Pressure",
      icon: <MaterialCommunityIcons name="speedometer" size={28} color="white" />,
      color: "#E67E22", // Carrot
      url: "https://www.who.int/news-room/fact-sheets/detail/hypertension"
    },
    {
      id: '9',
      title: "Asthma: Triggers and Management",
      source: "CDC (Centers for Disease Control)",
      category: "Respiratory",
      icon: <MaterialCommunityIcons name="lungs" size={28} color="white" />,
      color: "#1ABC9C", // Teal
      url: "https://www.cdc.gov/asthma/default.htm"
    },

    // --- MENTAL HEALTH ---
    {
      id: '10',
      title: "Mental Health: Strengthening Our Response",
      source: "World Health Organization (WHO)",
      category: "Mental Health",
      icon: <MaterialCommunityIcons name="brain" size={28} color="white" />,
      color: "#9B59B6", // Amethyst
      url: "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response"
    },
    {
      id: '11',
      title: "Depression: Let's Talk",
      source: "World Health Organization (WHO)",
      category: "Mental Health",
      icon: <MaterialCommunityIcons name="emoticon-sad-outline" size={28} color="white" />,
      color: "#34495E", // Dark Blue/Grey
      url: "https://www.who.int/news-room/fact-sheets/detail/depression"
    },
    {
      id: '12',
      title: "Stress Management: Tips for Coping",
      source: "Mayo Clinic",
      category: "Wellness",
      icon: <MaterialCommunityIcons name="meditation" size={28} color="white" />,
      color: "#16A085", // Green Sea
      url: "https://www.mayoclinic.org/healthy-lifestyle/stress-management/basics/stress-basics/hlv-20049495"
    },

    // --- NUTRITION & FITNESS ---
    {
      id: '13',
      title: "Healthy Diet: Key Recommendations",
      source: "World Health Organization (WHO)",
      category: "Nutrition",
      icon: <MaterialCommunityIcons name="food-apple" size={28} color="white" />,
      color: "#27AE60", // Green
      url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet"
    },
    {
      id: '14',
      title: "Physical Activity: How Much Do You Need?",
      source: "World Health Organization (WHO)",
      category: "Fitness",
      icon: <MaterialCommunityIcons name="run" size={28} color="white" />,
      color: "#2ECC71", // Light Green
      url: "https://www.who.int/news-room/fact-sheets/detail/physical-activity"
    },
    {
      id: '15',
      title: "Water: How Much Should You Drink?",
      source: "Mayo Clinic",
      category: "Hydration",
      icon: <MaterialCommunityIcons name="water" size={28} color="white" />,
      color: "#3498DB", // Blue
      url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256"
    },
    {
      id: '16',
      title: "Vitamin D: Benefits and Sources",
      source: "Harvard Health",
      category: "Nutrition",
      icon: <MaterialCommunityIcons name="white-balance-sunny" size={28} color="white" />,
      color: "#F1C40F", // Sun Yellow
      url: "https://www.hsph.harvard.edu/nutritionsource/vitamin-d/"
    },

    // --- GENERAL HEALTH & SAFETY ---
    {
      id: '17',
      title: "Hand Hygiene: Why, How & When?",
      source: "World Health Organization (WHO)",
      category: "Hygiene",
      icon: <MaterialCommunityIcons name="hand-wash" size={28} color="white" />,
      color: "#3498DB", // Blue
      url: "https://www.who.int/campaigns/world-hand-hygiene-day"
    },
    {
      id: '18',
      title: "First Aid: Basic Techniques",
      source: "Red Cross",
      category: "Safety",
      icon: <MaterialCommunityIcons name="medical-bag" size={28} color="white" />,
      color: "#C0392B", // Red
      url: "https://www.redcross.org/take-a-class/first-aid"
    },
    {
      id: '19',
      title: "Sleep: Why It's Important",
      source: "Sleep Foundation",
      category: "Wellness",
      icon: <MaterialCommunityIcons name="bed" size={28} color="white" />,
      color: "#2C3E50", // Midnight Blue
      url: "https://www.sleepfoundation.org/how-sleep-works/why-do-we-need-sleep"
    },
    {
      id: '20',
      title: "Sun Safety: Protecting Your Skin",
      source: "CDC (Centers for Disease Control)",
      category: "Skin Care",
      icon: <MaterialCommunityIcons name="umbrella-beach" size={28} color="white" />,
      color: "#E67E22", // Orange
      url: "https://www.cdc.gov/cancer/skin/basic_info/sun-safety.htm"
    },

    // --- CHILD & MATERNAL HEALTH ---
    {
      id: '21',
      title: "Breastfeeding: Benefits for Mom and Baby",
      source: "World Health Organization (WHO)",
      category: "Maternal Health",
      icon: <MaterialCommunityIcons name="baby-bottle-outline" size={28} color="white" />,
      color: "#FF69B4", // Pink
      url: "https://www.who.int/health-topics/breastfeeding"
    },
    {
      id: '22',
      title: "Childhood Immunization Schedule",
      source: "CDC (Centers for Disease Control)",
      category: "Child Health",
      icon: <MaterialCommunityIcons name="needle" size={28} color="white" />,
      color: "#9B59B6", // Purple
      url: "https://www.cdc.gov/vaccines/schedules/hcp/imz/child-adolescent.html"
    },
    
    // --- ENVIRONMENTAL HEALTH ---
    {
      id: '23',
      title: "Air Pollution and Your Health",
      source: "National Institute of Environmental Health",
      category: "Environment",
      icon: <MaterialCommunityIcons name="weather-fog" size={28} color="white" />,
      color: "#7F8C8D", // Grey
      url: "https://www.niehs.nih.gov/health/topics/agents/air-pollution/index.cfm"
    },
    {
      id: '24',
      title: "Heat Stress: Heat-Related Illness",
      source: "CDC (Centers for Disease Control)",
      category: "Environment",
      icon: <MaterialCommunityIcons name="thermometer-alert" size={28} color="white" />,
      color: "#E74C3C", // Red
      url: "https://www.cdc.gov/niosh/topics/heatstress/default.html"
    },
    {
      id: '25',
      title: "Food Safety: The Five Keys",
      source: "World Health Organization (WHO)",
      category: "Food Safety",
      icon: <MaterialCommunityIcons name="food-drumstick" size={28} color="white" />,
      color: "#D35400", // Pumpkin
      url: "https://www.who.int/news-room/fact-sheets/detail/food-safety"
    },
  ];

  // --- OPEN URL FUNCTION ---
  const handleOpenLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert(`Don't know how to open this URL: ${url}`);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Icon Box */}
      <View style={[styles.iconBox, { backgroundColor: item.color }]}>
        {item.icon}
      </View>
      
      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.category, { color: item.color }]}>{item.category}</Text>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.source}>Source: {item.source}</Text>
        
        <TouchableOpacity style={styles.readButton} onPress={() => handleOpenLink(item.url)}>
          <Text style={styles.readButtonText}>Read Article</Text>
          <Ionicons name="open-outline" size={16} color="#0F2C4A" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Advisory</Text>
      </View>

      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF4FA',
  },
  header: {
    backgroundColor: '#0F2C4A',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 40 : 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  iconBox: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  category: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2C4A',
    marginBottom: 6,
  },
  source: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#F0F4F8',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  readButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2C4A',
  },
});