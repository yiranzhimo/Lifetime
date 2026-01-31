'use client';

import { useMemo } from 'react';

interface LifeMatrixProps {
  birthday?: string;
  lifeExpectancy?: number;
}

export default function LifeMatrix({ birthday, lifeExpectancy }: LifeMatrixProps) {
  const { matrix, percentage, currentYearIndex } = useMemo(() => {
    if (!birthday || !lifeExpectancy) {
      return { matrix: [], percentage: 0, currentYearIndex: -1 };
    }

    const now = new Date();
    const [year, month, day] = birthday.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const currentAge = now.getFullYear() - birthDate.getFullYear();
    
    // 调整年龄：如果今年生日还没到，年龄减1
    const thisYearBirthday = new Date(now.getFullYear(), month - 1, day);
    const actualAge = now < thisYearBirthday ? currentAge - 1 : currentAge;
    
    // 计算当前年份在预期寿命中的位置（从0开始）
    const currentYearIndex = actualAge;
    
    // 创建矩阵：每年一个点
    const matrix = Array.from({ length: lifeExpectancy }, (_, index) => {
      if (index < actualAge) {
        return 'passed'; // 已度过
      } else if (index === actualAge) {
        return 'current'; // 正在度过
      } else {
        return 'future'; // 未度过
      }
    });

    // 计算进度百分比
    const percentage = lifeExpectancy > 0 ? (actualAge / lifeExpectancy) * 100 : 0;

    return { matrix, percentage, currentYearIndex };
  }, [birthday, lifeExpectancy]);

  // 如果缺少必要参数，显示提示
  if (!birthday || !lifeExpectancy) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center text-gray-500 text-sm">
        请设置出生日期和预期寿命以查看人生矩阵
      </div>
    );
  }

  // 计算矩阵的列数（每行显示多少个点）
  // 根据总数量动态调整，让矩阵尽量接近正方形
  let columns = 20; // 默认每行20个
  if (lifeExpectancy <= 20) {
    columns = lifeExpectancy;
  } else if (lifeExpectancy <= 50) {
    columns = 10;
  } else if (lifeExpectancy <= 100) {
    columns = 20;
  } else {
    columns = 25; // 超过100年，每行25个
  }

  return (
    <div className="relative bg-white rounded-lg border-2 border-gray-300 p-6 mb-4 shadow-sm">
      {/* 标题 */}
      <div className="text-base font-semibold text-gray-800 mb-4">人生矩阵</div>
      
      {/* 右上角百分比 */}
      <div className="absolute top-6 right-6 text-xl font-bold text-gray-900 bg-blue-50 px-3 py-1 rounded">
        {percentage.toFixed(1)}%
      </div>
      
      {/* 矩阵网格 */}
      <div className="mt-6" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: '1px' }}>
        {matrix.map((status, index) => (
          <div
            key={index}
            className={`w-full aspect-square rounded-sm transition-colors ${
              status === 'passed'
                ? 'bg-black'
                : status === 'current'
                ? 'bg-green-500'
                : 'bg-gray-300'
            }`}
            title={`第 ${index + 1} 年`}
            style={{ minWidth: '1px', minHeight: '1px' }}
          />
        ))}
      </div>
      
      {/* 图例 */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-black rounded-sm"></div>
          <span>已度过</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span>今年</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
          <span>未来</span>
        </div>
      </div>
    </div>
  );
}

