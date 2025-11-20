import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
// --- Import Animated components ---
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

// --- Import SVG Assets ---
import Checkmark from '../assets/images/check.svg';
import CoinIcon from '../assets/images/coin.svg';
import FertilizerIcon from '../assets/images/fertilizer.svg';
import RationIcon from '../assets/images/ration.svg';
import SeedsIcon from '../assets/images/seeds.svg';
import SproutIcon from '../assets/images/sprout.svg';

const PIXEL_FONT = 'monospace';

// --- Create Animated Components ---
const AnimatedPath = Animated.createAnimatedComponent(Path);

// --- Reward data ---
const REWARD_DATA = [
  {
    id: 1,
    icon: <RationIcon width={32} height={32} />,
    points: '1000',
    text: '3% OFF RATION',
    isUnlocked: true,
    isCurrent: false, 
    position: { top: 1020, left: '60%' },
  },
  {
    id: 2,
    icon: <SeedsIcon width={32} height={32} />,
    points: '3000',
    text: '2% DISC SEEDS',
    isUnlocked: true,
    isCurrent: false,
    position: { top: 840, left: '40%' },
  },
  {
    id: 3,
    icon: <RationIcon width={32} height={32} />,
    points: '5000',
    text: '5% OFF RATION',
    isUnlocked: true,
    isCurrent: true, 
    position: { top: 660, left: '65%' },
  },
  {
    id: 4,
    icon: <FertilizerIcon width={32} height={32} />,
    points: '6000',
    text: '6% OFF FERTILIZER',
    isUnlocked: false,
    position: { top: 480, left: '35%' },
  },
  {
    id: 5,
    icon: <SeedsIcon width={32} height={32} />,
    points: '8000',
    text: '5% DISC SEEDS',
    isUnlocked: false,
    position: { top: 300, left: '60%' },
  },
  {
    id: 6,
    icon: <RationIcon width={32} height={32} />,
    points: '10000',
    text: '10% OFF RATION',
    isUnlocked: false,
    position: { top: 120, left: '40%' },
  },
];

// --- SVG Path for the Winding Root ---
const VINE_PATH =
  'M 150 1200 ' + // Start at bottom-center
  'C 150 1150, 200 1150, 200 1100 ' + // Curve up-right to Node 1
  'S 100 1050, 100 920 ' + // Curve up-left to Node 2
  'S 200 870, 200 740 ' + // Curve up-right to Node 3
  'S 80 650, 80 560 ' + // Curve up-left to Node 4
  'S 200 450, 200 380 ' + // Curve up-right to Node 5
  'S 100 270, 100 120 ' + // Curve up-left to Node 6
  'S 150 50, 150 0'; // Straighten out at the top

// --- Path data for animations ---
const VINE_LENGTH = 1800; 
const TOTAL_Y_HEIGHT = 1200;

/**
 * Top Stat Boxes
 */
const StatBox = ({
  label,
  value,
  iconName,
}: {
  label: string;
  value: string;
  iconName: React.ComponentProps<typeof FontAwesome5>['name'];
}) => (
  <View style={styles.statBox}>
    <View style={styles.statIconContainer}>
      <FontAwesome5 name={iconName} size={18} color="#4DD0E1" />
    </View>
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

/**
 * Animated Reward Node
 */
const RewardNode = ({
  node,
  index,
}: {
  node: (typeof REWARD_DATA)[0];
  index: number;
}) => {
  const { icon, points, text, isUnlocked, isCurrent, position } = node;
  const isLeft = parseFloat(position.left) < 50;

  // --- Staggered Entrance Animation ---
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  React.useEffect(() => {
    // Animate from bottom (index 0) to top
    const animationDelay = 300 * index + 500; 
    opacity.value = withDelay(
      animationDelay,
      withTiming(1, { duration: 400 })
    );
    scale.value = withDelay(
      animationDelay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) })
    );
  }, [opacity, scale, index]);

  // --- Pulsing Current Node Animation ---
  const pulse = useSharedValue(1);
  React.useEffect(() => {
    if (isCurrent) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Loop forever
        true // Yoyo
      );
    }
  }, [isCurrent, pulse]);

  const animatedNodeStyle = useAnimatedStyle(() => {
    const currentScale = isCurrent ? pulse.value : 1;
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value * currentScale }],
      ...(isCurrent && {
        shadowColor: '#4DD0E1',
        shadowRadius: 20,
        shadowOpacity: 0.9,
        elevation: 20,
      }),
    };
  });

  const nodeContainerStyle = [
    styles.node,
    { top: position.top },
    isLeft ? styles.nodeLeft : styles.nodeRight,
    animatedNodeStyle, 
  ];

  const iconContainerStyle = [
    styles.nodeIconContainer,
    isUnlocked ? styles.nodeIconUnlocked : styles.nodeIconLocked,
    isCurrent && styles.nodeIconCurrent,
  ];

  const checkmarkStyle = [
    styles.checkmarkContainer,
    isLeft ? styles.checkmarkLeft : styles.checkmarkRight,
  ];

  return (
    <Animated.View style={nodeContainerStyle}>
      <View
        style={[
          styles.nodeContent,
          isLeft ? styles.nodeContentLeft : styles.nodeContentRight,
        ]}>
        {/* --- The Circular Icon Pod --- */}
        <View style={iconContainerStyle}>
          {!isUnlocked && (
            <View style={styles.iconOverlay}>
              <FontAwesome5
                name="lock"
                size={24}
                color="rgba(255,255,255,0.7)"
              />
            </View>
          )}
          <View style={!isUnlocked && { opacity: 0.3 }}>{icon}</View>
        </View>

        {/* --- The Text Box --- */}
        <View
          style={[
            styles.nodeTextContainer,
            isLeft
              ? styles.nodeTextContainerLeft
              : styles.nodeTextContainerRight,
          ]}>
          <Text
            style={[
              styles.nodeText,
              isLeft ? styles.nodeTextLeft : styles.nodeTextRight,
              !isUnlocked && styles.nodeTextLocked,
            ]}>
            {text}
          </Text>
          <View
            style={[
              styles.nodePointsContainer,
              isLeft && styles.nodePointsContainerLeft,
            ]}>
            <CoinIcon
              width={14}
              height={14}
              style={!isUnlocked && { opacity: 0.5 }}
            />
            <Text
              style={[styles.nodePoints, !isUnlocked && styles.nodeTextLocked]}>
              {points}
            </Text>
          </View>
        </View>

        {/* --- Unlocked Checkmark --- */}
        {isUnlocked && !isCurrent && (
          <View style={checkmarkStyle}>
            <Checkmark width={12} height={12} />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

/**
 * The main Reward Root Screen component.
 */
export default function RewardRootScreen() {
  const lessonsCompleted = REWARD_DATA.filter(r => r.isUnlocked).length;
  const rewardsCollected = REWARD_DATA.filter(r => r.isUnlocked).length;

  // --- DYNAMIC GRADIENT LOGIC ---
  // We want the vine to be GREEN only up to the highest (visually top-most) CLAIMED node.
  
  // 1. Get all unlocked nodes
  const unlockedNodes = REWARD_DATA.filter(n => n.isUnlocked);
  
  // 2. Find the smallest 'top' value among them (Smallest Y = Highest on screen)
  //    Default to TOTAL_Y_HEIGHT (bottom) if nothing is unlocked.
  let highestUnlockedY = TOTAL_Y_HEIGHT;

  if (unlockedNodes.length > 0) {
    highestUnlockedY = Math.min(...unlockedNodes.map(n => n.position.top));
  }

  // 3. Calculate the ratio of the vine that should be green
  //    If highest unlocked is at Y=600 and Total is 1200, ratio is 0.5 (50% green from bottom)
  const unlockRatio = (TOTAL_Y_HEIGHT - highestUnlockedY) / TOTAL_Y_HEIGHT;
  
  // 4. Convert to SVG Offset percentage
  //    SVG Gradients run Top (0%) to Bottom (100%).
  //    If we want the bottom 50% to be green, the transition happens at 50% (1 - 0.5).
  const UNLOCK_GRADIENT_OFFSET = `${(1 - unlockRatio) * 100}%`;

  // --- Animation for Vine Growth ---
  const animatedStrokeDashoffset = useSharedValue(VINE_LENGTH);

  React.useEffect(() => {
    // Animate the "growing" vine
    animatedStrokeDashoffset.value = withTiming(0, {
      duration: 2500, 
      easing: Easing.out(Easing.quad),
    });
  }, [animatedStrokeDashoffset]);

  const animatedVineProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedStrokeDashoffset.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* --- Radial Gradient Background (Soil) --- */}
      <View style={StyleSheet.absoluteFill}>
        <Svg height="100%" width="100%">
          <Defs>
            <LinearGradient id="soilGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0" stopColor="#151718" />
              <Stop offset="1" stopColor="#3E2723" />
            </LinearGradient>

            <LinearGradient id="vineTexture" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0" stopColor="#2E7D32" stopOpacity="1" />
              <Stop offset="0.5" stopColor="#81C784" stopOpacity="1" />
              <Stop offset="1" stopColor="#2E7D32" stopOpacity="1" />
            </LinearGradient>

            <LinearGradient id="progressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              {/* Top part (Grey) -> stops at the highest unlocked node 
                  Bottom part (Green) -> starts at the highest unlocked node
              */}
              <Stop offset="0%" stopColor="#444" />
              <Stop offset={UNLOCK_GRADIENT_OFFSET} stopColor="#444" />
              <Stop
                offset={UNLOCK_GRADIENT_OFFSET}
                stopColor="url(#vineTexture)"
              />
              <Stop offset="100%" stopColor="url(#vineTexture)" />
            </LinearGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="url(#soilGradient)"
          />
        </Svg>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* --- Top Stats --- */}
        <View style={styles.statsContainer}>
          <StatBox
            label="LESSONS COMPLETED"
            value={String(lessonsCompleted)}
            iconName="check-circle"
          />
          <StatBox
            label="REWARDS COLLECTED"
            value={String(rewardsCollected)}
            iconName="trophy"
          />
        </View>

        {/* --- Reward Root --- */}
        <Text style={styles.rewardRootTitle}>REWARD ROOT</Text>

        <View style={styles.rootContainer}>
          {/* --- The Winding Vine SVG --- */}
          <Svg style={styles.vineSvg} height={1200} width={300}>
            {/* Shadow Path */}
            <Path
              d={VINE_PATH}
              stroke="#000"
              strokeWidth={20}
              strokeOpacity={0.3}
              transform="translate(0, 5)"
            />
            {/* NEW "GLOW" PATH */}
            <AnimatedPath
              d={VINE_PATH}
              stroke="url(#progressGrad)"
              strokeWidth={24} 
              fill="none"
              strokeOpacity={0.4} 
              animatedProps={animatedVineProps}
            />

            {/* Main Vine Path (Animated) */}
            <AnimatedPath
              d={VINE_PATH}
              stroke="url(#progressGrad)"
              strokeWidth={16}
              fill="none"
              strokeDasharray={VINE_LENGTH}
              animatedProps={animatedVineProps}
            />
          </Svg>

          {/* --- The Sprout at the Bottom --- */}
          <View style={styles.sproutContainer}>
            <SproutIcon width={80} height={80} />
          </View>

          {/* --- Nodes are mapped over the SVG --- */}
          {REWARD_DATA.map((node, index) => (
            <RewardNode key={node.id} node={node} index={index} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (FIXED AND POLISHED) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', 
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 24,
  },
  // --- StatBox Styles ---
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(77, 208, 225, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(77, 208, 225, 0.3)',
  },
  statLabel: {
    color: '#AAA',
    fontFamily: PIXEL_FONT,
    fontSize: 10,
    marginBottom: 2,
  },
  statValue: {
    color: 'white',
    fontFamily: PIXEL_FONT,
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Reward Root
  rewardRootTitle: {
    color: 'white',
    fontFamily: PIXEL_FONT,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 16,
    letterSpacing: 1,
  },
  rootContainer: {
    position: 'relative',
    width: '100%',
    height: 1200, // Fixed height for the vine
    alignItems: 'center',
  },
  vineSvg: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -150 }], // Center the 300px wide SVG
  },
  sproutContainer: {
    position: 'absolute',
    bottom: -20, 
    left: '50%',
    transform: [{ translateX: -40 }],
    zIndex: 10,
    shadowColor: '#4CAF50',
    shadowRadius: 20,
    shadowOpacity: 0.7,
    elevation: 15,
  },

  // --- Reward Node Styles ---
  node: {
    position: 'absolute',
    zIndex: 20,
  },
 nodeLeft: {
    right: '50%',
    marginRight: 75,
  },
  nodeRight: {
    left: '50%',
    marginLeft: 75,
  },
  nodeCurrent: {
  },
  nodeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 190, // 60 (icon) + 10 (gap) + 120 (text)
  },
  nodeContentLeft: {
    flexDirection: 'row-reverse', // [Text] [Icon]
  },
  nodeContentRight: {
    flexDirection: 'row', // [Icon] [Text]
  },
  nodeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  nodeIconUnlocked: {
    backgroundColor: '#2C2C2E',
    borderColor: 'rgba(76, 175, 80, 0.8)',
    borderWidth: 2,
    shadowColor: '#4CAF50',
    shadowRadius: 10,
    shadowOpacity: 0.7,
  },
  nodeIconCurrent: {
    borderColor: '#4DD0E1',
    borderWidth: 2,
  },
  nodeIconLocked: {
    backgroundColor: '#333',
    borderColor: '#555',
    borderWidth: 1,
  },
  iconOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  nodeTextContainer: {
    width: 120,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
    justifyContent: 'center',
  },
  nodeTextContainerLeft: {
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingLeft: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  nodeTextContainerRight: {
    alignItems: 'flex-start',
    paddingLeft: 20,
    paddingRight: 10,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  nodeText: {
    color: 'white',
    fontFamily: PIXEL_FONT,
    fontSize: 12,
    fontWeight: 'bold',
    flexWrap: 'wrap',
  },
  nodeTextLeft: {
    textAlign: 'right',
  },
  nodeTextRight: {
    textAlign: 'left',
  },
  nodePointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  nodePointsContainerLeft: {
    justifyContent: 'flex-end',
  },
  nodePoints: {
    color: '#F1B301',
    fontFamily: PIXEL_FONT,
    fontSize: 14,
    marginHorizontal: 5,
  },
  nodeTextLocked: {
    color: '#999',
    opacity: 0.8,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -4,
    width: 24,
    height: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  checkmarkLeft: {
    right: -8,
  },
  checkmarkRight: {
    left: -8,
  },
});