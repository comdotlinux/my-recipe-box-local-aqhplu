
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Recipe } from '../types/Recipe';
import { getQRErrorCorrectionLevel, validateQRCodeSize } from '../utils/qrCode';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';
import SimpleBottomSheet from './BottomSheet';

interface QRCodeSheetProps {
  qrData: { deepLink: string; recipe: Recipe } | null;
  isVisible: boolean;
  onClose: () => void;
}

export default function QRCodeSheet({ qrData, isVisible, onClose }: QRCodeSheetProps) {
  const qrRef = useRef<any>(null);

  const handleShareQRCode = async () => {
    if (!qrData) return;

    try {
      // For now, just share the deep link
      // In a full implementation, we'd capture the QR code as an image
      await Share.share({
        message: `Scan this QR code to import the recipe "${qrData.recipe.title}" into MyRecipeBox:\n\n${qrData.deepLink}`,
        title: `QR Code: ${qrData.recipe.title}`,
      });
    } catch (error) {
      console.error('Failed to share QR code:', error);
      Alert.alert('Share Failed', 'Unable to share QR code. Please try again.');
    }
  };

  const handleSaveQRCode = () => {
    Alert.alert('Coming Soon', 'Save QR code to gallery will be available in the next update.');
  };

  if (!qrData) return null;

  const isValidSize = validateQRCodeSize(qrData.deepLink);
  const errorCorrectionLevel = getQRErrorCorrectionLevel(qrData.deepLink.length);

  return (
    <SimpleBottomSheet isVisible={isVisible} onClose={onClose}>
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <View style={[commonStyles.row, { 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
          marginBottom: spacing.lg 
        }]}>
          <Text style={typography.headlineSmall}>
            QR Code
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Recipe Info */}
        <View style={[commonStyles.card, { 
          backgroundColor: colors.surfaceVariant,
          marginBottom: spacing.lg,
          width: '100%',
        }]}>
          <Text style={[typography.titleMedium, { marginBottom: spacing.xs, textAlign: 'center' }]}>
            {qrData.recipe.title}
          </Text>
          <Text style={[typography.bodySmall, { 
            color: colors.textSecondary, 
            textAlign: 'center' 
          }]}>
            Scan to import this recipe
          </Text>
        </View>

        {/* QR Code */}
        {isValidSize ? (
          <View style={{
            padding: spacing.lg,
            backgroundColor: colors.background,
            borderRadius: borderRadius.lg,
            marginBottom: spacing.lg,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            <QRCode
              value={qrData.deepLink}
              size={200}
              color={colors.text}
              backgroundColor={colors.background}
              errorCorrectionLevel={errorCorrectionLevel}
              getRef={(ref) => (qrRef.current = ref)}
            />
          </View>
        ) : (
          <View style={[commonStyles.card, { 
            backgroundColor: colors.error + '20',
            borderColor: colors.error,
            borderWidth: 1,
            marginBottom: spacing.lg,
            alignItems: 'center',
          }]}>
            <Icon name="warning" size={48} color={colors.error} />
            <Text style={[typography.titleMedium, { 
              color: colors.error, 
              marginTop: spacing.md,
              textAlign: 'center' 
            }]}>
              Recipe Too Large
            </Text>
            <Text style={[typography.bodyMedium, { 
              color: colors.error, 
              marginTop: spacing.sm,
              textAlign: 'center' 
            }]}>
              This recipe contains too much data for a QR code. Try sharing with the app link instead.
            </Text>
          </View>
        )}

        {/* Data Info */}
        <View style={[commonStyles.card, { 
          backgroundColor: colors.surfaceVariant,
          marginBottom: spacing.lg,
          width: '100%',
        }]}>
          <View style={[commonStyles.row, { justifyContent: 'space-between', marginBottom: spacing.sm }]}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              Data Size:
            </Text>
            <Text style={[typography.bodySmall, { 
              color: isValidSize ? colors.success : colors.error 
            }]}>
              {qrData.deepLink.length} / 2900 chars
            </Text>
          </View>
          <View style={[commonStyles.row, { justifyContent: 'space-between' }]}>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              Error Correction:
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              Level {errorCorrectionLevel}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {isValidSize && (
          <View style={{ width: '100%' }}>
            <TouchableOpacity
              style={[commonStyles.card, {
                backgroundColor: colors.primary,
                marginBottom: spacing.md,
              }]}
              onPress={handleShareQRCode}
            >
              <View style={[commonStyles.row, { justifyContent: 'center' }]}>
                <Icon name="share" size={20} color={colors.background} />
                <Text style={[typography.labelLarge, { 
                  color: colors.background, 
                  marginLeft: spacing.sm 
                }]}>
                  Share QR Code
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[commonStyles.card, {
                backgroundColor: colors.surface,
                borderColor: colors.outline,
                borderWidth: 1,
              }]}
              onPress={handleSaveQRCode}
            >
              <View style={[commonStyles.row, { justifyContent: 'center' }]}>
                <Icon name="download" size={20} color={colors.text} />
                <Text style={[typography.labelLarge, { 
                  color: colors.text, 
                  marginLeft: spacing.sm 
                }]}>
                  Save to Gallery
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        <View style={{ marginTop: spacing.lg, width: '100%' }}>
          <Text style={[typography.bodySmall, { 
            color: colors.textSecondary, 
            textAlign: 'center',
            lineHeight: 18 
          }]}>
            Open MyRecipeBox on another device and use the QR scanner to import this recipe.
          </Text>
        </View>
      </View>
    </SimpleBottomSheet>
  );
}
