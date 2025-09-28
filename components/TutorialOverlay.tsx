
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  position?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  steps?: TutorialStep[];
}

const defaultSteps: TutorialStep[] = [
  {
    title: 'Welcome to MyRecipeBox!',
    description: 'Let\'s take a quick tour of your new recipe collection app.',
    icon: 'hand-right',
  },
  {
    title: 'Add Your First Recipe',
    description: 'Tap the + button to add recipes by taking photos, entering manually, or saving from URLs.',
    icon: 'add-circle',
    position: { bottom: 100, right: 20 },
  },
  {
    title: 'Search & Browse',
    description: 'Use the search tab to quickly find recipes by ingredients, name, or any text.',
    icon: 'search',
    position: { bottom: 100, left: 80 },
  },
  {
    title: 'Organize Collections',
    description: 'Create smart collections to organize your recipes by cuisine, difficulty, or custom tags.',
    icon: 'folder',
    position: { bottom: 100, right: 80 },
  },
  {
    title: 'Share with QR Codes',
    description: 'Share your favorite recipes with friends using QR codes - no account needed!',
    icon: 'qr-code',
  },
  {
    title: 'You\'re All Set!',
    description: 'Start building your recipe collection. Everything is stored locally on your device.',
    icon: 'checkmark-circle',
  },
];

const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isVisible,
  onComplete,
  steps = defaultSteps
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const getTooltipPosition = () => {
    if (!currentStepData.position) {
      // Center the tooltip
      return {
        top: screenHeight * 0.4,
        left: spacing.lg,
        right: spacing.lg,
      };
    }

    return {
      ...currentStepData.position,
      maxWidth: screenWidth - (spacing.lg * 2),
    };
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Semi-transparent background */}
        <View style={styles.backdrop} />
        
        {/* Tutorial tooltip */}
        <View style={[styles.tooltip, getTooltipPosition()]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name={currentStepData.icon} size={32} color={colors.primary} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[typography.titleLarge, { 
              color: colors.text, 
              textAlign: 'center',
              marginBottom: spacing.md 
            }]}>
              {currentStepData.title}
            </Text>
            
            <Text style={[typography.bodyMedium, { 
              color: colors.textSecondary, 
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: spacing.lg 
            }]}>
              {currentStepData.description}
            </Text>
          </View>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor: index === currentStep 
                        ? colors.primary 
                        : colors.outline,
                    }
                  ]}
                />
              ))}
            </View>
            
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              {currentStep + 1} of {steps.length}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            <View style={styles.leftActions}>
              {!isFirstStep && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handlePrevious}
                >
                  <Icon name="chevron-back" size={16} color={colors.textSecondary} />
                  <Text style={[typography.labelMedium, { 
                    color: colors.textSecondary,
                    marginLeft: spacing.xs 
                  }]}>
                    Back
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.rightActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSkip}
              >
                <Text style={[typography.labelMedium, { color: colors.textSecondary }]}>
                  Skip
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
              >
                <Text style={[typography.labelMedium, { 
                  color: colors.onPrimary,
                  marginRight: isLastStep ? 0 : spacing.xs 
                }]}>
                  {isLastStep ? 'Get Started' : 'Next'}
                </Text>
                {!isLastStep && (
                  <Icon name="chevron-forward" size={16} color={colors.onPrimary} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Highlight areas (if position is specified) */}
        {currentStepData.position && (
          <View style={[styles.highlight, {
            top: currentStepData.position.top,
            bottom: currentStepData.position.bottom,
            left: currentStepData.position.left,
            right: currentStepData.position.right,
          }]} />
        )}
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    position: 'relative' as const,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  tooltip: {
    position: 'absolute' as const,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  iconContainer: {
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  content: {
    alignItems: 'center' as const,
  },
  progressContainer: {
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  progressDots: {
    flexDirection: 'row' as const,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  leftActions: {
    flex: 1,
  },
  rightActions: {
    flexDirection: 'row' as const,
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  secondaryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  highlight: {
    position: 'absolute' as const,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
};

// Add StyleSheet import
import { StyleSheet } from 'react-native';

export default TutorialOverlay;
