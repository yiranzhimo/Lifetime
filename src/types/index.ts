// 用户设置
export interface UserSettings {
  birthday?: string; // ISO date string
  lifeExpectancy?: number; // 预期寿命（年）
}

// 愿望清单相关
export interface WishRecord {
  id: string;
  content: string;
  createdAt: string;
}

export interface WishItem {
  id: string;
  title: string;
  completed: boolean;
  tags: string[]; // 标签列表
  records: WishRecord[]; // 时间线记录
  createdAt: string;
  completedAt?: string;
}

export interface WishList {
  id: string;
  name: string;
  items: WishItem[];
  createdAt: string;
}

// 结绳记事
export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  tags: string[]; // 标签列表
  createdAt: string;
}

