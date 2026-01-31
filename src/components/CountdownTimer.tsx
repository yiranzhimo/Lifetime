'use client';

import { useState, useEffect } from 'react';
import { calculateCountdown, getYearProgress, getMonthProgress, getWeekProgress, getDayProgress } from '@/utils/dateUtils';
import { UserSettings } from '@/types';
import CircularProgress from './CircularProgress';
import LifeMatrix from './LifeMatrix';

interface CountdownTimerProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
}

export default function CountdownTimer({ settings, onSettingsChange }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState({
    years: 0,
    months: 0,
    weeks: 0,
    days: 0,
    totalDays: 0,
  });
  const [yearProgress, setYearProgress] = useState({ percentage: 0, passed: 0, total: 0 });
  const [monthProgress, setMonthProgress] = useState({ percentage: 0, passed: 0, total: 0 });
  const [weekProgress, setWeekProgress] = useState({ percentage: 0, passed: 0, total: 0 });
  const [dayProgress, setDayProgress] = useState({ percentage: 0, passed: 0, total: 0 });

  useEffect(() => {
    const updateCountdown = () => {
      // 更新人生总倒计时（需要生日和预期寿命）
      if (settings.birthday && settings.lifeExpectancy) {
        // 从 ISO 字符串创建日期，确保使用本地时区
        const birthdayStr = settings.birthday;
        const [year, month, day] = birthdayStr.split('-').map(Number);
        const birthday = new Date(year, month - 1, day); // month 是 0-based
        
        const lifeCountdown = calculateCountdown(birthday, settings.lifeExpectancy);
        setCountdown(lifeCountdown);
      }
      
      // 今年进度不依赖生日，总是可以计算
      setYearProgress(getYearProgress());
      
      // 这些进度不依赖生日设置，总是可以计算
      setMonthProgress(getMonthProgress());
      setWeekProgress(getWeekProgress());
      setDayProgress(getDayProgress());
    };

    updateCountdown();
    // 更频繁地更新，特别是今天的进度需要实时更新
    const interval = setInterval(updateCountdown, 1000 * 60); // 每分钟更新一次

    return () => clearInterval(interval);
  }, [settings.birthday, settings.lifeExpectancy]);
  
  // 实时更新今天的进度（每秒更新）
  useEffect(() => {
    const updateDayProgress = () => {
      setDayProgress(getDayProgress());
    };
    
    updateDayProgress();
    const interval = setInterval(updateDayProgress, 1000); // 每秒更新一次
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">人生倒计时</h2>

      {/* 设置区域 */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            出生日期
          </label>
          <input
            type="date"
            value={settings.birthday || ''}
            onChange={(e) => onSettingsChange({ ...settings, birthday: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            预期寿命（年）
          </label>
          <input
            type="number"
            value={settings.lifeExpectancy ?? 80}
            onChange={(e) => onSettingsChange({ ...settings, lifeExpectancy: parseInt(e.target.value) || 80 })}
            min="1"
            max="150"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* 人生矩阵可视化 */}
      {settings.birthday && settings.lifeExpectancy && (
        <div className="mb-6">
          <LifeMatrix
            birthday={settings.birthday}
            lifeExpectancy={settings.lifeExpectancy}
          />
        </div>
      )}

      {/* 总倒计时 */}
      {settings.birthday && settings.lifeExpectancy && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg text-gray-800 border border-gray-200">
          <div className="text-xs mb-2 text-gray-600">剩余总时间</div>
          <div className="text-3xl font-bold mb-2 text-gray-900">
            {countdown.totalDays.toLocaleString()} 天
          </div>
          <div className="text-base text-gray-700">
            {countdown.years} 年 {countdown.months} 月 {countdown.weeks} 周 {countdown.days} 天
          </div>
        </div>
      )}

      {/* 各时间单位进度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CircularProgress
          percentage={yearProgress.percentage}
          label="年"
        />
        <CircularProgress
          percentage={monthProgress.percentage}
          label="月"
        />
        <CircularProgress
          percentage={weekProgress.percentage}
          label="周"
        />
        <CircularProgress
          percentage={dayProgress.percentage}
          label="天"
        />
      </div>

      {!settings.birthday && (
        <div className="text-center text-gray-500 py-8">
          请先设置出生日期和预期寿命
        </div>
      )}
    </div>
  );
}

