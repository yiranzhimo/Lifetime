import { useState, useEffect, useCallback } from 'react';
import { UserSettings, WishList, DailyRecord } from '@/types';
import { GitHubConfig, getGitHubFile, putGitHubFile, validateGitHubConfig } from '@/utils/githubSync';

const STORAGE_KEYS = {
  settings: 'life-tracker-settings',
  wishLists: 'life-tracker-wish-lists',
  dailyRecords: 'life-tracker-daily-records',
  githubConfig: 'life-tracker-github-config',
  githubFileSha: 'life-tracker-github-sha',
};

export function useStorage() {
  const [settings, setSettingsState] = useState<UserSettings>({});
  const [wishLists, setWishListsState] = useState<WishList[]>([]);
  const [dailyRecords, setDailyRecordsState] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [githubConfig, setGitHubConfigState] = useState<GitHubConfig | null>(null);
  const [syncing, setSyncing] = useState(false);

  // 从 localStorage 读取数据
  const loadData = (key: keyof typeof STORAGE_KEYS) => {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(STORAGE_KEYS[key]);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return null;
    }
  };

  // 保存数据到 localStorage
  const saveData = (key: keyof typeof STORAGE_KEYS, data: any) => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  };

  // 获取 GitHub 配置
  const getGitHubConfig = (): GitHubConfig | null => {
    try {
      const config = loadData('githubConfig');
      return config as GitHubConfig | null;
    } catch {
      return null;
    }
  };

  // 保存 GitHub 配置
  const saveGitHubConfig = (config: GitHubConfig | null) => {
    if (config) {
      saveData('githubConfig', config);
      setGitHubConfigState(config);
    } else {
      localStorage.removeItem(STORAGE_KEYS.githubConfig);
      localStorage.removeItem(STORAGE_KEYS.githubFileSha);
      setGitHubConfigState(null);
    }
  };

  // 导出所有数据
  const exportData = () => {
    const allData = {
      settings: loadData('settings'),
      wishLists: loadData('wishLists'),
      dailyRecords: loadData('dailyRecords'),
      exportDate: new Date().toISOString(),
    };
    return JSON.stringify(allData, null, 2);
  };

  // 导入数据
  const importData = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) {
        setSettingsState(data.settings);
        saveData('settings', data.settings);
      }
      if (data.wishLists) {
        setWishListsState(data.wishLists);
        saveData('wishLists', data.wishLists);
      }
      if (data.dailyRecords) {
        setDailyRecordsState(data.dailyRecords);
        saveData('dailyRecords', data.dailyRecords);
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  };

  // 同步数据到 GitHub
  const syncToGitHub = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const config = getGitHubConfig();
    if (!config) {
      return { success: false, error: '未配置 GitHub' };
    }

    setSyncing(true);
    try {
      const data = exportData();
      const sha = loadData('githubFileSha') as string | null;
      
      await putGitHubFile(config, data, sha || undefined, `Update life tracker data - ${new Date().toISOString()}`);
      
      // 获取新的 SHA（需要重新获取文件信息）
      const fileInfo = await getGitHubFile(config);
      if (fileInfo?.sha) {
        saveData('githubFileSha', fileInfo.sha);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error syncing to GitHub:', error);
      return { success: false, error: error.message || '同步失败' };
    } finally {
      setSyncing(false);
    }
  }, []);

  // 从 GitHub 同步数据
  const syncFromGitHub = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    const config = getGitHubConfig();
    if (!config) {
      return { success: false, error: '未配置 GitHub' };
    }

    setSyncing(true);
    try {
      const fileInfo = await getGitHubFile(config);
      
      if (!fileInfo) {
        return { success: false, error: 'GitHub 上不存在数据文件' };
      }

      // 导入数据
      const success = importData(fileInfo.content);
      if (success && fileInfo.sha) {
        saveData('githubFileSha', fileInfo.sha);
        return { success: true };
      } else {
        return { success: false, error: '数据格式错误' };
      }
    } catch (error: any) {
      console.error('Error syncing from GitHub:', error);
      return { success: false, error: error.message || '同步失败' };
    } finally {
      setSyncing(false);
    }
  }, [importData]);

  // 加载数据
  useEffect(() => {
    setLoading(true);
    
    // 加载 GitHub 配置
    const config = getGitHubConfig();
    setGitHubConfigState(config);
    
    // 加载设置
    const savedSettings = loadData('settings');
    if (savedSettings) {
      setSettingsState(savedSettings);
    } else {
      const defaultSettings: UserSettings = {
        birthday: '1998-09-29',
        lifeExpectancy: 80,
      };
      setSettingsState(defaultSettings);
      saveData('settings', defaultSettings);
    }

    // 加载愿望清单
    const savedWishLists = loadData('wishLists');
    if (savedWishLists) {
      const migrated = savedWishLists.map((list: any) => ({
        ...list,
        items: (list.items || []).map((item: any) => ({
          ...item,
          tags: item.tags || [],
          records: item.records || (item.notes ? [{
            id: `migrated-${item.id}-${Date.now()}`,
            content: item.notes,
            createdAt: item.createdAt || new Date().toISOString(),
          }] : []),
        })),
      }));
      setWishListsState(migrated);
      saveData('wishLists', migrated);
    } else {
      setWishListsState([]);
    }

    // 加载结绳记事
    const savedRecords = loadData('dailyRecords');
    if (savedRecords) {
      const migrated = savedRecords.map((record: any) => ({
        ...record,
        tags: record.tags || [],
      }));
      setDailyRecordsState(migrated);
      saveData('dailyRecords', migrated);
    } else {
      setDailyRecordsState([]);
    }

    setLoading(false);
  }, []);

  // 保存设置（带自动同步）
  const saveSettings = async (newSettings: UserSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    saveData('settings', updated);
    
    // 如果配置了 GitHub，自动同步
    if (getGitHubConfig()) {
      await syncToGitHub();
    }
  };

  // 保存愿望清单（带自动同步）
  const saveWishLists = async (lists: WishList[]) => {
    setWishListsState(lists);
    saveData('wishLists', lists);
    
    // 如果配置了 GitHub，自动同步
    if (getGitHubConfig()) {
      await syncToGitHub();
    }
  };

  // 保存结绳记事（带自动同步）
  const saveDailyRecords = async (records: DailyRecord[]) => {
    setDailyRecordsState(records);
    saveData('dailyRecords', records);
    
    // 如果配置了 GitHub，自动同步
    if (getGitHubConfig()) {
      await syncToGitHub();
    }
  };

  return {
    settings,
    wishLists,
    dailyRecords,
    saveSettings,
    saveWishLists,
    saveDailyRecords,
    exportData,
    importData,
    loading,
    githubConfig,
    saveGitHubConfig,
    syncToGitHub,
    syncFromGitHub,
    syncing,
  };
}