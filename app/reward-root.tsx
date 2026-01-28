import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/utils/supabase';

import Checkmark from '../assets/images/check.svg';
import CoinIcon from '../assets/images/coin.svg';
import FertilizerIcon from '../assets/images/fertilizer.svg';
import RationIcon from '../assets/images/ration.svg';
import SeedsIcon from '../assets/images/seeds.svg';

const PIXEL_FONT = 'monospace';
const { width, height } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

const VINE_PATH =
  'M 150 1200 ' + 
  'C 150 1120, 220 1100, 220 1020 ' + 
  'S 80 920, 80 840 ' +               
  'S 220 740, 220 660 ' +             
  'S 80 560, 80 480 ' +               
  'S 220 380, 220 300 ' +             
  'S 80 200, 80 120 ' +               
  'S 150 50, 150 0';                  

const VINE_LENGTH = 2000; 

// --- STATIC VISUAL CONFIG (Restored from original design) ---
const STATIC_NODES = [
  { id: 1, cost: 1000, title: '3% OFF RATION', icon: 'ration', top: 1020, left: '65%' },
  { id: 2, cost: 3000, title: '2% DISC SEEDS', icon: 'seeds', top: 840, left: '35%' },
  { id: 3, cost: 5000, title: '5% OFF RATION', icon: 'ration', top: 660, left: '65%' },
  { id: 4, cost: 6000, title: '6% OFF FERTILIZER', icon: 'fertilizer', top: 480, left: '35%' },
  { id: 5, cost: 8000, title: '5% DISC SEEDS', icon: 'seeds', top: 300, left: '65%' },
  { id: 6, cost: 10000, title: '10% OFF RATION', icon: 'ration', top: 120, left: '35%' },
];

const RewardNode = ({ node, index, onPress }: any) => {
  const { icon, cost, title, isUnlocked, isCurrent, top, left } = node;
  const isLeft = parseFloat(left) < 50;

  const renderIcon = () => {
    if (icon === 'seeds') return <SeedsIcon width={28} height={28} />;
    if (icon === 'fertilizer') return <FertilizerIcon width={28} height={28} />;
    return <RationIcon width={28} height={28} />;
  };

  const scale = useSharedValue(0);
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withDelay(index * 50, withSpring(1));
  }, []);

  React.useEffect(() => {
    if (isCurrent) {
      pulse.value = withRepeat(withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1, true);
    } else {
      pulse.value = withTiming(1);
    }
  }, [isCurrent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulse.value }]
  }));

  return (
    <Animated.View style={[styles.node, { top: top }, isLeft ? styles.nodeLeft : styles.nodeRight, animatedStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={[styles.nodeWrapper, isLeft ? styles.wrapperLeft : styles.wrapperRight]}>
          <View style={[styles.textTag, isLeft ? styles.textTagLeft : styles.textTagRight]}>
             <Text style={styles.nodeTitle} numberOfLines={2}>{title}</Text>
             <View style={styles.costRow}>
                <CoinIcon width={12} height={12} />
                <Text style={styles.nodeCost}>{cost}</Text>
             </View>
          </View>
          <View style={[styles.iconCircle, isUnlocked ? styles.iconCircleUnlocked : styles.iconCircleLocked]}>
            {isUnlocked ? renderIcon() : <FontAwesome5 name="lock" size={18} color="rgba(255,255,255,0.3)" />}
            {isUnlocked && <View style={styles.checkBadge}><Checkmark width={8} height={8} /></View>}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function RewardRootScreen() {
  const { t } = useTranslation();
  const [rewards, setRewards] = useState<any[]>(STATIC_NODES); // Default to static visual
  const [userPoints, setUserPoints] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeReward, setActiveReward] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const animatedStrokeDashoffset = useSharedValue(VINE_LENGTH);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) { setLoading(false); return; }
          setUserId(session.user.id);

          const { data: profile } = await supabase.from('profiles').select('coins').eq('id', session.user.id).single();
          setUserPoints(profile?.coins || 0);

          const { data: unlockedData } = await supabase.from('user_rewards').select('reward_id').eq('user_id', session.user.id);
          const unlockedIds = unlockedData?.map((r: any) => r.reward_id) || [];
          
          const maxUnlockedId = Math.max(0, ...unlockedIds);

          // Map dynamic status onto static visual nodes
          const mappedRewards = STATIC_NODES.map((node) => ({
            ...node,
            isUnlocked: unlockedIds.includes(node.id),
            isCurrent: !unlockedIds.includes(node.id) && (unlockedIds.length === 0 ? node.id === 1 : node.id === maxUnlockedId + 1)
          }));

          setRewards(mappedRewards);

          // Animate Vine based on progress
          const progressStep = 1 / (STATIC_NODES.length + 1);
          const currentProgress = unlockedIds.length * progressStep; 
          const targetOffset = VINE_LENGTH * (1 - currentProgress);
          animatedStrokeDashoffset.value = withTiming(targetOffset, { duration: 1500 });

        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false); 
        }
      };
      loadData();
    }, [])
  );

  const animatedVineProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedStrokeDashoffset.value,
  }));

  const handleNodePress = async (node: any) => {
    if (node.isUnlocked) {
      setActiveReward(node);
      setModalVisible(true);
      return;
    }
    if (!node.isCurrent) {
      Alert.alert(t('locked'), "Complete previous rewards first!"); 
      return;
    }
    if (userPoints < node.cost) {
      Alert.alert(t('available_coins'), `You need ${node.cost} coins.`); 
      return;
    }

    Alert.alert("Unlock Reward?", `Spend ${node.cost} coins?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unlock", 
        onPress: async () => {
          if (!userId) return;
          
          // Optimistic UI
          setUserPoints(prev => prev - node.cost);
          setRewards(prev => prev.map(r => 
            r.id === node.id ? { ...r, isUnlocked: true, isCurrent: false } : 
            r.id === node.id + 1 ? { ...r, isCurrent: true } : r
          ));

          setActiveReward(node);
          setModalVisible(true);

          await supabase.from('profiles').update({ coins: userPoints - node.cost }).eq('id', userId);
          await supabase.from('user_rewards').insert({ user_id: userId, reward_id: node.id });
        }
      }
    ]);
  };

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator size="large" color="#4CAF50" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0" stopColor="#1b2e15" />
              <Stop offset="1" stopColor="#0f1a0d" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#bgGrad)" />
        </Svg>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.rewardRootTitle}>{t('rewards_tree_title')}</Text>
        
        <View style={styles.rootContainer}>
          <Svg style={styles.vineSvg} height={1200} width={300}>
            <Path d={VINE_PATH} stroke="#3e2723" strokeWidth={16} fill="none" strokeLinecap="round" strokeOpacity={0.5} />
            <AnimatedPath d={VINE_PATH} stroke="#4CAF50" strokeWidth={10} fill="none" strokeLinecap="round" strokeDasharray={VINE_LENGTH} animatedProps={animatedVineProps} />
          </Svg>
          
          {rewards.map((node, index) => (
            <RewardNode key={node.id} node={node} index={index} onPress={() => handleNodePress(node)} />
          ))}
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>REWARD UNLOCKED!</Text>
            <Text style={styles.modalRewardName}>{activeReward?.title}</Text>
            <View style={styles.qrBox}>
              <QRCode value={`REWARD:${activeReward?.id}:${userId}`} size={180} />
            </View>
            <Text style={styles.scanInstruction}>{t('scan_at_store')}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1b2e15' },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 60, paddingTop: 24 },
  
  rewardRootTitle: { color: '#A5D6A7', fontFamily: PIXEL_FONT, fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, letterSpacing: 2 },
  
  rootContainer: { position: 'relative', width: '100%', height: 1200, alignItems: 'center' },
  vineSvg: { position: 'absolute', top: 0, left: '50%', transform: [{ translateX: -150 }] },
  
  node: { position: 'absolute', zIndex: 20 },
  nodeLeft: { right: '50%', marginRight: 55 },
  nodeRight: { left: '50%', marginLeft: 55 },
  
  nodeWrapper: { flexDirection: 'row', alignItems: 'center' },
  wrapperLeft: { flexDirection: 'row-reverse' },
  wrapperRight: { flexDirection: 'row' },
  
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: '#233320', borderWidth: 2, borderColor: '#3E5238', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 5 },
  iconCircleLocked: { opacity: 0.8 },
  iconCircleUnlocked: { backgroundColor: '#2E7D32', borderColor: '#4CAF50' },
  
  textTag: { backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', width: 100, justifyContent: 'center' },
  textTagLeft: { marginRight: 10, alignItems: 'flex-end' },
  textTagRight: { marginLeft: 10, alignItems: 'flex-start' },
  
  nodeTitle: { color: '#E8F5E9', fontFamily: PIXEL_FONT, fontSize: 10, marginBottom: 2, width: '100%', textAlign: 'center' },
  costRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center' },
  nodeCost: { color: '#FFD54F', fontFamily: PIXEL_FONT, fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  
  checkBadge: { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1b2e15' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)' },
  modalView: { width: '80%', backgroundColor: '#233320', borderRadius: 20, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#4CAF50' },
  modalTitle: { fontSize: 20, color: '#4CAF50', fontFamily: PIXEL_FONT, fontWeight: 'bold', marginBottom: 15 },
  modalRewardName: { fontSize: 16, color: '#FFF', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  qrBox: { padding: 15, backgroundColor: 'white', borderRadius: 12, marginBottom: 15 },
  scanInstruction: { color: '#AAA', fontSize: 12, marginBottom: 20, fontFamily: PIXEL_FONT },
  closeButton: { backgroundColor: '#2E7D32', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20 },
  closeButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14, fontFamily: PIXEL_FONT },
});