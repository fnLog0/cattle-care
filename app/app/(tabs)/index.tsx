import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useCattle } from '@/hooks/use-cattle';
import { useAuth } from '@/hooks/use-auth';
import { CattleCard } from '@/components/cattle-card';
import { EmptyState } from '@/components/empty-state';
import { Cattle } from '@/types';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.bar} />
      <View style={skeletonStyles.content}>
        <View style={skeletonStyles.avatar} />
        <View style={skeletonStyles.lines}>
          <View style={[skeletonStyles.line, { width: '60%' }]} />
          <View style={[skeletonStyles.line, { width: '40%' }]} />
        </View>
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    height: 90,
    overflow: 'hidden',
    elevation: 2,
  },
  bar: { width: 5, backgroundColor: Colors.gray200 },
  content: {
    flex: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.gray200,
  },
  lines: { flex: 1, gap: 8 },
  line: { height: 14, borderRadius: 7, backgroundColor: Colors.gray200 },
});

export default function HerdScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cattle, isLoading, refresh, search } = useCattle();

  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      search(text);
    },
    [search]
  );

  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
    setSearchQuery('');
    search('');
  }, [search]);

  const renderItem = useCallback(
    ({ item }: { item: Cattle }) => (
      <CattleCard cattle={item} onPress={() => router.push(`/cattle/${item.id}/vitals` as any)} />
    ),
    [router]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.statusBarSeparator} />
      {/* Header */}
      <View style={styles.header}>
        {showSearch ? (
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.gray400} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              placeholder={t('herd.searchPlaceholder')}
              placeholderTextColor={Colors.gray400}
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            <TouchableOpacity onPress={handleCloseSearch} style={styles.closeSearchBtn}>
              <Ionicons name="close" size={20} color={Colors.gray600} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{t('herd.greeting')}</Text>
              <Text style={styles.userName}>{user?.fullName?.split(' ')[0] ?? t('common.farmer')}</Text>
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(true)}>
              <Ionicons name="search" size={22} color={Colors.gray800} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Cattle count */}
      {!showSearch && !isLoading && (
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {t('herd.animals', { count: cattle.length })}
          </Text>
          <View style={styles.sortBadge}>
            <Ionicons name="alert-circle" size={14} color={Colors.warning} />
            <Text style={styles.sortText}>{t('herd.sortedByRisk')}</Text>
          </View>
        </View>
      )}

      {/* List */}
      {isLoading && !refreshing ? (
        <View style={styles.skeletonList}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={cattle}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={cattle.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="paw-outline"
              title={t('herd.noCattleTitle')}
              message={
                searchQuery
                  ? t('herd.noSearchResult', { query: searchQuery })
                  : t('herd.noCattleMsg')
              }
              actionLabel={searchQuery ? undefined : t('common.addCattle')}
              onAction={searchQuery ? undefined : () => router.push('/cattle/create' as any)}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/cattle/create' as any)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  statusBarSeparator: { height: 1, backgroundColor: Colors.gray200 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    minHeight: 64,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 14, color: Colors.gray400, fontWeight: '500' },
  userName: { fontSize: 22, fontWeight: '800', color: Colors.gray800 },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.gray100,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: Colors.gray800 },
  closeSearchBtn: { padding: 4 },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  countText: { fontSize: 14, color: Colors.gray600, fontWeight: '500' },
  sortBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warning + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortText: { fontSize: 12, color: Colors.warning, fontWeight: '600' },
  skeletonList: { paddingTop: 8 },
  listContent: { paddingTop: 8, paddingBottom: 100 },
  emptyContainer: { flex: 1, marginTop: 60 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
