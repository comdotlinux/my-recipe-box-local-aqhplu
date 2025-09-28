
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';
import { router } from 'expo-router';
import { initDatabase, setUserPreference } from '../utils/database';
import googleDriveBackup from '../utils/googleDriveBackup';

interface WelcomeScreenProps {
  onComplete: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartFresh = async () => {
    try {
      setIsLoading(true);
      console.log('Starting fresh installation...');
      
      // Initialize database
      await initDatabase();
      
      // Set first launch flag
      await setUserPreference('firstLaunch', 'false');
      await setUserPreference('setupComplete', 'true');
      
      console.log('Fresh installation completed');
      onComplete();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert('Setup Error', 'Failed to initialize the app. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreFromBackup = async () => {
    try {
      setIsLoading(true);
      console.log('Starting restore from backup...');
      
      // Initialize Google Drive backup
      const initialized = await googleDriveBackup.initialize();
      
      if (!initialized) {
        // Need to authenticate
        const authenticated = await googleDriveBackup.authenticate();
        
        if (!authenticated) {
          Alert.alert(
            'Authentication Failed',
            'Could not connect to Google Drive. You can set this up later in Settings.'
          );
          setIsLoading(false);
          return;
        }
      }
      
      // List available backups
      const backups = await googleDriveBackup.listBackups();
      
      if (backups.length === 0) {
        Alert.alert(
          'No Backups Found',
          'No backups were found in your Google Drive. Starting fresh instead.',
          [
            { text: 'OK', onPress: handleStartFresh }
          ]
        );
        return;
      }
      
      // For now, just show that backups were found
      Alert.alert(
        'Backups Found',
        `Found ${backups.length} backup(s). Backup restoration will be implemented in the next phase.`,
        [
          { text: 'Start Fresh Instead', onPress: handleStartFresh },
          { text: 'Cancel', onPress: () => setIsLoading(false) }
        ]
      );
      
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      Alert.alert(
        'Restore Failed',
        'Could not restore from backup. Would you like to start fresh instead?',
        [
          { text: 'Start Fresh', onPress: handleStartFresh },
          { text: 'Cancel', onPress: () => setIsLoading(false) }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[commonStyles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="restaurant" size={48} color={colors.primary} />
            </View>
            <Text style={[typography.headlineLarge, { 
              color: colors.text, 
              marginTop: spacing.lg,
              textAlign: 'center'
            }]}>
              Welcome to MyRecipeBox
            </Text>
            <Text style={[typography.bodyLarge, { 
              color: colors.textSecondary, 
              marginTop: spacing.md,
              textAlign: 'center',
              lineHeight: 24
            }]}>
              Your personal recipe collection, stored locally on your device with optional cloud backup.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Icon name="camera" size={24} color={colors.primary} />
              <Text style={[typography.bodyMedium, { color: colors.text, marginLeft: spacing.md }]}>
                Capture recipes with photos
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Icon name="search" size={24} color={colors.primary} />
              <Text style={[typography.bodyMedium, { color: colors.text, marginLeft: spacing.md }]}>
                Fast full-text search
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Icon name="share" size={24} color={colors.primary} />
              <Text style={[typography.bodyMedium, { color: colors.text, marginLeft: spacing.md }]}>
                Share recipes with QR codes
              </Text>
            </View>
            
            <View style={styles.featureItem}>
              <Icon name="cloud" size={24} color={colors.primary} />
              <Text style={[typography.bodyMedium, { color: colors.text, marginLeft: spacing.md }]}>
                Optional Google Drive backup
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleStartFresh}
            disabled={isLoading}
          >
            <Icon name="add-circle" size={24} color={colors.onPrimary} />
            <Text style={[typography.labelLarge, { 
              color: colors.onPrimary, 
              marginLeft: spacing.sm 
            }]}>
              Start Fresh
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleRestoreFromBackup}
            disabled={isLoading}
          >
            <Icon name="cloud-download" size={24} color={colors.primary} />
            <Text style={[typography.labelLarge, { 
              color: colors.primary, 
              marginLeft: spacing.sm 
            }]}>
              Restore from Backup
            </Text>
          </TouchableOpacity>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                Setting up your recipe box...
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  logoContainer: {
    alignItems: 'center' as const,
    marginBottom: spacing.xl * 2,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  featuresContainer: {
    gap: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.sm,
  },
  actionsContainer: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  loadingContainer: {
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
  },
};

export default WelcomeScreen;
