
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { parseDeepLink } from '../utils/sharing';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';

interface QRScannerProps {
  onScanSuccess: (recipe: any) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);
    
    console.log('QR Code scanned:', data);

    try {
      // Check if it's a MyRecipeBox deep link
      if (!data.startsWith('myrecipebox://import/')) {
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not a MyRecipeBox recipe. Please scan a recipe QR code.',
          [{ text: 'Try Again', onPress: () => setScanned(false) }]
        );
        return;
      }

      // Parse and validate the deep link
      const validationResult = await parseDeepLink(data);
      
      if (!validationResult.isValid) {
        let errorMessage = 'Cannot read this recipe';
        
        switch (validationResult.error) {
          case 'corrupted':
            errorMessage = 'Recipe data is corrupted';
            break;
          case 'duplicate':
            errorMessage = 'You already have this recipe';
            break;
          case 'invalid':
            errorMessage = 'Invalid recipe format';
            break;
          case 'size_limit':
            errorMessage = 'Recipe data too large';
            break;
          case 'version_mismatch':
            errorMessage = 'Recipe requires app update';
            break;
        }

        Alert.alert(
          'Import Failed',
          errorMessage,
          [{ text: 'Try Again', onPress: () => setScanned(false) }]
        );
        return;
      }

      // Show version info if available
      if (validationResult.shareVersion && validationResult.currentVersion) {
        const { shareVersion, currentVersion } = validationResult;
        if (shareVersion !== currentVersion) {
          console.log(`Importing recipe: v${shareVersion} → v${currentVersion}`);
        }
      }

      // Success - pass the recipe to parent
      onScanSuccess(validationResult.recipe);
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert(
        'Scan Error',
        'Failed to process QR code. Please try again.',
        [{ text: 'Try Again', onPress: () => setScanned(false) }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={[typography.bodyLarge, { color: colors.textSecondary }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent, { padding: spacing.lg }]}>
        <Icon name="camera-off" size={64} color={colors.textSecondary} />
        <Text style={[typography.headlineSmall, { 
          marginTop: spacing.lg, 
          marginBottom: spacing.md,
          textAlign: 'center' 
        }]}>
          Camera Permission Required
        </Text>
        <Text style={[typography.bodyMedium, { 
          color: colors.textSecondary, 
          textAlign: 'center',
          marginBottom: spacing.xl 
        }]}>
          Please enable camera access in your device settings to scan QR codes.
        </Text>
        <TouchableOpacity
          style={[commonStyles.card, { backgroundColor: colors.primary }]}
          onPress={onClose}
        >
          <Text style={[typography.labelLarge, { color: colors.background }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={colors.background} />
          </TouchableOpacity>
          <Text style={[typography.titleLarge, { color: colors.background }]}>
            Scan Recipe QR Code
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scanning Area */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame} />
          <Text style={[typography.bodyMedium, { 
            color: colors.background, 
            textAlign: 'center',
            marginTop: spacing.lg 
          }]}>
            Position the QR code within the frame
          </Text>
        </View>

        {/* Bottom Instructions */}
        <View style={styles.instructions}>
          {isProcessing ? (
            <View style={[commonStyles.card, { backgroundColor: colors.primary }]}>
              <Text style={[typography.labelLarge, { 
                color: colors.background,
                textAlign: 'center' 
              }]}>
                Processing recipe...
              </Text>
            </View>
          ) : scanned ? (
            <TouchableOpacity
              style={[commonStyles.card, { backgroundColor: colors.background }]}
              onPress={() => setScanned(false)}
            >
              <Text style={[typography.labelLarge, { 
                color: colors.text,
                textAlign: 'center' 
              }]}>
                Tap to scan again
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[typography.bodySmall, { 
              color: colors.background, 
              textAlign: 'center',
              opacity: 0.8 
            }]}>
              Make sure the QR code is well-lit and clearly visible
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
  },
  instructions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 60,
  },
});
