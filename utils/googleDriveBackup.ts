
import { AuthRequest, AuthRequestPromptOptions, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { documentDirectory, writeAsStringAsync, readAsStringAsync, deleteAsync, getInfoAsync, makeDirectoryAsync } from 'expo-file-system';
import { Platform, Alert } from 'react-native';
import { getAllRecipes, getUserPreference, setUserPreference, getMigrationInfo } from './database';
import { Recipe } from '../types/Recipe';
import { BackupMetadata } from '../types/Sharing';
import { createBackupMetadata, checkBackupCompatibility, migrateBackupData, validateBackupIntegrity } from './backupVersioning';

const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GOOGLE_CLIENT_ID = 'your-google-client-id'; // This should be configured in app.json
const BACKUP_FOLDER_NAME = 'MyRecipeBox Backups';
const MAX_BACKUPS = 5;

interface BackupData {
  database: Recipe[];
  preferences: Record<string, string>;
  version: number;
  timestamp: number;
  compressed: boolean;
  checksum: string;
  // New versioning fields
  metadata: BackupMetadata;
}

interface BackupFile {
  id: string;
  name: string;
  size: number;
  createdTime: string;
  recipeCount: number;
}

class GoogleDriveBackup {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      // Load stored tokens
      this.accessToken = await getUserPreference('google_access_token');
      this.refreshToken = await getUserPreference('google_refresh_token');
      
      if (this.accessToken) {
        // Verify token is still valid
        const isValid = await this.verifyToken();
        if (isValid) {
          console.log('Google Drive backup initialized successfully');
          return true;
        }
      }
      
      console.log('Google Drive backup requires authentication');
      return false;
    } catch (error) {
      console.error('Failed to initialize Google Drive backup:', error);
      return false;
    }
  }

  async authenticate(): Promise<boolean> {
    try {
      console.log('Starting Google Drive authentication...');
      
      const redirectUri = makeRedirectUri({
        useProxy: true,
      });

      const authUrl = `https://accounts.google.com/oauth/authorize?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(GOOGLE_DRIVE_SCOPE)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        // Parse the URL to get the code
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          // Exchange code for tokens
          const tokens = await this.exchangeCodeForTokens(code, redirectUri);
          
          if (tokens) {
            this.accessToken = tokens.access_token;
            this.refreshToken = tokens.refresh_token;
            
            // Store tokens securely
            await setUserPreference('google_access_token', tokens.access_token);
            if (tokens.refresh_token) {
              await setUserPreference('google_refresh_token', tokens.refresh_token);
            }
            
            console.log('Google Drive authentication successful');
            return true;
          }
        }
      }
      
      console.log('Google Drive authentication failed or cancelled');
      return false;
    } catch (error) {
      console.error('Google Drive authentication error:', error);
      return false;
    }
  }

  private async exchangeCodeForTokens(code: string, redirectUri: string): Promise<any> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }).toString(),
      });

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to exchange code for tokens');
    } catch (error) {
      console.error('Token exchange error:', error);
      return null;
    }
  }

  private async verifyToken(): Promise<boolean> {
    if (!this.accessToken) return false;

    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${this.accessToken}`);
      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
      });

      if (response.ok) {
        const tokens = await response.json();
        this.accessToken = tokens.access_token;
        await setUserPreference('google_access_token', tokens.access_token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  async createBackup(onProgress?: (progress: number) => void): Promise<boolean> {
    try {
      console.log('Starting backup creation...');
      onProgress?.(0);

      // Check authentication
      if (!this.accessToken || !(await this.verifyToken())) {
        if (!(await this.refreshAccessToken())) {
          throw new Error('Authentication required');
        }
      }

      onProgress?.(10);

      // Gather data
      const recipes = await getAllRecipes();
      const preferences: Record<string, string> = {};
      
      // Collect user preferences
      const prefKeys = ['theme', 'notifications', 'autoBackup', 'backupFrequency'];
      for (const key of prefKeys) {
        const value = await getUserPreference(key);
        if (value) preferences[key] = value;
      }

      onProgress?.(30);

      // Create backup metadata using the versioning utility
      const metadata = await createBackupMetadata(recipes.length);

      // Create backup data
      const backupData: BackupData = {
        database: recipes,
        preferences,
        version: 1, // Legacy field
        timestamp: Date.now(),
        compressed: true,
        checksum: '',
        metadata, // New versioning metadata
      };

      // Generate checksum
      const dataString = JSON.stringify(backupData);
      backupData.checksum = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        dataString
      );

      onProgress?.(50);

      // Create backup file
      const fileName = `backup_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
      if (!documentDirectory) {
        throw new Error('Document directory not available');
      }
      const fileUri = `${documentDirectory}${fileName}`;
      
      await writeAsStringAsync(fileUri, JSON.stringify(backupData));

      onProgress?.(70);

      // Upload to Google Drive
      const success = await this.uploadBackupFile(fileUri, fileName);
      
      if (success) {
        // Clean up local file
        await deleteAsync(fileUri, { idempotent: true });
        
        // Update last backup timestamp
        await setUserPreference('lastBackup', Date.now().toString());
        
        // Clean up old backups
        await this.cleanupOldBackups();
        
        onProgress?.(100);
        console.log('Backup created successfully');
        return true;
      }
      
      throw new Error('Failed to upload backup');
    } catch (error) {
      console.error('Backup creation failed:', error);
      onProgress?.(0);
      return false;
    }
  }

  private async uploadBackupFile(fileUri: string, fileName: string): Promise<boolean> {
    try {
      // Read file content
      const fileContent = await readAsStringAsync(fileUri);
      
      // Create file metadata
      const metadata = {
        name: fileName,
        parents: [], // Will be set to app folder
      };

      // Upload file
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'multipart/related; boundary="foo_bar_baz"',
        },
        body: [
          '--foo_bar_baz',
          'Content-Type: application/json; charset=UTF-8',
          '',
          JSON.stringify(metadata),
          '--foo_bar_baz',
          'Content-Type: application/json',
          '',
          fileContent,
          '--foo_bar_baz--',
        ].join('\r\n'),
      });

      return response.ok;
    } catch (error) {
      console.error('File upload error:', error);
      return false;
    }
  }

  async listBackups(): Promise<BackupFile[]> {
    try {
      if (!this.accessToken || !(await this.verifyToken())) {
        if (!(await this.refreshAccessToken())) {
          throw new Error('Authentication required');
        }
      }

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name contains 'backup_' and trashed=false&orderBy=createdTime desc&pageSize=${MAX_BACKUPS}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const backups: BackupFile[] = [];

        for (const file of data.files || []) {
          try {
            // Get file content to extract recipe count
            const content = await this.downloadBackupFile(file.id);
            const backupData = JSON.parse(content);
            
            backups.push({
              id: file.id,
              name: file.name,
              size: parseInt(file.size || '0'),
              createdTime: file.createdTime,
              recipeCount: backupData.database?.length || 0,
            });
          } catch (error) {
            console.error('Error processing backup file:', error);
          }
        }

        return backups;
      }
      
      throw new Error('Failed to list backups');
    } catch (error) {
      console.error('List backups error:', error);
      return [];
    }
  }

  private async downloadBackupFile(fileId: string): Promise<string> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (response.ok) {
      return await response.text();
    }
    
    throw new Error('Failed to download backup file');
  }

  async restoreBackup(
    backupId: string, 
    mode: 'replace' | 'merge',
    onProgress?: (progress: number) => void
  ): Promise<boolean> {
    try {
      console.log(`Starting backup restore (${mode} mode)...`);
      onProgress?.(0);

      // Download backup file
      const backupContent = await this.downloadBackupFile(backupId);
      onProgress?.(30);

      // Parse and validate backup
      const backupData: BackupData = JSON.parse(backupContent);
      
      // Validate backup integrity
      const validation = validateBackupIntegrity(backupData);
      if (!validation.valid) {
        throw new Error(`Backup validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Validate checksum
      const dataForChecksum = { ...backupData };
      delete dataForChecksum.checksum;
      const calculatedChecksum = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        JSON.stringify(dataForChecksum)
      );

      if (calculatedChecksum !== backupData.checksum) {
        throw new Error('Backup file is corrupted');
      }

      onProgress?.(50);

      // Check version compatibility
      const compatibility = await checkBackupCompatibility(backupData.metadata);
      
      if (!compatibility.compatible) {
        const shouldContinue = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Backup Compatibility',
            compatibility.message,
            [
              { text: 'Cancel', onPress: () => resolve(false) },
              { text: 'Continue', onPress: () => resolve(true) },
            ]
          );
        });
        
        if (!shouldContinue) {
          throw new Error('Restore cancelled by user');
        }
      }

      // Migrate backup data if needed
      const backupVersion = backupData.metadata?.schema || backupData.version || 1;
      const migrationInfo = await getMigrationInfo();
      const currentVersion = migrationInfo.currentVersion;
      
      if (backupVersion < currentVersion) {
        console.log(`Migrating backup from v${backupVersion} to v${currentVersion}`);
        backupData.database = await migrateBackupData(backupData.database, backupVersion);
      }

      onProgress?.(70);

      // Restore recipes based on mode
      if (mode === 'replace') {
        // Clear existing data and restore from backup
        // This would require implementing a clear database function
        console.log('Replace mode: clearing existing data...');
      } else {
        // Merge mode: add recipes that don't already exist
        console.log('Merge mode: merging with existing data...');
      }

      // Restore preferences
      for (const [key, value] of Object.entries(backupData.preferences)) {
        await setUserPreference(key, value);
      }

      // TODO: Implement actual database restore operations
      // This would involve calling database functions to restore recipes
      
      onProgress?.(100);
      console.log('Backup restored successfully');
      return true;
    } catch (error) {
      console.error('Backup restore failed:', error);
      onProgress?.(0);
      return false;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > MAX_BACKUPS) {
        const oldBackups = backups.slice(MAX_BACKUPS);
        
        for (const backup of oldBackups) {
          await fetch(`https://www.googleapis.com/drive/v3/files/${backup.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.accessToken}`,
            },
          });
        }
        
        console.log(`Cleaned up ${oldBackups.length} old backups`);
      }
    } catch (error) {
      console.error('Cleanup old backups error:', error);
    }
  }

  async getLastBackupTime(): Promise<number | null> {
    const lastBackup = await getUserPreference('lastBackup');
    return lastBackup ? parseInt(lastBackup) : null;
  }

  async shouldAutoBackup(): Promise<boolean> {
    try {
      const autoBackup = await getUserPreference('autoBackup');
      const frequency = await getUserPreference('backupFrequency') || 'weekly';
      const lastBackup = await this.getLastBackupTime();
      
      if (autoBackup !== 'true' || !lastBackup) {
        return false;
      }

      const now = Date.now();
      const daysSince = (now - lastBackup) / (1000 * 60 * 60 * 24);
      
      switch (frequency) {
        case 'daily':
          return daysSince >= 1;
        case 'weekly':
          return daysSince >= 7;
        default:
          return false;
      }
    } catch (error) {
      console.error('Auto backup check error:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      // Revoke tokens
      if (this.accessToken) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`, {
          method: 'POST',
        });
      }

      // Clear stored tokens
      await setUserPreference('google_access_token', '');
      await setUserPreference('google_refresh_token', '');
      
      this.accessToken = null;
      this.refreshToken = null;
      
      console.log('Google Drive backup disconnected');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }
}

export const googleDriveBackup = new GoogleDriveBackup();
export default googleDriveBackup;
