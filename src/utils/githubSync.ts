/**
 * GitHub 同步工具
 * 使用 GitHub REST API 实现数据同步
 */

export interface GitHubConfig {
  owner: string;      // GitHub 用户名或组织名
  repo: string;       // 仓库名
  path: string;       // 数据文件路径，如 'data/life-tracker.json'
  token: string;      // GitHub Personal Access Token
  branch?: string;    // 分支名，默认为 'main'
}

/**
 * 从当前 URL 自动检测 GitHub 仓库信息
 * 适用于 GitHub Pages 部署
 */
export function detectGitHubRepoFromURL(): { owner: string; repo: string } | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    // GitHub Pages 格式 1: username.github.io/repo-name
    // 例如: yiranzhimo.github.io/Lifetime
    const githubIoMatch = hostname.match(/^([^.]+)\.github\.io$/);
    if (githubIoMatch) {
      const owner = githubIoMatch[1];
      // 从 pathname 提取仓库名（去掉开头的 /）
      const repo = pathname.split('/').filter(Boolean)[0] || owner;
      return { owner, repo };
    }
    
    // GitHub Pages 格式 2: 自定义域名（无法自动检测）
    // 返回 null，需要手动配置
    
    return null;
  } catch (error) {
    console.error('Error detecting GitHub repo:', error);
    return null;
  }
}

export interface GitHubFileContent {
  content: string;
  sha?: string;       // 文件 SHA，用于更新文件
}

/**
 * 将内容编码为 Base64（GitHub API 要求）
 */
function encodeBase64(content: string): string {
  if (typeof window === 'undefined') {
    // Node.js 环境
    return Buffer.from(content, 'utf-8').toString('base64');
  } else {
    // 浏览器环境
    return btoa(unescape(encodeURIComponent(content)));
  }
}

/**
 * 解码 Base64 内容
 */
function decodeBase64(encoded: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(encoded, 'base64').toString('utf-8');
  } else {
    return decodeURIComponent(escape(atob(encoded)));
  }
}

/**
 * 获取文件内容
 */
export async function getGitHubFile(config: GitHubConfig): Promise<GitHubFileContent | null> {
  try {
    const branch = config.branch || 'main';
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${branch}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 404) {
      // 文件不存在
      return null;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`GitHub API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: decodeBase64(data.content.replace(/\n/g, '')),
      sha: data.sha,
    };
  } catch (error: any) {
    console.error('Error getting GitHub file:', error);
    throw error;
  }
}

/**
 * 创建或更新文件
 */
export async function putGitHubFile(
  config: GitHubConfig,
  content: string,
  sha?: string,
  message: string = 'Update life tracker data'
): Promise<void> {
  try {
    const branch = config.branch || 'main';
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
    
    const body: any = {
      message,
      content: encodeBase64(content),
      branch,
    };

    // 如果提供了 SHA，说明是更新现有文件
    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`GitHub API error: ${error.message || response.statusText}`);
    }
  } catch (error: any) {
    console.error('Error putting GitHub file:', error);
    throw error;
  }
}

/**
 * 验证 GitHub 配置和权限
 */
export async function validateGitHubConfig(config: GitHubConfig): Promise<{ valid: boolean; error?: string }> {
  try {
    // 尝试获取仓库信息来验证 token 和权限
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (response.status === 401) {
      return { valid: false, error: 'Token 无效或已过期' };
    }

    if (response.status === 403) {
      return { valid: false, error: 'Token 权限不足' };
    }

    if (response.status === 404) {
      return { valid: false, error: '仓库不存在或无访问权限' };
    }

    if (!response.ok) {
      return { valid: false, error: `验证失败: ${response.statusText}` };
    }

    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: error.message || '网络错误' };
  }
}

