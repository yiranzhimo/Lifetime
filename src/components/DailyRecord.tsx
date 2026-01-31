'use client';

import { useState, useEffect, useMemo } from 'react';
import { DailyRecord as DailyRecordType } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';

interface DailyRecordProps {
  records: DailyRecordType[];
  onRecordsChange: (records: DailyRecordType[]) => void;
}

export default function DailyRecord({ records, onRecordsChange }: DailyRecordProps) {
  const [today, setToday] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [todayContent, setTodayContent] = useState('');
  const [todayTags, setTodayTags] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<'write' | 'view'>('write');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 加载今天的记录
  useEffect(() => {
    const todayRecord = records.find(r => r.date === today);
    if (todayRecord) {
      setTodayContent(todayRecord.content);
      setTodayTags((todayRecord.tags || []).join(' '));
    } else {
      setTodayContent('');
      setTodayTags('');
    }
  }, [records, today]);

  // 获取所有唯一的标签
  const allTags = useMemo(() => {
    return Array.from(
      new Set(
        records
          .flatMap(r => r.tags || [])
          .filter(tag => tag && tag.length > 0)
      )
    ).sort();
  }, [records]);

  // 搜索和筛选记录
  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // 按标签筛选
    if (selectedTag) {
      filtered = filtered.filter(r =>
        (r.tags || []).some(tag => tag === selectedTag)
      );
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.content.toLowerCase().includes(query) ||
        (r.tags || []).some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 按日期倒序排列
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [records, selectedTag, searchQuery]);

  // 保存今天的记录
  const handleSaveToday = () => {
    if (!todayContent.trim()) return;

    // 解析标签（用空格或逗号分隔）
    const tags = todayTags
      .split(/[,\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.startsWith('#'))
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

    const existingIndex = records.findIndex(r => r.date === today);
    let updated: DailyRecordType[];

    if (existingIndex >= 0) {
      // 更新现有记录
      updated = records.map((r, index) =>
        index === existingIndex
          ? { ...r, content: todayContent.trim(), tags: tags }
          : r
      );
    } else {
      // 创建新记录
      const newRecord: DailyRecordType = {
        id: uuidv4(),
        date: today,
        content: todayContent.trim(),
        tags: tags,
        createdAt: new Date().toISOString(),
      };
      updated = [...records, newRecord];
    }

    onRecordsChange(updated);
    alert('保存成功！');
  };

  // 删除记录
  const handleDeleteRecord = (recordId: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      const updated = records.filter(r => r.id !== recordId);
      onRecordsChange(updated);
      
      // 如果删除的是今天的记录，清空输入框
      const deletedRecord = records.find(r => r.id === recordId);
      if (deletedRecord && deletedRecord.date === today) {
        setTodayContent('');
        setTodayTags('');
      }
    }
  };

  // 获取选中日期的记录
  const selectedRecord = records.find(r => r.date === selectedDate);

  // 获取所有有记录的日期（按日期倒序）
  const recordDates = [...records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(r => r.date);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">结绳记事</h2>

      {/* 模式切换 */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setViewMode('write')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'write'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          今日记录
        </button>
        <button
          type="button"
          onClick={() => setViewMode('view')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            viewMode === 'view'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          查看历史
        </button>
      </div>

      {/* 今日记录模式 */}
      {viewMode === 'write' && (
        <div>
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              今天是：{format(parseISO(today), 'yyyy年MM月dd日 EEEE')}
            </div>
            <textarea
              value={todayContent}
              onChange={(e) => setTodayContent(e.target.value)}
              placeholder="今天发生了什么？记录下来吧..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
              rows={10}
            />
            <input
              type="text"
              value={todayTags}
              onChange={(e) => setTodayTags(e.target.value)}
              placeholder="标签（用空格或逗号分隔，例如：#工作 #生活）"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveToday}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              保存今日记录
            </button>
            {records.find(r => r.date === today) && (
              <button
                type="button"
                onClick={() => handleDeleteRecord(records.find(r => r.date === today)!.id)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                删除今日记录
              </button>
            )}
          </div>
        </div>
      )}

      {/* 查看历史模式 */}
      {viewMode === 'view' && (
        <div>
          {/* 搜索和标签筛选 */}
          <div className="mb-4 space-y-3">
            {/* 搜索框 */}
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索记录内容或标签..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 标签筛选 */}
            {allTags.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">按标签筛选：</div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTag === null
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    全部
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedTag === tag
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 搜索结果或日期选择 */}
          {searchQuery.trim() || selectedTag ? (
            // 显示搜索结果
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-2">
                找到 {filteredRecords.length} 条记录
              </div>
              {filteredRecords.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  没有找到匹配的记录
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-semibold text-gray-700">
                        {format(parseISO(record.date), 'yyyy年MM月dd日 EEEE')}
                      </div>
                      <div className="flex items-center gap-2">
                        {record.tags && record.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {record.tags.map((tag, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedTag(tag);
                                  setSearchQuery('');
                                }}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-800 whitespace-pre-wrap">{record.content}</div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // 显示日期选择模式
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择日期查看记录
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 快速选择有记录的日期 */}
              {recordDates.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">有记录的日期：</div>
                  <div className="flex flex-wrap gap-2">
                    {recordDates.slice(0, 10).map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          selectedDate === date
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {format(parseISO(date), 'MM/dd')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 显示选中日期的记录 */}
              {selectedRecord ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">
                      {format(parseISO(selectedRecord.date), 'yyyy年MM月dd日 EEEE')}
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {selectedRecord.tags.map((tag, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedTag(tag);
                                setSearchQuery('');
                              }}
                              className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(selectedRecord.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="text-gray-800 whitespace-pre-wrap">{selectedRecord.content}</div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  {selectedDate === today ? '今天还没有记录，去写点什么吧！' : '这一天还没有记录'}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
