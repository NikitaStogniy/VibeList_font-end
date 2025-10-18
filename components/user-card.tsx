import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { User } from "@/types/api";
import React, { memo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import FollowButton from "./FollowButton";
import { ThemedText } from "./themed-text";

export type UserCardProps = {
  user: User;
  onPress?: (user: User) => void;
  showFollowButton?: boolean;
  isFollowing?: boolean;
  onFollowPress?: (user: User) => void;
};

const UserCardComponent = ({
  user,
  onPress,
  showFollowButton = false,
  isFollowing = false,
  onFollowPress,
}: UserCardProps) => {
  const iconColor = useThemeColor({}, "icon");
  const tintColor = useThemeColor({}, "tint");

  const handlePress = () => {
    if (onPress) {
      onPress(user);
    }
  };

  const handleFollowPress = () => {
    if (onFollowPress) {
      onFollowPress(user);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <ThemedView style={styles.card}>
        <View style={styles.content}>
          <View style={styles.avatarPlaceholder}>
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          </View>
          <ThemedText>{user.displayName}</ThemedText>
        </View>
        <FollowButton user={user} isFollowing={isFollowing} />
      </ThemedView>
    </Pressable>
  );
};

export const UserCard = memo(UserCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
