'use client';

import { useState, useEffect } from 'react';
import { useStorage } from '@/hooks/useStorage';
import { GitHubConfig, validateGitHubConfig, detectGitHubRepoFromURL } from '@/utils/githubSync';

export default function DataManager() {
  const {
    exportData,
    importData,
    githubConfig,
    saveGitHubConfig,
    syncToGitHub,
    syncFromGitHub,
    syncing,
  } = useStorage();
  
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // GitHub 配置状态
  const [showGitHubConfig, setShowGitHubConfig] = useState(false);
  
  // 自动检测当前仓库
  const detectedRepo = detectGitHubRepoFromURL();
  
  const [githubForm, setGitHubForm] = useState<GitHubConfig>({
    owner: githubConfig?.owner || detectedRepo?.owner || '',
    repo: githubConfig?.repo || detectedRepo?.repo || '',
    path: githubConfig?.path || 'data/life-tracker.json',
    token: githubConfig?.token || '',
    branch: githubConfig?.branch || 'main',
  });
  const [validating, setValidating] = useState(false);

  // 如果检测到仓库且未配置，自动填充
  useEffect(() => {
    if (detectedRepo && !githubConfig) {
      setGitHubForm(prev => ({
        ...prev,
        owner: prev.owner || detectedRepo.owner,
        repo: prev.repo || detectedRepo.repo,
      }));
    }
  }, [detectedRepo, githubConfig]);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: '数据已导出！' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setMessage({ type: 'error', text: '请先粘贴要导入的数据' });
      return;
    }
    const success = importData(importText);
    if (success) {
      setMessage({ type: 'success', text: '数据导入成功！页面将刷新...' });
      setImportText('');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      setMessage({ type: 'error', text: '数据格式错误，导入失败' });
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">数据管理</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* 导出数据 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">导出数据</h3>
          <p className="text-sm text-gray-600 mb-3">
            将当前所有数据导出为 JSON 文件，可以保存到 GitHub 仓库或其他地方
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            导出数据
          </button>
        </div>

        {/* 导入数据 */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">导入数据</h3>
          <p className="text-sm text-gray-600 mb-3">
            从之前导出的 JSON 文件恢复数据
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择文件或粘贴 JSON 内容
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"
              />
            </div>
            
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="或直接粘贴 JSON 数据..."
              className="w-full h-32 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            >
              导入数据
            </button>
          </div>
        </div>

        {/* GitHub 同步 */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">GitHub 同步</h3>
              <p className="text-sm text-gray-600">
                {githubConfig
                  ? `已配置: ${githubConfig.owner}/${githubConfig.repo}${githubConfig.path ? `/${githubConfig.path}` : ''}`
                  : '配置 GitHub 仓库实现自动同步'}
              </p>
            </div>
            <button
              onClick={() => setShowGitHubConfig(!showGitHubConfig)}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              {showGitHubConfig ? '隐藏' : '配置'}
            </button>
          </div>

          {showGitHubConfig && (
            <div className="space-y-3 p-4 bg-gray-50 rounded">
              {detectedRepo && !githubConfig && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    💡 已自动检测到当前仓库：<strong>{detectedRepo.owner}/{detectedRepo.repo}</strong>
                    <br />
                    <span className="text-xs text-blue-600">只需填写 Token 即可开始使用</span>
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub 用户名/组织
                </label>
                <input
                  type="text"
                  value={githubForm.owner}
                  onChange={(e) => setGitHubForm({ ...githubForm, owner: e.target.value })}
                  placeholder={detectedRepo?.owner || "your-username"}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {detectedRepo && !githubConfig && (
                  <p className="text-xs text-gray-500 mt-1">已自动填充当前仓库信息</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  仓库名
                </label>
                <input
                  type="text"
                  value={githubForm.repo}
                  onChange={(e) => setGitHubForm({ ...githubForm, repo: e.target.value })}
                  placeholder={detectedRepo?.repo || "your-repo"}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {detectedRepo && !githubConfig && (
                  <p className="text-xs text-gray-500 mt-1">已自动填充当前仓库信息</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  文件路径
                </label>
                <input
                  type="text"
                  value={githubForm.path}
                  onChange={(e) => setGitHubForm({ ...githubForm, path: e.target.value })}
                  placeholder="data/life-tracker.json"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">数据文件在仓库中的路径</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分支名
                </label>
                <input
                  type="text"
                  value={githubForm.branch}
                  onChange={(e) => setGitHubForm({ ...githubForm, branch: e.target.value })}
                  placeholder="main"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubForm.token}
                  onChange={(e) => setGitHubForm({ ...githubForm, token: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  需要 <code className="bg-gray-200 px-1 rounded">repo</code> 权限。
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    创建 Token
                  </a>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    setValidating(true);
                    const result = await validateGitHubConfig(githubForm);
                    setValidating(false);
                    if (result.valid) {
                      saveGitHubConfig(githubForm);
                      setMessage({ type: 'success', text: 'GitHub 配置已保存！' });
                      setTimeout(() => setMessage(null), 3000);
                      setShowGitHubConfig(false);
                    } else {
                      setMessage({ type: 'error', text: result.error || '验证失败' });
                      setTimeout(() => setMessage(null), 5000);
                    }
                  }}
                  disabled={validating || !githubForm.owner || !githubForm.repo || !githubForm.token}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {validating ? '验证中...' : '保存配置'}
                </button>

                {githubConfig && (
                  <button
                    onClick={() => {
                      saveGitHubConfig(null);
                      setMessage({ type: 'success', text: 'GitHub 配置已清除' });
                      setTimeout(() => setMessage(null), 3000);
                      setShowGitHubConfig(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    清除配置
                  </button>
                )}
              </div>
            </div>
          )}

          {githubConfig && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={async () => {
                  const result = await syncToGitHub();
                  if (result.success) {
                    setMessage({ type: 'success', text: '数据已同步到 GitHub！' });
                  } else {
                    setMessage({ type: 'error', text: result.error || '同步失败' });
                  }
                  setTimeout(() => setMessage(null), 3000);
                }}
                disabled={syncing}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {syncing ? '同步中...' : '推送到 GitHub'}
              </button>

              <button
                onClick={async () => {
                  const result = await syncFromGitHub();
                  if (result.success) {
                    setMessage({ type: 'success', text: '已从 GitHub 同步数据！页面将刷新...' });
                    setTimeout(() => {
                      window.location.reload();
                    }, 1500);
                  } else {
                    setMessage({ type: 'error', text: result.error || '同步失败' });
                    setTimeout(() => setMessage(null), 3000);
                  }
                }}
                disabled={syncing}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {syncing ? '同步中...' : '从 GitHub 拉取'}
              </button>
            </div>
          )}
        </div>

        <div className="border-t pt-4 text-sm text-gray-500">
          <p>💡 提示：数据默认保存在浏览器本地。配置 GitHub 后，每次保存会自动同步到仓库，实现跨设备数据同步。</p>
        </div>
      </div>
    </div>
  );
}