'use client';

import { useState } from 'react';
import { WishList, WishItem, WishRecord } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface WishListManagerProps {
  wishLists: WishList[];
  onWishListsChange: (lists: WishList[]) => void;
}

export default function WishListManager({ wishLists, onWishListsChange }: WishListManagerProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(
    wishLists.length > 0 ? wishLists[0].id : null
  );
  const [newListName, setNewListName] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemTags, setNewItemTags] = useState('');
  const [editingItem, setEditingItem] = useState<{ listId: string; itemId: string } | null>(null);
  const [newRecordContent, setNewRecordContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');

  const selectedList = wishLists.find(list => list.id === selectedListId);
  
  // 获取当前清单中所有唯一的标签
  const allTags = selectedList
    ? Array.from(
        new Set(
          selectedList.items
            .flatMap(item => item.tags || [])
            .filter(tag => tag && tag.length > 0)
        )
      ).sort()
    : [];

  // 根据选中的标签筛选项目
  const filteredItems = selectedList
    ? selectedTag
      ? selectedList.items.filter(item =>
          (item.tags || []).some(tag => tag === selectedTag)
        )
      : selectedList.items
    : [];

  const handleCreateList = () => {
    if (!newListName.trim()) return;

    const newList: WishList = {
      id: uuidv4(),
      name: newListName.trim(),
      items: [],
      createdAt: new Date().toISOString(),
    };

    onWishListsChange([...wishLists, newList]);
    setSelectedListId(newList.id);
    setNewListName('');
  };

  const handleDeleteList = (listId: string) => {
    const updated = wishLists.filter(list => list.id !== listId);
    onWishListsChange(updated);
    if (selectedListId === listId) {
      setSelectedListId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleStartRename = (listId: string, currentName: string) => {
    setEditingListId(listId);
    setEditingListName(currentName);
  };

  const handleSaveRename = (listId: string) => {
    if (!editingListName.trim()) {
      setEditingListId(null);
      return;
    }

    const updated = wishLists.map(list =>
      list.id === listId
        ? { ...list, name: editingListName.trim() }
        : list
    );

    onWishListsChange(updated);
    setEditingListId(null);
    setEditingListName('');
  };

  const handleCancelRename = () => {
    setEditingListId(null);
    setEditingListName('');
  };

  const handleAddItem = () => {
    if (!newItemTitle.trim() || !selectedListId) return;

    // 解析标签（用空格或逗号分隔）
    const tags = newItemTags
      .split(/[,\s]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.startsWith('#'))
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

    const newItem: WishItem = {
      id: uuidv4(),
      title: newItemTitle.trim(),
      completed: false,
      tags: tags || [],
      records: [],
      createdAt: new Date().toISOString(),
    };

    const updated = wishLists.map(list =>
      list.id === selectedListId
        ? { ...list, items: [...list.items, newItem] }
        : list
    );

    onWishListsChange(updated);
    setNewItemTitle('');
    setNewItemTags('');
  };

  const handleToggleItem = (listId: string, itemId: string) => {
    const updated = wishLists.map(list =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId
                ? {
                    ...item,
                    completed: !item.completed,
                    completedAt: !item.completed ? new Date().toISOString() : undefined,
                  }
                : item
            ),
          }
        : list
    );

    onWishListsChange(updated);
  };

  const handleAddRecord = (listId: string, itemId: string) => {
    if (!newRecordContent.trim()) return;

    const newRecord: WishRecord = {
      id: uuidv4(),
      content: newRecordContent.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = wishLists.map(list =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId
                ? { ...item, records: [...(item.records || []), newRecord] }
                : item
            ),
          }
        : list
    );

    onWishListsChange(updated);
    setNewRecordContent('');
    setEditingItem(null);
  };

  const handleDeleteItem = (listId: string, itemId: string) => {
    const updated = wishLists.map(list =>
      list.id === listId
        ? { ...list, items: list.items.filter(item => item.id !== itemId) }
        : list
    );

    onWishListsChange(updated);
  };

  const handleDeleteRecord = (listId: string, itemId: string, recordId: string) => {
    const updated = wishLists.map(list =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map(item =>
              item.id === itemId
                ? { ...item, records: (item.records || []).filter(r => r.id !== recordId) }
                : item
            ),
          }
        : list
    );

    onWishListsChange(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">愿望清单</h2>

      {/* 创建新清单 */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
          placeholder="新建清单名称..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleCreateList();
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
        >
          创建清单
        </button>
      </div>

      {/* 清单列表 */}
      {wishLists.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {wishLists.map((list) => (
            <div
              key={list.id}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedListId === list.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {editingListId === list.id ? (
                // 编辑模式
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editingListName}
                    onChange={(e) => setEditingListName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveRename(list.id);
                      } else if (e.key === 'Escape') {
                        handleCancelRename();
                      }
                    }}
                    onBlur={() => handleSaveRename(list.id)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveRename(list.id)}
                    className="text-green-600 hover:text-green-700 text-sm"
                    title="保存"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelRename}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="取消"
                  >
                    ×
                  </button>
                </div>
              ) : (
                // 显示模式
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedListId(list.id);
                      setSelectedTag(null); // 切换清单时重置筛选
                    }}
                    className="cursor-pointer"
                  >
                    {list.name}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStartRename(list.id, list.name);
                    }}
                    className="ml-1 text-gray-500 hover:text-gray-700 cursor-pointer text-xs"
                    title="重命名"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    className="ml-1 text-red-500 hover:text-red-700 cursor-pointer"
                    title="删除"
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 当前清单内容 */}
      {selectedList && (
        <div>
          {/* 添加新项目 */}
          <div className="mb-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="添加新愿望..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddItem();
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
              >
                添加
              </button>
            </div>
            <input
              type="text"
              value={newItemTags}
              onChange={(e) => setNewItemTags(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              placeholder="标签（用空格或逗号分隔，例如：#Research #Work）"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* 项目列表 */}
          <div className="space-y-2">
            {filteredItems.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {selectedList.items.length === 0
                  ? '暂无愿望，开始添加吧！'
                  : selectedTag
                  ? `没有找到标签为 "${selectedTag}" 的愿望`
                  : '暂无愿望，开始添加吧！'}
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg ${
                    item.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleItem(selectedList.id, item.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <div
                          className={`text-lg font-medium ${
                            item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                          }`}
                        >
                          {item.title}
                        </div>
                        {/* 标签显示 */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {item.tags.map((tag, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setSelectedTag(tag)}
                                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 时间线记录 */}
                      {item.records && item.records.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-semibold text-gray-600 mb-2">记录时间线：</div>
                          {item.records
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((record) => (
                              <div
                                key={record.id}
                                className="relative pl-4 border-l-2 border-gray-300 pb-2"
                              >
                                <div className="absolute left-[-6px] top-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                                <div className="text-xs text-gray-500 mb-1">
                                  {format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm')}
                                </div>
                                <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                  {record.content}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(selectedList.id, item.id, record.id)}
                                  className="mt-1 text-xs text-red-500 hover:text-red-700"
                                >
                                  删除
                                </button>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* 添加新记录 */}
                      {editingItem?.listId === selectedList.id &&
                        editingItem?.itemId === item.id && (
                          <div className="mt-3">
                            <textarea
                              value={newRecordContent}
                              onChange={(e) => setNewRecordContent(e.target.value)}
                              placeholder="记录一些想法..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                            />
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleAddRecord(selectedList.id, item.id)}
                                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                添加记录
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItem(null);
                                  setNewRecordContent('');
                                }}
                                className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                      {!editingItem && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem({ listId: selectedList.id, itemId: item.id });
                            setNewRecordContent('');
                          }}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          记录
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(selectedList.id, item.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {wishLists.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          创建你的第一个愿望清单吧！
        </div>
      )}
    </div>
  );
}
