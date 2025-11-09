import { StyleSheet, TextInput, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { UserCard } from "@/components/user-card";
import { useTranslation } from "@/hooks/use-translation";
import { useState, useCallback, useEffect, memo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSearchUsersQuery, useFollowUserMutation, useUnfollowUserMutation, useIsFollowingQuery } from "@/store/api";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { User } from "@/types/api";
import { router } from "expo-router";

// User card wrapper with follow state
const UserCardWithFollowState = memo(function UserCardWithFollowState({
  user,
  onPress,
}: {
  user: User;
  onPress: (user: User) => void;
}) {
  const { data: isFollowing = false } = useIsFollowingQuery(user.id);
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const handleFollowPress = useCallback(async (u: User) => {
    try {
      if (isFollowing) {
        await unfollowUser(u.id).unwrap();
      } else {
        await followUser(u.id).unwrap();
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  }, [isFollowing, followUser, unfollowUser]);

  return (
    <UserCard
      user={user}
      onPress={onPress}
      showFollowButton={true}
      isFollowing={isFollowing}
      onFollowPress={handleFollowPress}
    />
  );
});

export default function TabTwoScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const iconColor = useThemeColor({}, "icon");
  const textColor = useThemeColor({}, "text");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users based on search query
  const { data, isLoading, isFetching } = useSearchUsersQuery(
    { query: debouncedQuery, limit: 50 },
    { skip: debouncedQuery.length === 0 }
  );

  // Handle user card press
  const handleUserPress = useCallback((user: User) => {
    router.push(`/user/${user.id}`);
  }, []);

  // Render individual user card with follow state
  const renderUser = useCallback(
    ({ item }: { item: User }) => {
      return (
        <UserCardWithFollowState
          user={item}
          onPress={handleUserPress}
        />
      );
    },
    [handleUserPress]
  );

  // Extract key for each user
  const keyExtractor = useCallback((user: User) => user.id, []);

  // Empty state
  const renderEmptyComponent = useCallback(() => {
    if (isLoading || isFetching) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            {t("explore.searching")}
          </ThemedText>
        </View>
      );
    }

    if (debouncedQuery.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>
            {t("explore.searchPrompt")}
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          {t("explore.noResults")}
        </ThemedText>
      </View>
    );
  }, [isLoading, isFetching, debouncedQuery, t]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">{t("explore.title")}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={[styles.input, { borderColor: iconColor, color: textColor }]}
          placeholder={t("explore.searchPlaceholder")}
          placeholderTextColor={iconColor}
          onChangeText={setSearchQuery}
          value={searchQuery}
        />
      </ThemedView>
      <FlashList
        data={data?.users || []}
        renderItem={renderUser}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  listContent: {
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
  },
});
