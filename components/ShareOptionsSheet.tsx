
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import { Recipe } from '../types/Recipe';
import { generateShareMessage, generateDeepLink } from '../utils/sharing';
import { generateQRCodeData } from '../utils/qrCode';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';
import SimpleBottomSheet from './BottomSheet';

interface ShareOptionsSheetProps {
  recipe: Recipe | null;
  isVisible: boolean;
  onClose: () => void;
  onShowQRCode: (qrData: { deepLink: string; recipe: Recipe }) => void;
}

export default function ShareOptionsSheet({ 
  recipe, 
  isVisible, 
  onClose, 
  onShowQRCode 
}: ShareOptionsSheetProps) {
  const [isSharing, setIsSharing] = useState(false);

  const handleShareWithAppLink = async () => {
    if (!recipe) return;
    
    setIsSharing(true);
    try {
      const shareMessage = generateShareMessage(recipe);
      
      await Share.share({
        message: shareMessage,
        title: `Recipe: ${recipe.title}`,
      });
    } catch (error) {
      console.error('Failed to share with app link:', error);
      Alert.alert('Share Failed', 'Unable to share recipe. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareQRCode = () => {
    if (!recipe) return;
    
    try {
      const qrData = generateQRCodeData(recipe);
      onShowQRCode(qrData);
      onClose();
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      Alert.alert('QR Code Failed', 'Unable to generate QR code. Recipe data may be too large.');
    }
  };

  const handleShareAsImage = () => {
    Alert.alert('Coming Soon', 'Recipe card image sharing will be available in the next update.');
  };

  const handleShareAsPDF = () => {
    Alert.alert('Coming Soon', 'PDF export will be available in the next update.');
  };

  const handleCopyLink = async () => {
    if (!recipe) return;
    
    try {
      const deepLink = generateDeepLink(recipe);
      
      if (Platform.OS === 'web') {
        // Web clipboard API
        await navigator.clipboard.writeText(deepLink);
      } else {
        // React Native doesn't have built-in clipboard, but we can use Share
        await Share.share({
          message: deepLink,
          title: 'Recipe Import Link',
        });
        return;
      }
      
      Alert.alert('Link Copied', 'Recipe import link copied to clipboard.');
    } catch (error) {
      console.error('Failed to copy link:', error);
      Alert.alert('Copy Failed', 'Unable to copy link. Please try sharing instead.');
    }
  };

  const renderShareOption = (
    icon: string,
    title: string,
    description: string,
    onPress: () => void,
    disabled = false
  ) => (
    <TouchableOpacity
      style={[
        commonStyles.card,
        {
          marginBottom: spacing.md,
          opacity: disabled ? 0.5 : 1,
        }
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View style={[commonStyles.row, { alignItems: 'center' }]}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.primary + '20',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.md,
        }}>
          <Icon name={icon} size={24} color={colors.primary} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[typography.titleMedium, { marginBottom: spacing.xs }]}>
            {title}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            {description}
          </Text>
        </View>
        
        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SimpleBottomSheet isVisible={isVisible} onClose={onClose}>
      <View style={{ padding: spacing.lg }}>
        <View style={[commonStyles.row, { 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: spacing.lg 
        }]}>
          <Text style={typography.headlineSmall}>
            Share Recipe
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {recipe && (
          <View style={[commonStyles.card, { 
            backgroundColor: colors.surfaceVariant,
            marginBottom: spacing.lg 
          }]}>
            <Text style={[typography.titleMedium, { marginBottom: spacing.xs }]}>
              {recipe.title}
            </Text>
            {recipe.description && (
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]} numberOfLines={2}>
                {recipe.description}
              </Text>
            )}
          </View>
        )}

        {renderShareOption(
          'share',
          'Share with App Link',
          'Send both web preview and app import links',
          handleShareWithAppLink,
          isSharing
        )}

        {renderShareOption(
          'qr-code',
          'QR Code',
          'Generate QR code for in-person sharing',
          handleShareQRCode
        )}

        {renderShareOption(
          'copy',
          'Copy Import Link',
          'Copy direct import link to clipboard',
          handleCopyLink
        )}

        {renderShareOption(
          'image',
          'Recipe Card Image',
          'Share as a beautiful recipe card',
          handleShareAsImage,
          true // Disabled for now
        )}

        {renderShareOption(
          'document',
          'PDF Export',
          'Export as print-friendly PDF',
          handleShareAsPDF,
          true // Disabled for now
        )}
      </View>
    </SimpleBottomSheet>
  );
}
