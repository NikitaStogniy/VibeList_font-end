import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLoginMutation } from '@/store/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');

  const [login, { isLoading }] = useLoginMutation();

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

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError(t('auth.passwordRequired'));
      return false;
    }
    if (password.length < 6) {
      setPasswordError(t('auth.passwordTooShort'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    // Clear previous server error
    setServerError('');

    try {
      await login({ email: email.trim().toLowerCase(), password }).unwrap();
      // Navigation will be handled automatically by the auth state change
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.data?.message || error?.message || t('auth.loginFailed');
      setServerError(errorMessage);
    }
  };

  const navigateToRegister = () => {
    router.push('/auth/register');
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
                {t('auth.welcomeBack')}
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {t('auth.loginSubtitle')}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.form}>
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
                  editable={!isLoading}
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
                    if (serverError) setServerError('');
                  }}
                  onBlur={() => validatePassword(password)}
                  secureTextEntry
                  textContentType="password"
                  autoComplete="password"
                  editable={!isLoading}
                />
                {passwordError ? (
                  <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
                ) : null}
              </ThemedView>

              {serverError ? (
                <ThemedView style={styles.serverErrorContainer}>
                  <ThemedText style={styles.serverErrorText}>{serverError}</ThemedText>
                </ThemedView>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: Colors[colorScheme ?? 'light'].tint },
                  isLoading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <ThemedText style={styles.loginButtonText}>
                    {t('auth.login')}
                  </ThemedText>
                )}
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.footer}>
              <ThemedText style={styles.footerText}>
                {t('auth.noAccount')}
              </ThemedText>
              <TouchableOpacity onPress={navigateToRegister} disabled={isLoading}>
                <ThemedText
                  style={[
                    styles.linkText,
                    { color: Colors[colorScheme ?? 'light'].tint },
                  ]}
                >
                  {t('auth.register')}
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
    marginBottom: 40,
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
    gap: 20,
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
  loginButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
