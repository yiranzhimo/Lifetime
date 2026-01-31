'use client';

import { useStorage } from '@/hooks/useStorage';
import CountdownTimer from '@/components/CountdownTimer';
import WishListManager from '@/components/WishListManager';
import DailyRecord from '@/components/DailyRecord';
import DataManager from '@/components/DataManager';

export default function Home() {
  const {
    settings,
    wishLists,
    dailyRecords,
    saveSettings,
    saveWishLists,
    saveDailyRecords,
    loading,
  } = useStorage();

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center py-20">
          <div className="text-gray-600">加载中...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">人生追踪器</h1>
          <p className="text-gray-600">记录生活，珍惜当下</p>
        </header>

        {/* 三个功能模块 */}
        <div className="space-y-6">
          {/* 人生倒计时 */}
          <CountdownTimer
            settings={settings}
            onSettingsChange={saveSettings}
          />

          {/* 愿望清单 */}
          <WishListManager
            wishLists={wishLists}
            onWishListsChange={saveWishLists}
          />

          {/* 结绳记事 */}
          <DailyRecord
            records={dailyRecords}
            onRecordsChange={saveDailyRecords}
          />

          {/* 数据管理 */}
          <DataManager />
        </div>

        {/* 页脚 */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>所有数据保存在浏览器本地存储中，建议定期导出备份</p>
        </footer>
      </div>
    </main>
  );
}