import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "@/hooks/use-translation";
import { useGetCurrentUserQuery, useGetMyWishlistQuery } from "@/store/api";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const { data: wishlist, isLoading: wishlistLoading } = useGetMyWishlistQuery();

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ThemedView style={styles.centerContainer}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme ?? "light"].tint}
          />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText>No user data available</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ThemedView style={styles.headerBar}>
        <ThemedText type="title">{t("profile.title")}</ThemedText>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.settingsButton}
        >
          <IconSymbol
            size={24}
            name="gearshape.fill"
            color={Colors[colorScheme ?? "light"].text}
          />
        </TouchableOpacity>
      </ThemedView>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          {user.avatarUrl && (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.avatar}
              contentFit="cover"
            />
          )}
          <ThemedText type="title" style={styles.displayName}>
            {user.displayName}
          </ThemedText>
          <ThemedText style={styles.username}>@{user.username}</ThemedText>
          {user.bio && <ThemedText style={styles.bio}>{user.bio}</ThemedText>}

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {user.followersCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Followers</ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {user.followingCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Following</ThemedText>
            </View>
            <View style={styles.stat}>
              <ThemedText type="defaultSemiBold" style={styles.statNumber}>
                {wishlist?.length || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Wishlist Items</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            My Wishlist
          </ThemedText>

          {wishlistLoading ? (
            <ActivityIndicator color={Colors[colorScheme ?? "light"].tint} />
          ) : (
            <>
              {wishlist?.map((item) => (
                <ThemedView key={item.id} style={styles.card}>
                  {item.imageUrl && (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.cardImage}
                      contentFit="cover"
                    />
                  )}
                  <View style={styles.cardContent}>
                    <ThemedText type="subtitle" style={styles.cardItemName}>
                      {item.name}
                    </ThemedText>

                    {item.description && (
                      <ThemedText style={styles.description}>
                        {item.description}
                      </ThemedText>
                    )}

                    {item.price && (
                      <ThemedText type="defaultSemiBold" style={styles.cardPrice}>
                        {item.currency || "USD"} ${Number(item.price).toFixed(2)}
                      </ThemedText>
                    )}

                    {item.isReserved && (
                      <ThemedView style={styles.reservedBadgeContainer}>
                        <ThemedText style={styles.reservedBadge}>
                          Reserved
                        </ThemedText>
                      </ThemedView>
                    )}
                  </View>
                </ThemedView>
              ))}

              {wishlist?.length === 0 && (
                <ThemedView style={styles.emptyState}>
                  <ThemedText style={styles.emptyText}>
                    No items in your wishlist yet. Tap the + button to add
                    items!
                  </ThemedText>
                </ThemedView>
              )}
            </>
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
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingsButton: {
    padding: 4,
  },
  header: {
    padding: 20,
    paddingTop: 0,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  displayName: {
    fontSize: 24,
  },
  username: {
    fontSize: 16,
    opacity: 0.7,
  },
  bio: {
    textAlign: "center",
    marginTop: 8,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 32,
    marginTop: 20,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 200,
  },
  cardContent: {
    padding: 16,
    gap: 8,
  },
  cardItemName: {
    marginBottom: 4,
  },
  description: {
    opacity: 0.8,
  },
  cardPrice: {
    fontSize: 18,
    marginTop: 4,
  },
  reservedBadgeContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  reservedBadge: {
    fontSize: 12,
    opacity: 0.8,
    fontStyle: "italic",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
});
