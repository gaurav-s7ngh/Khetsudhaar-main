import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- Import Supabase Client ---
import { supabase } from '@/utils/supabase';

// --- Import SVG Assets ---
import Banana from '../assets/images/Banana.svg';
import Coin from '../assets/images/coin.svg';
import FarmIcon from '../assets/images/farm.svg';
import LeafIcon from '../assets/images/leafIcon.svg';
import SusScore from '../assets/images/SusScore.svg';
import UserImage from '../assets/images/UserImage.svg';

// InfoBox helper
const InfoBox = ({ label, value, icon }: { label: string, value: string, icon?: string }) => (
  <View style={styles.infoBoxContainer}>
    <Text style={styles.infoBoxLabel}>{label}</Text>
    <View style={styles.infoBox}>
      {icon === 'farm' && <FarmIcon width={24} height={24} style={styles.infoBoxIcon} />}
      <Text style={styles.infoBoxValue}>{value}</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Fetch profile data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const getProfile = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            // If no session (Guest), we can't show a profile
            setLoading(false);
            return;
          }

          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
            setProfile(data);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

      getProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          // The _layout.tsx Auth Guard will automatically redirect to Login
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#388e3c" />
      </View>
    );
  }

  // Guest View (If for some reason they access this page)
  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{color:'white', marginBottom: 20}}>Please Log In to view profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>GO TO LOGIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- Profile Picture --- */}
        <View style={styles.UserImageContainer}>
          <UserImage width={128} height={128} style={styles.UserImage} />
        </View>

        {/* --- Main Info Card --- */}
        <View style={styles.mainCard}>
          {/* Top Section */}
          <View style={styles.cardTopRow}>
            <View style={styles.nameSection}>
              {/* Display AgriStack ID if available, else 'ID: ...' */}
              <Text style={styles.idNumber}>{profile.agristack_id || 'ID: --'}</Text>
              <Text style={styles.name}>{profile.full_name || 'Farmer'}</Text>
            </View>
            <Banana width={64} height={64} style={styles.Banana} />
          </View>

          {/* Address Section - Hardcoded for now unless added to DB */}
          <View style={styles.addressContainer}>
            <Text style={styles.infoBoxLabel}>CONTACT</Text>
            <View style={styles.addressPill}>
              <Text style={styles.addressText}>
                {profile.mobile_no || 'No mobile number'}
              </Text>
            </View>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGridRow}>
            <InfoBox label="LAND SIZE" value={profile.land_size || 'N/A'} icon="farm" />
            <InfoBox label="STATE" value={profile.state || 'N/A'} />
          </View>
          <View style={styles.infoGridRow}>
            <InfoBox label="SEASON" value="KHARIF" />
            <InfoBox label="CROP" value="BANANA" />
          </View>

          {/* Points Section (Real Data) */}
          <View style={styles.pointsRow}>
            <View style={styles.pointsBox}>
              <Coin width={24} height={24} />
              <Text style={styles.pointsText}>{profile.coins || 0}</Text>
            </View>
            <View style={styles.pointsBox}>
              <LeafIcon width={24} height={24} />
              <Text style={styles.pointsText}>{profile.xp || 0}</Text>
            </View>
          </View>
        </View>

        {/* --- Sustainability Score --- */}
        <View style={styles.sustainabilityCard}>
          <SusScore width={80} height={80} style={styles.gaugeIcon} />
          <View>
            <Text style={styles.sustainabilityTitle}>SUSTAINABILITY SCORE</Text>
            <Text style={styles.sustainabilityValue}>{profile.sustainability_score || 'LOW'}</Text>
          </View>
        </View>

        {/* --- LOGOUT BUTTON --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome5 name="sign-out-alt" size={20} color="#FF5252" style={{marginRight: 10}} />
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
  },
  UserImageContainer: {
    alignItems: 'center',
    marginBottom: -64,
    zIndex: 1,
  },
  UserImage: {
    borderRadius: 64,
    borderWidth: 4,
    borderColor: 'white',
    overflow: 'hidden',
  },
  mainCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 24,
    padding: 24,
    paddingTop: 80,
    marginTop: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameSection: {
    flex: 1,
  },
  idNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  name: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  Banana: {
    marginLeft: 16,
  },
  addressContainer: {
    marginTop: 16,
  },
  addressPill: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  addressText: {
    color: '#C8E6C9',
    fontSize: 14,
  },
  infoGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 16,
  },
  infoBoxContainer: {
    flex: 1,
  },
  infoBoxLabel: {
    color: '#9E9E9E',
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoBox: {
    backgroundColor: '#3E3E42',
    borderRadius: 12,
    padding: 12,
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBoxIcon: {
    marginRight: 8,
  },
  infoBoxValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
  pointsBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: '#4CAF50',
    borderWidth: 1,
    borderRadius: 99,
    paddingVertical: 12,
    gap: 10,
  },
  pointsText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sustainabilityCard: {
    backgroundColor: 'rgba(192, 22, 22, 0.7)',
    borderColor: '#C01616',
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeIcon: {
    marginRight: 16,
  },
  sustainabilityTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sustainabilityValue: {
    color: '#FF5252',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  // Logout Button Styles
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  logoutButtonText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});