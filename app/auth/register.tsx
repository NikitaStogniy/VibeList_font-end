import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppleButton } from '@invertase/react-native-apple-authentication';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRegisterMutation } from '@/store/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';
import { useAppleAuth } from '@/hooks/use-apple-auth';
import { useGoogleAuth } from '@/hooks/use-google-auth';
import { Colors } from '@/constants/theme';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const [register, { isLoading }] = useRegisterMutation();
  const { signInWithApple, isLoading: isAppleLoading, error: appleError, isSupported: isAppleSupported } = useAppleAuth();
  const { signInWithGoogle, isLoading: isGoogleLoading, error: googleError, isConfigured: isGoogleConfigured } = useGoogleAuth();

  const validateUsername = (username: string): boolean => {
    if (!username) {
      setUsernameError(t('auth.usernameRequired'));
      return false;
    }
    if (username.length < 3) {
      setUsernameError(t('auth.usernameTooShort'));
      return false;
    }
    if (username.length > 20) {
      setUsernameError(t('auth.usernameTooLong'));
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError(t('auth.usernameInvalid'));
      return false;
    }
    setUsernameError('');
    return true;
  };

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError(t('auth.emailRequired'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(t('auth.emailInvalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateDisplayName = (name: string): boolean => {
    if (!name) {
      setDisplayNameError(t('auth.displayNameRequired'));
      return false;
    }
    if (name.length < 2) {
      setDisplayNameError(t('auth.displayNameTooShort'));
      return false;
    }
    setDisplayNameError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      return false;
    }
    if (password.length < 8) {
      setPasswordError(t('auth.passwordMinLength'));
      return false;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setPasswordError(t('auth.passwordLowercase'));
      return false;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setPasswordError(t('auth.passwordUppercase'));
      return false;
    }
    if (!/(?=.*\d)/.test(password)) {
      setPasswordError(t('auth.passwordDigit'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirm: string): boolean => {
    if (!confirm) {
      setConfirmPasswordError(t('auth.confirmPasswordRequired'));
      return false;
    }
    if (confirm !== password) {
      setConfirmPasswordError(t('auth.passwordsDoNotMatch'));
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = async () => {
    const isUsernameValid = validateUsername(username);
    const isEmailValid = validateEmail(email);
    const isDisplayNameValid = validateDisplayName(displayName);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (
      !isUsernameValid ||
      !isEmailValid ||
      !isDisplayNameValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid
    ) {
      return;
    }

    // Clear previous server error
    setServerError('');

    try {
      await register({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        password,
      }).unwrap();
      // Navigation will be handled automatically by the auth state change
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage =
        error?.data?.message || error?.message || t('auth.registerFailed');
      setServerError(errorMessage);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            <ThemedView style={styles.header}>
              <ThemedText type="title" style={styles.title}>
                {t('auth.createAccount')}
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {t('auth.registerSubtitle')}
              </ThemedText>
            </ThemedView>

            {(isAppleSupported || isGoogleConfigured) && (
              <ThemedView style={styles.socialAuthContainer}>
                {isAppleSupported && (
                  <>
                    <AppleButton
                      buttonStyle={colorScheme === 'dark' ? AppleButton.Style.WHITE : AppleButton.Style.BLACK}
                      buttonType={AppleButton.Type.SIGN_UP}
                      style={styles.appleButton}
                      onPress={signInWithApple}
                      cornerRadius={12}
                    />
                    {appleError && (
                      <ThemedView style={styles.serverErrorContainer}>
                        <ThemedText style={styles.serverErrorText}>{appleError}</ThemedText>
                      </ThemedView>
                    )}
                  </>
                )}
                {isGoogleConfigured && (
                  <>
                    <GoogleSigninButton
                      size={GoogleSigninButton.Size.Wide}
                      color={colorScheme === 'dark' ? GoogleSigninButton.Color.Light : GoogleSigninButton.Color.Dark}
                      onPress={signInWithGoogle}
                      disabled={isGoogleLoading || isAppleLoading || isLoading}
                      style={styles.googleButton}
                    />
                    {googleError && (
                      <ThemedView style={styles.serverErrorContainer}>
                        <ThemedText style={styles.serverErrorText}>{googleError}</ThemedText>
                      </ThemedView>
                    )}
                  </>
                )}
                <ThemedView style={styles.divider}>
                  <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }]} />
                  <ThemedText style={styles.dividerText}>or</ThemedText>
                  <View style={[styles.dividerLine, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }]} />
                </ThemedView>
              </ThemedView>
            )}

            <ThemedView style={styles.form}>
              <ThemedView style={styles.inputContainer}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  {t('auth.username')}
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].background,
                      borderColor: usernameError
                        ? '#ff3b30'
                        : Colors[colorScheme ?? 'light'].tabIconDefault,
                      color: Colors[colorScheme ?? 'light'].text,
                    },
                  ]}
                  placeholder={t('auth.usernamePlaceholder')}
                  placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (usernameError) validateUsername(text);
                    if (serverError) setServerError('');
                  }}
                  onBlur={() => validateUsername(username)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="username"
                  autoComplete="username"
                  editable={!isLoading && !isAppleLoading && !isGoogleLoading}
                />
                {usernameError ? (
                  <ThemedText style={styles.errorText}>{usernameError}</ThemedText>
                ) : null}
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  {t('auth.displayName')}
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].background,
                      borderColor: displayNameError
                        ? '#ff3b30'
                        : Colors[colorScheme ?? 'light'].tabIconDefault,
                      color: Colors[colorScheme ?? 'light'].text,
                    },
                  ]}
                  placeholder={t('auth.displayNamePlaceholder')}
                  placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  value={displayName}
                  onChangeText={(text) => {
                    setDisplayName(text);
                    if (displayNameError) validateDisplayName(text);
                    if (serverError) setServerError('');
                  }}
                  onBlur={() => validateDisplayName(displayName)}
                  autoCorrect={false}
                  textContentType="name"
                  autoComplete="name"
                  editable={!isLoading && !isAppleLoading && !isGoogleLoading}
                />
                {displayNameError ? (
                  <ThemedText style={styles.errorText}>{displayNameError}</ThemedText>
                ) : null}
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  {t('auth.email')}
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].background,
                      borderColor: emailError
                        ? '#ff3b30'
                        : Colors[colorScheme ?? 'light'].tabIconDefault,
                      color: Colors[colorScheme ?? 'light'].text,
                    },
                  ]}
                  placeholder={t('auth.emailPlaceholder')}
                  placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) validateEmail(text);
                    if (serverError) setServerError('');
                  }}
                  onBlur={() => validateEmail(email)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  editable={!isLoading && !isAppleLoading && !isGoogleLoading}
                />
                {emailError ? (
                  <ThemedText style={styles.errorText}>{emailError}</ThemedText>
                ) : null}
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  {t('auth.password')}
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].background,
                      borderColor: passwordError
                        ? '#ff3b30'
                        : Colors[colorScheme ?? 'light'].tabIconDefault,
                      color: Colors[colorScheme ?? 'light'].text,
                    },
                  ]}
                  placeholder={t('auth.passwordPlaceholder')}
                  placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) validatePassword(text);
                    if (confirmPassword && confirmPasswordError) {
                      validateConfirmPassword(confirmPassword);
                    }
                    if (serverError) setServerError('');
                  }}
                  onBlur={() => validatePassword(password)}
                  secureTextEntry
                  textContentType="none"
                  autoComplete="off"
                  editable={!isLoading && !isAppleLoading && !isGoogleLoading}
                />
                {passwordError ? (
                  <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
                ) : null}
              </ThemedView>

              <ThemedView style={styles.inputContainer}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  {t('auth.confirmPassword')}
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: Colors[colorScheme ?? 'light'].background,
                      borderColor: confirmPasswordError
                        ? '#ff3b30'
                        : Colors[colorScheme ?? 'light'].tabIconDefault,
                      color: Colors[colorScheme ?? 'light'].text,
                    },
                  ]}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) validateConfirmPassword(text);
                    if (serverError) setServerError('');
                  }}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                  secureTextEntry
                  textContentType="none"
                  autoComplete="off"
                  editable={!isLoading && !isAppleLoading && !isGoogleLoading}
                />
                {confirmPasswordError ? (
                  <ThemedText style={styles.errorText}>
                    {confirmPasswordError}
                  </ThemedText>
                ) : null}
              </ThemedView>

              {serverError ? (
                <ThemedView style={styles.serverErrorContainer}>
                  <ThemedText style={styles.serverErrorText}>{serverError}</ThemedText>
                </ThemedView>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { backgroundColor: Colors[colorScheme ?? 'light'].tint },
                  (isLoading || isAppleLoading || isGoogleLoading) && styles.buttonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isLoading || isAppleLoading || isGoogleLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText style={styles.registerButtonText}>
                    {t('auth.register')}
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.footer}>
              <ThemedText style={styles.footerText}>
                {t('auth.haveAccount')}
              </ThemedText>
              <TouchableOpacity onPress={navigateToLogin} disabled={isLoading || isAppleLoading}>
                <ThemedText
                  style={[
                    styles.linkText,
                    { color: Colors[colorScheme ?? 'light'].tint },
                  ]}
                >
                  {t('auth.login')}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    gap: 8,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginTop: 4,
  },
  serverErrorContainer: {
    backgroundColor: '#ff3b3015',
    borderWidth: 1,
    borderColor: '#ff3b30',
    borderRadius: 8,
    padding: 12,
  },
  serverErrorText: {
    fontSize: 14,
    color: '#ff3b30',
    textAlign: 'center',
  },
  registerButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  socialAuthContainer: {
    gap: 16,
    marginBottom: 20,
  },
  appleButton: {
    width: '100%',
    height: 50,
  },
  googleButton: {
    width: '100%',
    height: 50,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    fontSize: 14,
    opacity: 0.6,
  },
});
