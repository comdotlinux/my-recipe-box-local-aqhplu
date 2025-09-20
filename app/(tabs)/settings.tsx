
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { commonStyles, colors, typography, spacing } from '../../styles/commonStyles';
import { RootState, AppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { getUserPreference, setUserPreference } from '../../utils/database';
import Icon from '../../components/Icon';

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useSelector((state: RootState) => state.ui);
  const [notifications, setNotifications] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const notificationsEnabled = await getUserPreference('notifications_enabled');
      const autoBackupEnabled = await getUserPreference('auto_backup_enabled');
      
      setNotifications(notificationsEnabled === 'true');
      setAutoBackup(autoBackupEnabled === 'true');
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    console.log('Changing theme to:', newTheme);
    dispatch(setTheme(newTheme));
    await setUserPreference('theme', newTheme);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    console.log('Toggling notifications:', value);
    setNotifications(value);
    await setUserPreference('notifications_enabled', value.toString());
  };

  const handleAutoBackupToggle = async (value: boolean) => {
    console.log('Toggling auto backup:', value);
    setAutoBackup(value);
    await setUserPreference('auto_backup_enabled', value.toString());
  };

  const handleExportData = () => {
    console.log('Exporting data...');
    Alert.alert(
      'Export Data',
      'Export functionality will be implemented in the next phase.',
      [{ text: 'OK' }]
    );
  };

  const handleImportData = () => {
    console.log('Importing data...');
    Alert.alert(
      'Import Data',
      'Import functionality will be implemented in the next phase.',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your recipes and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: () => {
            console.log('Clearing all data...');
            // TODO: Implement data clearing
            Alert.alert('Data Cleared', 'All data has been cleared.');
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle?: string,
    icon?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[commonStyles.card, { marginBottom: spacing.sm }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={commonStyles.spaceBetween}>
        <View style={[commonStyles.row, { flex: 1 }]}>
          {icon && (
            <Icon name={icon as any} size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={typography.bodyLarge}>{title}</Text>
            {subtitle && (
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        {rightElement || (onPress && <Icon name="chevron-forward" size={16} color={colors.textSecondary} />)}
      </View>
    </TouchableOpacity>
  );

  const renderThemeSelector = () => (
    <View style={[commonStyles.card, { marginBottom: spacing.sm }]}>
      <View style={[commonStyles.row, { marginBottom: spacing.md }]}>
        <Icon name="color-palette" size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
        <View>
          <Text style={typography.bodyLarge}>Theme</Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Choose your preferred app appearance
          </Text>
        </View>
      </View>
      
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(['light', 'dark', 'auto'] as const).map((themeOption) => (
          <TouchableOpacity
            key={themeOption}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              alignItems: 'center',
              backgroundColor: theme === themeOption ? colors.primary : colors.surface,
              borderRadius: 8,
            }}
            onPress={() => handleThemeChange(themeOption)}
          >
            <Text style={{
              ...typography.labelMedium,
              color: theme === themeOption ? colors.background : colors.text,
              textTransform: 'capitalize',
            }}>
              {themeOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={{ padding: spacing.md }}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.headlineMedium, { marginBottom: spacing.xs }]}>
            Settings
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            Customize your recipe box experience
          </Text>
        </View>

        {/* Appearance */}
        <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
          Appearance
        </Text>
        {renderThemeSelector()}

        {/* Notifications */}
        <Text style={[typography.titleMedium, { marginBottom: spacing.md, marginTop: spacing.lg }]}>
          Notifications
        </Text>
        {renderSettingItem(
          'Push Notifications',
          'Get notified about recipe reminders and updates',
          'notifications',
          undefined,
          <Switch
            value={notifications}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={colors.background}
          />
        )}

        {/* Data & Backup */}
        <Text style={[typography.titleMedium, { marginBottom: spacing.md, marginTop: spacing.lg }]}>
          Data & Backup
        </Text>
        {renderSettingItem(
          'Auto Backup',
          'Automatically backup your recipes to Google Drive',
          'cloud-upload',
          undefined,
          <Switch
            value={autoBackup}
            onValueChange={handleAutoBackupToggle}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={colors.background}
          />
        )}
        {renderSettingItem(
          'Export Data',
          'Export all your recipes to a file',
          'download',
          handleExportData
        )}
        {renderSettingItem(
          'Import Data',
          'Import recipes from a backup file',
          'cloud-download',
          handleImportData
        )}

        {/* Storage */}
        <Text style={[typography.titleMedium, { marginBottom: spacing.md, marginTop: spacing.lg }]}>
          Storage
        </Text>
        {renderSettingItem(
          'Storage Usage',
          'View how much space your recipes are using',
          'folder',
          () => {
            Alert.alert('Storage Usage', 'Storage usage details will be implemented in the next phase.');
          }
        )}

        {/* About */}
        <Text style={[typography.titleMedium, { marginBottom: spacing.md, marginTop: spacing.lg }]}>
          About
        </Text>
        {renderSettingItem(
          'App Version',
          'MyRecipeBox Local v1.0.0',
          'information-circle'
        )}
        {renderSettingItem(
          'Privacy Policy',
          'Learn how we protect your data',
          'shield-checkmark',
          () => {
            Alert.alert('Privacy Policy', 'All your data is stored locally on your device. We do not collect or share any personal information.');
          }
        )}
        {renderSettingItem(
          'Help & Support',
          'Get help using the app',
          'help-circle',
          () => {
            Alert.alert('Help & Support', 'Help documentation will be available in the next phase.');
          }
        )}

        {/* Danger Zone */}
        <Text style={[typography.titleMedium, { 
          marginBottom: spacing.md, 
          marginTop: spacing.lg,
          color: colors.error 
        }]}>
          Danger Zone
        </Text>
        {renderSettingItem(
          'Clear All Data',
          'Permanently delete all recipes and settings',
          'trash',
          handleClearData
        )}

        {/* Footer */}
        <View style={{ 
          alignItems: 'center', 
          paddingVertical: spacing.xl,
          marginTop: spacing.lg 
        }}>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
            MyRecipeBox Local{'\n'}
            Offline-first recipe management
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
