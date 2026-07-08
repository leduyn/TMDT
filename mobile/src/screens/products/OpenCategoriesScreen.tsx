import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registerApi } from '../../api/auth';
import { agencyApi } from '../../api/agency';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../../theme';
import type { CategoryDTO } from '../../types';
import { CategoryItem } from '../../components/CategoryItem';

export function OpenCategoriesScreen({ navigation }: any) {
  const { agencyId } = useAuth();
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [openedIds, setOpenedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [level, opened] = await Promise.all([
        registerApi.getCategoryLevel().catch(() => 0),
        agencyId ? agencyApi.getOpenedCategories(agencyId).catch(() => []) : [],
      ]);
      const cats = await registerApi.getCategoriesByLevel(level ?? 0);
      setCategories(cats || []);
      setOpenedIds(opened);
    } catch (err) {
      console.log('Error loading open categories data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (catId: number) => {
    setOpenedIds(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const handleSave = async () => {
    if (!agencyId) return;
    setSaving(true);
    try {
      await agencyApi.saveOpenedCategories(agencyId, openedIds);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: CategoryDTO }) => {
    const isOpened = openedIds.includes(item.id);
    return (
      <View style={styles.gridItem}>
        <View style={[styles.itemWrapper, isOpened && styles.itemWrapperOpened]}>
          <CategoryItem
            name={item.name}
            imageUrl={item.imageUrl}
            isActive={isOpened}
            onPress={() => toggleCategory(item.id)}
          />
          {isOpened && (
            <View style={styles.checkmarkBadge}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="layers-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.emptyText}>Không có danh mục</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mở thêm danh mục</Text>
        <Text style={styles.subtitle}>
          Chọn danh mục bạn muốn xem sản phẩm ({openedIds.length}/{categories.length})
        </Text>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => String(item.id)}
        numColumns={4}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    fontWeight: FontWeight.semibold,
    marginTop: Spacing.md,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  grid: {
    padding: Spacing.sm,
  },
  gridRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gridItem: {
    flex: 1,
    maxWidth: '25%',
  },
  itemWrapper: {
    position: 'relative',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  itemWrapperOpened: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
});
