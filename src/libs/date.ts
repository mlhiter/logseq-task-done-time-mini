// 日期格式映射到正则表达式
const EWEEKDAY = '(Mon|Tue|Wed|Thu|Fri|Sat|Sun)'
const EEEEWEEKDAY = '(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)'

const dateFormatPatterns: Record<string, string> = {
  'E, MM/dd/yyyy': `${EWEEKDAY}, \\d{2}/\\d{2}/\\d{4}`,
  'E, dd-MM-yyyy': `${EWEEKDAY}, \\d{2}-\\d{2}-\\d{4}`,
  'E, dd.MM.yyyy': `${EWEEKDAY}, \\d{2}\\.\\d{2}\\.\\d{4}`,
  'E, yyyy/MM/dd': `${EWEEKDAY}, \\d{4}/\\d{2}/\\d{2}`,

  'EEE, MM/dd/yyyy': `${EWEEKDAY}, \\d{2}/\\d{2}/\\d{4}`,
  'EEE, dd-MM-yyyy': `${EWEEKDAY}, \\d{2}-\\d{2}-\\d{4}`,
  'EEE, dd.MM.yyyy': `${EWEEKDAY}, \\d{2}\\.\\d{2}\\.\\d{4}`,
  'EEE, yyyy/MM/dd': `${EWEEKDAY}, \\d{4}/\\d{2}/\\d{2}`,

  'EEEE, MM/dd/yyyy': `${EEEEWEEKDAY}, \\d{2}/\\d{2}/\\d{4}`,
  'EEEE, dd-MM-yyyy': `${EEEEWEEKDAY}, \\d{2}-\\d{2}-\\d{4}`,
  'EEEE, dd.MM.yyyy': `${EEEEWEEKDAY}, \\d{2}\\.\\d{2}\\.\\d{4}`,
  'EEEE, yyyy/MM/dd': `${EEEEWEEKDAY}, \\d{4}/\\d{2}/\\d{2}`,

  'MM-dd-yyyy': '\\w{2}-\\d{2}-\\d{4}',
  'MM/dd/yyyy': '\\w{2}/\\d{2}/\\d{4}',
  MM_dd_yyyy: '\\d{2}_\\d{2}_\\d{4}',

  'MMM do, yyyy': '\\w{3} \\w{3,4}, \\d{4}',

  'MMMM do, yyyy': '\\w{4,} \\w{3,4}, \\d{4}',

  'dd-MM-yyyy': '\\d{2}-\\d{2}-\\d{4}',

  'do MMM yyyy': '\\w{3,4} \\w{3} \\d{4}',
  'do MMMM yyyy': '\\w{3,4} \\w{4,} \\d{4}',

  'yyyy-MM-dd': '\\d{4}-\\d{2}-\\d{2}',
  'yyyy-MM-dd EEEE': '\\d{4}-\\d{2}-\\d{2} \\w{4,}',
  'yyyy/MM/dd EEEE': '\\d{4}/\\d{2}/\\d{2} \\w{4,}',
  'yyyy/MM/dd': '\\d{4}/\\d{2}/\\d{2}',
  yyyyMMdd: '\\d{8}',
  yyyy_MM_dd: '\\d{4}_\\d{2}_\\d{2}',
  yyyy年MM月dd日: '\\d{4}年\\d{2}月\\d{2}日',
}

// 根据用户的日期格式生成正则表达式
export function getDatePattern(preferredDateFormat: string): string {
  return dateFormatPatterns[preferredDateFormat] || '\\d{4}-\\d{2}-\\d{2}'
}
