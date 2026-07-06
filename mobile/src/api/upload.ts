import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE } from './client';

export const uploadApi = {
  uploadAvatar: async (uri: string, mimeType?: string): Promise<{ url: string }> => {
    const token = await AsyncStorage.getItem('token');
    const cacheUri = FileSystem.cacheDirectory + 'avatar_upload';
    await FileSystem.copyAsync({ from: uri, to: cacheUri });
    try {
      const res = await FileSystem.uploadAsync(`${API_BASE}/api/upload/avatar`, cacheUri, {
        httpMethod: 'POST',
        fieldName: 'file',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        mimeType: mimeType || 'image/jpeg',
      });
      if (res.status !== 200) {
        throw new Error(res.body || 'Upload failed');
      }
      return JSON.parse(res.body);
    } finally {
      FileSystem.deleteAsync(cacheUri, { idempotent: true }).catch(() => {});
    }
  },
};
