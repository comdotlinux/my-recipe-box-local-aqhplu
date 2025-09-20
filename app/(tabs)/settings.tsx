
import { useDispatch, useSelector } from 'react-redux';
import { commonStyles, colors, typography, spacing } from '../../styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setTheme } from '../../store/slices/uiSlice';
import { getUserPreference, setUserPreference } from '../../utils/database';
import React, { useState, useEffect } from 'react';
import { RootState, AppDispatch } from '../../store';
import Icon from '../../components/Icon';
import PlatformNotice from '../../components/PlatformNotice';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useSelector((state: RootState) => state.ui);
  const [notifications, setNotifications] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const notificationsPref = await getUserPreference('notifications');
      const autoBackupPref = await getUserPreference('autoBackup');
      
      setNotifications(notificationsPref === 'true');
      setAutoBackup(autoBackupPref === 'true');
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    try {
      dispatch(setTheme(newTheme));
      await setUserPreference('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      setNotifications(value);
      await setUserPreference('notifications', value.toString());
    } catch (error) {
      console.error('Failed to save notifications preference:', error);
    }
  };

  const handleAutoBackupToggle = async (value: boolean) => {
    try {
      setAutoBackup(value);
      await setUserPreference('autoBackup', value.toString());
    } catch (error) {
      console.error('Failed to save auto backup preference:', error);
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export functionality will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'Import functionality will be available in a future update.',
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
            console.log('Clear data functionality to be implemented');
          }
        }
      ]
    );
  };

  const renderSettingItem = (
    title: string,
    subtitle?: string,
    rightComponent?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[commonStyles.card, { marginBottom: spacing.sm }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.subtitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  const renderThemeSelector = () => (
    <View style={[commonStyles.card, { marginBottom: spacing.sm }]}>
      <Text style={[typography.subtitle, { color: colors.text, marginBottom: spacing.sm }]}>
        Theme
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {(['light', 'dark', 'auto'] as const).map((themeOption) => (
          <TouchableOpacity
            key={themeOption}
            style={[
              {
                flex: 1,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                borderRadius: 8,
                marginHorizontal: 4,
                backgroundColor: theme === themeOption ? colors.primary : colors.surface,
              }
            ]}
            onPress={() => handleThemeChange(themeOption)}
          >
            <Text
              style={[
                typography.body,
                {
                  textAlign: 'center',
                  color: theme === themeOption ? colors.onPrimary : colors.text,
                  textTransform: 'capitalize',
                }
              ]}
            >
              {themeOption}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.header}>
        <Text style={[typography.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {Platform.OS === 'web' && (
          <PlatformNotice 
            message="Running in web mode with AsyncStorage fallback. For full SQLite features, use the native app."
            type="info"
          />
        )}

        {renderThemeSelector()}

        {renderSettingItem(
          'Notifications',
          'Get notified about cooking reminders',
          <Switch
            value={notifications}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: colors.surface, true: colors.primary }}
            thumbColor={notifications ? colors.onPrimary : colors.textSecondary}
          />
        )}

        {renderSettingItem(
          'Auto Backup',
          'Automatically backup your recipes',
          <Switch
            value={autoBackup}
            onValueChange={handleAutoBackupToggle}
            trackColor={{ false: colors.surface, true: colors.primary }}
            thumbColor={autoBackup ? colors.onPrimary : colors.textSecondary}
          />
        )}

        <View style={{ height: spacing.lg }} />

        <Text style={[typography.subtitle, { color: colors.text, marginBottom: spacing.sm }]}>
          Data Management
        </Text>

        {renderSettingItem(
          'Export Data',
          'Save your recipes to a file',
          <Icon name="download" size={20} color={colors.textSecondary} />,
          handleExportData
        )}

        {renderSettingItem(
          'Import Data',
          'Load recipes from a file',
          <Icon name="upload" size={20} color={colors.textSecondary} />,
          handleImportData
        )}

        {renderSettingItem(
          'Clear All Data',
          'Delete all recipes and settings',
          <Icon name="trash" size={20} color={colors.error} />,
          handleClearData
        )}

        <View style={{ height: spacing.xl }} />

        <View style={[commonStyles.card, { alignItems: 'center' }]}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            MyRecipeBox Local v1.0.0
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
            {Platform.OS === 'web' ? 'Web Version' : 'Native Version'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
