import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.menu}>☰</Text>
        <Text style={styles.headerTitle}>PredictCare</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Title */}
      <Text style={styles.mainTitle}>
        Early Disease Prediction for Punjab, Pakistan
      </Text>

      {/* Cards */}
      <View style={styles.cardRow}>
        {/* Dengue */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🦟 Dengue</Text>
          <Text style={styles.cardText}>Next 30 Days (2024):</Text>
          <Text style={styles.boldText}>18,450 cases</Text>
          <Text style={styles.cardText}>Prediction (Next 30 Days):</Text>
          <Text style={styles.boldText}>Expected increase: 12%</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/dengue')}
          >
            <Text style={styles.buttonText}>View Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* COVID */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🦠 COVID-19</Text>
          <Text style={styles.cardText}>Active Cases (2024):</Text>
          <Text style={styles.boldText}>3,120 cases</Text>
          <Text style={styles.cardText}>Prediction (Current):</Text>
          <Text style={styles.boldText}>Stable trend (±3%)</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/covid')}
          >
            <Text style={styles.buttonText}>View Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardRow}>
        {/* Flu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤒 Seasonal Flu</Text>
          <Text style={styles.cardText}>Reported Cases (2024):</Text>
          <Text style={styles.boldText}>41,900 cases</Text>
          <Text style={styles.cardText}>Prediction (Next 30 Days):</Text>
          <Text style={styles.boldText}>High risk in urban areas</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/flu')}
          >
            <Text style={styles.buttonText}>View Analysis</Text>
          </TouchableOpacity>
        </View>

        {/* Viral Fever */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧬 Viral Fever</Text>
          <Text style={styles.cardText}>Estimated Cases (2024):</Text>
          <Text style={styles.boldText}>26,700 cases</Text>
          <Text style={styles.cardText}>Prediction (Next 30 Days):</Text>
          <Text style={styles.boldText}>Moderate spread expected</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/viral')}
          >
            <Text style={styles.buttonText}>View Analysis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F1FA',
  },
  header: {
    backgroundColor: '#0A2540',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  menu: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A2540',
    marginVertical: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  card: {
    width: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0A2540',
  },
  cardText: {
    color: '#555',
    fontSize: 13,
  },
  boldText: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#0A2540',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
