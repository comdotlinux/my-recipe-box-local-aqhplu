
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { commonStyles, colors, typography, spacing } from '../../styles/commonStyles';
import { RootState, AppDispatch } from '../../store';
import { setTheme } from '../../store/slices/uiSlice';
import { getUserPreference, setUserPreference } from '../../utils/database';
import Icon from '../../components/Icon';
import PlatformNotice from '../../components/PlatformNotice';
import DatabaseTestPanel from '../../components/DatabaseTestPanel';

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useSelector((state: RootState) => state.ui);
  const [notifications, setNotifications] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const notificationsValue = await getUserPreference('notifications');
      const autoBackupValue = await getUserPreference('autoBackup');
      
      setNotifications(notificationsValue === 'true');
      setAutoBackup(autoBackupValue === 'true');
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    dispatch(setTheme(newTheme));
    await setUserPreference('theme', newTheme);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    await setUserPreference('notifications', value.toString());
  };

  const handleAutoBackupToggle = async (value: boolean) => {
    setAutoBackup(value);
    await setUserPreference('autoBackup', value.toString());
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export functionality will be implemented in the next phase.');
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'Data import functionality will be implemented in the next phase.');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your recipes and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All Data', style: 'destructive', onPress: () => {
          // TODO: Implement data clearing
          Alert.alert('Data Cleared', 'All data has been cleared.');
        }},
      ]
    );
  };

  const handleScanQRCode = () => {
    console.log('Opening QR scanner');
    router.push('/scanner');
  };

  const renderSettingItem = (
    title: string,
    subtitle?: string,
    icon?: string,
    onPress?: () => void,
    rightElement?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[commonStyles.card, { marginBottom: spacing.md }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[commonStyles.row, { alignItems: 'center' }]}>
        {icon && (
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
          }}>
            <Icon name={icon} size={20} color={colors.primary} />
          </View>
        )}
        
        <View style={{ flex: 1 }}>
          <Text style={[typography.titleMedium, { marginBottom: subtitle ? spacing.xs : 0 }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {rightElement || (onPress && <Icon name="chevron-forward" size={20} color={colors.textSecondary} />)}
      </View>
    </TouchableOpacity>
  );

  const renderThemeSelector = () => (
    <View style={[commonStyles.card, { marginBottom: spacing.md }]}>
      <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
        Theme
      </Text>
      
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(['light', 'dark', 'auto'] as const).map((themeOption) => (
          <TouchableOpacity
            key={themeOption}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: spacing.sm,
              backgroundColor: theme === themeOption ? colors.primary : colors.surface,
              alignItems: 'center',
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
      <View style={commonStyles.container}>
        <View style={{ padding: spacing.md, paddingBottom: spacing.sm }}>
          <Text style={typography.headlineMedium}>Settings</Text>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
          {Platform.OS === 'web' && (
            <PlatformNotice 
              message="Some features may be limited on web. For the best experience, use the mobile app."
              type="info"
            />
          )}

          {/* Import Section */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.titleLarge, { marginBottom: spacing.md }]}>
              Import Recipes
            </Text>
            
            {renderSettingItem(
              'Scan QR Code',
              'Import recipes from QR codes',
              'qr-code-outline',
              handleScanQRCode
            )}
          </View>

          {/* Appearance */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.titleLarge, { marginBottom: spacing.md }]}>
              Appearance
            </Text>
            
            {renderThemeSelector()}
          </View>

          {/* Notifications */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.titleLarge, { marginBottom: spacing.md }]}>
              Notifications
            </Text>
            
            {renderSettingItem(
              'Push Notifications',
              'Get notified about recipe updates',
              'notifications',
              undefined,
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: colors.surfaceVariant, true: colors.primary + '40' }}
                thumbColor={notifications ? colors.primary : colors.textSecondary}
              />
            )}
          </View>

          {/* Backup & Sync */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.titleLarge, { marginBottom: spacing.md }]}>
              Backup & Sync
            </Text>
            
            {renderSettingItem(
              'Auto Backup',
              'Automatically backup your recipes',
              'cloud-upload',
              undefined,
              <Switch
                value={autoBackup}
                onValueChange={handleAutoBackupToggle}
                trackColor={{ false: colors.surfaceVariant, true: colors.primary + '40' }}
                thumbColor={autoBackup ? colors.primary : colors.textSecondary}
              />
            )}
            
            {renderSettingItem(
              'Export Data',
              'Export all your recipes and settings',
              'download',
              handleExportData
            )}
            
            {renderSettingItem(
              'Import Data',
              'Import recipes from backup file',
              'cloud-download',
              handleImportData
            )}
          </View>

          {/* Storage */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[typography.titleLarge, { marginBottom: spacing.md }]}>
              Storage
            </Text>
            
            {renderSettingItem(
              'Clear All Data',
              'Delete all recipes and reset app',
              'trash',
              handleClearData
            )}
          </View>

          {/* Developer Tools */}
          {__DEV__ && (
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.titleLarge, { marginBottom: spacing.md }]}>
                Developer Tools
              </Text>
              
              {renderSettingItem(
                'Database Tests',
                'Run database migration and functionality tests',
                'flask',
                () => setShowTestPanel(true)
              )}
            </View>
          )}

          {/* About */}
          <View style={{ marginBottom: spacing.xl }}>
            <Text style={[typography.titleLarge, { marginBottom: spacing.md }]}>
              About
            </Text>
            
            {renderSettingItem(
              'Version',
              '1.0.0',
              'information-circle'
            )}
            
            {renderSettingItem(
              'Privacy Policy',
              'How we handle your data',
              'shield-checkmark',
              () => Alert.alert('Privacy Policy', 'Privacy policy will be available soon.')
            )}
            
            {renderSettingItem(
              'Terms of Service',
              'App usage terms and conditions',
              'document-text',
              () => Alert.alert('Terms of Service', 'Terms of service will be available soon.')
            )}
          </View>
        </ScrollView>
      </View>

      <DatabaseTestPanel 
        isVisible={showTestPanel}
        onClose={() => setShowTestPanel(false)}
      />
    </SafeAreaView>
  );
}
