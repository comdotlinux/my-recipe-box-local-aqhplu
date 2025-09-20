
import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { ShareableRecipe } from '../types/Sharing';
import QRScanner from '../components/QRScanner';

export default function ScannerScreen() {
  const handleScanSuccess = (recipe: ShareableRecipe) => {
    console.log('QR scan successful, navigating to preview');
    
    // Navigate to import preview with recipe data
    router.replace({
      pathname: '/import/preview',
      params: {
        recipeData: encodeURIComponent(JSON.stringify(recipe)),
      },
    });
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <QRScanner 
        onScanSuccess={handleScanSuccess}
        onClose={handleClose}
      />
    </View>
  );
}
