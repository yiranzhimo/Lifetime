import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, addYears, addMonths, addWeeks, addDays } from 'date-fns';

export interface Countdown {
  years: number;
  months: number;
  weeks: number;
  days: number;
  totalDays: number;
}

export function calculateCountdown(birthday: Date, lifeExpectancy: number): Countdown {
  const endDate = addYears(birthday, lifeExpectancy);
  const now = new Date();

  const totalDays = differenceInDays(endDate, now);
  const years = differenceInYears(endDate, now);
  
  // 计算剩余月数（从当前日期加年数后开始）
  const yearEnd = addYears(now, years);
  const months = differenceInMonths(endDate, yearEnd);
  
  // 计算剩余周数（从当前日期加年数月数后开始）
  const monthEnd = addMonths(yearEnd, months);
  const weeks = differenceInWeeks(endDate, monthEnd);
  
  // 计算剩余天数（从当前日期加年数月数周数后开始）
  const weekEnd = addWeeks(monthEnd, weeks);
  const days = differenceInDays(endDate, weekEnd);

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    weeks: Math.max(0, weeks),
    days: Math.max(0, days),
    totalDays: Math.max(0, totalDays),
  };
}

export function getNextYearCountdown(birthday: Date): number {
  const now = new Date();
  // 标准化为当天的0点（使用本地时区）
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 获取生日的月份和日期（使用本地时区）
  const birthdayMonth = birthday.getMonth();
  const birthdayDate = birthday.getDate();
  const currentYear = now.getFullYear();
  
  // 计算今年的生日（标准化为0点）
  const thisYearBirthday = new Date(currentYear, birthdayMonth, birthdayDate);
  
  // 比较日期（只比较年月日）
  const todayTime = today.getTime();
  const thisYearBirthdayTime = thisYearBirthday.getTime();
  
  // 如果今年的生日还没到（不包括今天）
  if (thisYearBirthdayTime > todayTime) {
    // 使用 differenceInDays 计算天数
    return differenceInDays(thisYearBirthday, today);
  }
  
  // 如果今天是生日或生日已过，计算到明年生日的天数
  const nextYearBirthday = new Date(currentYear + 1, birthdayMonth, birthdayDate);
  
  // 直接使用 differenceInDays，它应该能正确处理跨年的情况
  const daysToNextYear = differenceInDays(nextYearBirthday, today);
  
  // 如果计算结果是0或负数，说明有问题，使用手动计算作为备用
  if (daysToNextYear <= 0) {
    // 手动计算毫秒差并转换为天数
    const msPerDay = 24 * 60 * 60 * 1000;
    const msDiff = nextYearBirthday.getTime() - today.getTime();
    const manualDays = Math.round(msDiff / msPerDay);
    
    // 如果手动计算也是0或负数，返回365（一年的标准天数）
    return manualDays > 0 ? manualDays : 365;
  }
  
  return daysToNextYear;
}

export function getNextMonthCountdown(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 计算下个月的第一天
  const nextMonth = addMonths(today, 1);
  const nextMonthStart = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
  
  return differenceInDays(nextMonthStart, today);
}

export function getNextWeekCountdown(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // 计算到下周一的天数
  let daysUntilMonday;
  if (dayOfWeek === 0) {
    // 如果是周日，下周一就是明天
    daysUntilMonday = 1;
  } else if (dayOfWeek === 1) {
    // 如果是周一，下周一就是7天后
    daysUntilMonday = 7;
  } else {
    // 其他情况，计算到下周一的剩余天数
    daysUntilMonday = 8 - dayOfWeek;
  }
  
  const nextMonday = addDays(today, daysUntilMonday);
  return differenceInDays(nextMonday, today);
}

export function getNextDayCountdown(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = addDays(today, 1);
  
  return differenceInDays(tomorrow, today);
}

// 进度计算函数
export interface Progress {
  percentage: number; // 0-100
  passed: number; // 已度过的天数/小时数
  total: number; // 总天数/小时数
}

export function getYearProgress(): Progress {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // 今年1月1日
  const yearStart = new Date(currentYear, 0, 1);
  
  // 明年1月1日
  const yearEnd = new Date(currentYear + 1, 0, 1);
  
  const totalDays = differenceInDays(yearEnd, yearStart);
  const passedDays = differenceInDays(now, yearStart);
  
  return {
    percentage: totalDays > 0 ? Math.min(100, Math.max(0, (passedDays / totalDays) * 100)) : 0,
    passed: Math.max(0, passedDays),
    total: totalDays,
  };
}

export function getMonthProgress(): Progress {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // 本月第一天
  const monthStart = new Date(currentYear, currentMonth, 1);
  
  // 下个月第一天
  const nextMonth = addMonths(monthStart, 1);
  const monthEnd = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
  
  const totalDays = differenceInDays(monthEnd, monthStart);
  const passedDays = differenceInDays(now, monthStart);
  
  return {
    percentage: totalDays > 0 ? Math.min(100, Math.max(0, (passedDays / totalDays) * 100)) : 0,
    passed: Math.max(0, passedDays),
    total: totalDays,
  };
}

export function getWeekProgress(): Progress {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // 计算本周一（如果今天是周日，则上周一）
  let daysToMonday;
  if (dayOfWeek === 0) {
    daysToMonday = -6; // 上周一
  } else {
    daysToMonday = 1 - dayOfWeek; // 本周一
  }
  
  const weekStart = addDays(today, daysToMonday);
  const weekEnd = addDays(weekStart, 7);
  
  const totalDays = differenceInDays(weekEnd, weekStart);
  const passedDays = differenceInDays(now, weekStart);
  
  return {
    percentage: totalDays > 0 ? Math.min(100, Math.max(0, (passedDays / totalDays) * 100)) : 0,
    passed: Math.max(0, passedDays),
    total: totalDays,
  };
}

export function getDayProgress(): Progress {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = addDays(today, 1);
  
  // 计算从今天0点到现在经过的毫秒数
  const passedMs = now.getTime() - today.getTime();
  const totalMs = tomorrow.getTime() - today.getTime();
  
  return {
    percentage: Math.min(100, Math.max(0, (passedMs / totalMs) * 100)),
    passed: passedMs / (1000 * 60 * 60), // 转换为小时
    total: 24, // 24小时
  };
}

