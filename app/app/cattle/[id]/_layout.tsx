import React, { createContext, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter, usePathname, Slot } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useCattleDetail } from '@/hooks/use-cattle';

// Context allows child tabs to switch tab programmatically (e.g. "Ask AI" from vitals)
type DetailTabContextType = {
  switchToAgent: () => void;
};

export const DetailTabContext = createContext<DetailTabContextType>({
  switchToAgent: () => {},
});

export function useDetailTab() {
  return useContext(DetailTabContext);
}

const BREED_LABELS: Record<string, string> = {
  zebu: 'Zebu',
  crossBreed: 'Cross Breed',
  murrah: 'Murrah',
};

export default function CattleDetailLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const { cattle, isLoading, deleteCattle } = useCattleDetail(id);

  // Determine active tab from current path
  const isAgentTab = pathname.endsWith('/agent');

  function handleDelete() {
    Alert.alert(
      'Delete Cattle',
      `Are you sure you want to remove ${cattle?.name ?? 'this cattle'} from your herd?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCattle();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  }

  function navigateVitals() {
    router.push(`/cattle/${id}/vitals` as any);
  }

  function navigateAgent() {
    router.push(`/cattle/${id}/agent` as any);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading cattle details...</Text>
      </SafeAreaView>
    );
  }

  if (!cattle) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
        <Text style={styles.loadingText}>Cattle not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <DetailTabContext.Provider value={{ switchToAgent: navigateAgent }}>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <SafeAreaView style={styles.container}>
      <View style={styles.statusBarSeparator} />
        {/* Top navigation bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navBackBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>{cattle.name}</Text>
            <Text style={styles.navSubtitle}>
              {BREED_LABELS[cattle.breed] ?? cattle.breed} · {cattle.earTag}
            </Text>
          </View>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Cattle info strip */}
        <View style={styles.infoStrip}>
          <InfoPill icon="time-outline" value={`${cattle.age}y old`} />
          <View style={styles.infoDivider} />
          <InfoPill icon="fitness-outline" value={`${cattle.weight} kg`} />
          <View style={styles.infoDivider} />
          <InfoPill icon="pricetag-outline" value={cattle.earTag} />
        </View>

        {/* Custom tab bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, !isAgentTab && styles.tabActive]}
            onPress={navigateVitals}
            activeOpacity={0.8}
          >
            <Ionicons
              name="pulse"
              size={18}
              color={!isAgentTab ? Colors.primary : Colors.gray400}
            />
            <Text style={[styles.tabText, !isAgentTab && styles.tabTextActive]}>
              Vitals
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, isAgentTab && styles.tabActive]}
            onPress={navigateAgent}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubbles"
              size={18}
              color={isAgentTab ? Colors.primary : Colors.gray400}
            />
            <Text style={[styles.tabText, isAgentTab && styles.tabTextActive]}>
              AI Agent
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab content */}
        <View style={styles.content}>
          <Slot />
        </View>
      </SafeAreaView>
    </DetailTabContext.Provider>
  );
}

function InfoPill({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={styles.infoPill}>
      <Ionicons name={icon as any} size={14} color={Colors.primaryLight} />
      <Text style={styles.infoPillText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  statusBarSeparator: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: Colors.gray50,
  },
  loadingText: { fontSize: 16, color: Colors.gray600 },
  backBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  navBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: { flex: 1 },
  navTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
  navSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryDark,
    paddingVertical: 10,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
  },
  infoPillText: { fontSize: 14, color: Colors.primaryLight, fontWeight: '500' },
  infoDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.3)' },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray400,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: { flex: 1, backgroundColor: Colors.gray50 },
});
