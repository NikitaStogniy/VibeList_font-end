import { useTranslation } from "@/hooks/use-translation";
import { useFollowUserMutation, useUnfollowUserMutation } from "@/store/api";
import { User } from "@/types/api";
import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";

interface FollowButtonProps {
  user: User;
  isFollowing: boolean;
}

const FollowButton: React.FC<FollowButtonProps> = ({ user, isFollowing }) => {
  const { t } = useTranslation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const onPress = () => {
    if (isFollowing) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  };
  return (
    <Pressable
      onPress={onPress}
      style={[isFollowing ? styles.button : styles.border, styles.button]}
    >
      <ThemedText>
        {isFollowing ? t("common.following") : t("common.follow")}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  border: {
    borderWidth: 1,
    borderColor: "black",
  },
});

export default FollowButton;
