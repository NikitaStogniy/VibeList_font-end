import { Image } from 'expo-image';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Redirect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  useGetUserQuery,
  useGetUserWishlistQuery,
  useIsFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '@/store/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useTranslation } from '@/hooks/use-translation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function UserProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  const { data: user, isLoading: userLoading, isError: userError } = useGetUserQuery(id!, {
    skip: !id,
  });

  const { data: wishlist, isLoading: wishlistLoading } = useGetUserWishlistQuery(id!, {
    skip: !id,
  });

  const { data: isFollowing = false } = useIsFollowingQuery(id!, {
    skip: !id || id === currentUser?.id,
  });

  const [followUser, { isLoading: followLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: unfollowLoading }] = useUnfollowUserMutation();

  const isOwnProfile = currentUser?.id === id;

  const handleFollowToggle = async () => {
    if (!id) return;

    try {
      if (isFollowing) {
        await unfollowUser(id).unwrap();
      } else {
        await followUser(id).unwrap();
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>{t('common.loading')}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (userError || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>{t('profile.errorLoadingUser')}</ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => router.back()}>
            <ThemedText style={styles.buttonText}>{t('common.goBack')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <ThemedView style={styles.profileHeader}>
          {user.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]} />
          )}

          <ThemedText type="title" style={styles.displayName}>
            {user.displayName}
          </ThemedText>
          <ThemedText style={styles.username}>@{user.username}</ThemedText>

          {user.bio && (
            <ThemedText style={styles.bio}>{user.bio}</ThemedText>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {user.followersCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                {t('profile.followers')}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {user.followingCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>
                {t('profile.following')}
              </ThemedText>
            </View>
          </View>

          {/* Follow Button */}
          {!isOwnProfile && (
            <TouchableOpacity
              style={[
                styles.followButton,
                {
                  backgroundColor: isFollowing
                    ? Colors[colorScheme ?? 'light'].tabIconDefault
                    : Colors[colorScheme ?? 'light'].tint,
                },
              ]}
              onPress={handleFollowToggle}
              disabled={followLoading || unfollowLoading}>
              <ThemedText style={styles.followButtonText}>
                {isFollowing ? t('common.following') : t('common.follow')}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Wishlist Section */}
        <ThemedView style={styles.wishlistSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {t('profile.wishlist')}
          </ThemedText>

          {wishlistLoading ? (
            <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
          ) : wishlist && wishlist.length > 0 ? (
            wishlist.map((item) => (
              <ThemedView key={item.id} style={styles.itemCard}>
                {item.imageUrl && (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                    contentFit="cover"
                  />
                )}

                <View style={styles.itemContent}>
                  <ThemedText type="defaultSemiBold" style={styles.itemName}>
                    {item.name}
                  </ThemedText>

                  {item.description && (
                    <ThemedText style={styles.itemDescription}>
                      {item.description}
                    </ThemedText>
                  )}

                  {item.price != null && (
                    <ThemedText type="defaultSemiBold" style={styles.itemPrice}>
                      {item.currency || 'USD'} ${Number(item.price).toFixed(2)}
                    </ThemedText>
                  )}

                  {item.isReserved && (
                    <ThemedText style={styles.reservedLabel}>
                      {t('home.reserved')}
                    </ThemedText>
                  )}
                </View>
              </ThemedView>
            ))
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>
                {t('profile.emptyWishlist')}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#ccc',
  },
  displayName: {
    marginBottom: 4,
  },
  username: {
    opacity: 0.7,
    marginBottom: 12,
  },
  bio: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  followButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  wishlistSection: {
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  itemCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  itemImage: {
    width: '100%',
    height: 150,
  },
  itemContent: {
    padding: 12,
  },
  itemName: {
    marginBottom: 4,
  },
  itemDescription: {
    opacity: 0.8,
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    marginTop: 4,
  },
  reservedLabel: {
    marginTop: 8,
    color: '#ff6b6b',
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingText: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});
