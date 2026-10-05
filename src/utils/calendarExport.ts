import { AssignedShift, Staff } from '../types/shift';

interface ExportCalendarOptions {
  calendarTitle?: string;
  storeName?: string;
  storeLocation?: string;
}

/**
 * Formats a date string (YYYY-MM-DD) and time (HH:mm) into iCalendar local format: YYYYMMDDTHHmmSS
 */
function formatIcsDateTime(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const [hour, minute] = timeStr.split(':');
  const cleanHour = (hour || '00').padStart(2, '0');
  const cleanMin = (minute || '00').padStart(2, '0');
  return `${year}${month}${day}T${cleanHour}${cleanMin}00`;
}

/**
 * Formats current UTC timestamp for DTSTAMP: YYYYMMDDTHHmmSSZ
 */
function getUtcStamp(): string {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Escapes special characters for iCalendar text values (commas, semicolons, backslashes, newlines)
 */
function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generates an iCalendar (.ics) string compatible with Google Calendar, Microsoft Outlook, and Apple Calendar
 */
export function generateIcsCalendar(
  shifts: AssignedShift[],
  staffList: Staff[],
  options: ExportCalendarOptions = {}
): string {
  const storeName = options.storeName || 'さんど亭ガーデン';
  const calendarTitle = options.calendarTitle || `${storeName} シフト表`;
  const location = options.storeLocation || 'さんど亭ガーデン（店舗）';
  const dtStamp = getUtcStamp();

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SandoteiGarden//ShiftLine Manager//JA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendarTitle)}`,
    'X-WR-TIMEZONE:Asia/Tokyo',
    // Standard VTIMEZONE component for Asia/Tokyo (JST, UTC+9, no DST)
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Tokyo',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0900',
    'TZOFFSETTO:+0900',
    'TZNAME:JST',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  shifts.forEach(shift => {
    const staff = staffList.find(s => s.id === shift.staffId);
    const staffName = staff?.name || 'スタッフ';
    const roleName = shift.role === 'kitchen' ? '厨房 (キッチン)' : '接客 (ホール)';
    const slotName = shift.slot === 'lunch' ? 'ランチ帯' : 'ディナー帯';

    const startDateTime = formatIcsDateTime(shift.date, shift.startTime || (shift.slot === 'lunch' ? '10:30' : '17:00'));
    const endDateTime = formatIcsDateTime(shift.date, shift.endTime || (shift.slot === 'lunch' ? '15:00' : '23:00'));

    const summary = `${staffName} 【${slotName}・${shift.role === 'kitchen' ? '厨房' : 'ホール'}】勤務`;
    const description = [
      `【${storeName} シフト】`,
      `担当スタッフ: ${staffName}`,
      `担当職種: ${roleName}`,
      `時間帯: ${slotName} (${shift.startTime}〜${shift.endTime})`,
      `稼働時間: ${shift.hours}時間`,
      staff?.hourlyWage ? `時給: ¥${staff.hourlyWage.toLocaleString()}` : '',
      shift.note ? `備考: ${shift.note}` : ''
    ].filter(Boolean).join('\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${shift.id}-${shift.date}@sakurado.shiftline`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART;TZID=Asia/Tokyo:${startDateTime}`);
    lines.push(`DTEND;TZID=Asia/Tokyo:${endDateTime}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    lines.push(`LOCATION:${escapeIcsText(location)}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('TRANSP:OPAQUE');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Initiates browser download of .ics file
 */
export function downloadIcsFile(icsContent: string, fileName: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName.endsWith('.ics') ? fileName : `${fileName}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a web link to add a single shift directly to Google Calendar in browser
 */
export function createGoogleCalendarLink(
  shift: AssignedShift,
  staff?: Staff,
  storeName: string = 'さんど亭ガーデン'
): string {
  const staffName = staff?.name || '';
  const roleName = shift.role === 'kitchen' ? '厨房' : 'ホール';
  const slotName = shift.slot === 'lunch' ? 'ランチ' : 'ディナー';

  const title = encodeURIComponent(`${storeName} 【${slotName}・${roleName}】${staffName ? `(${staffName})` : ''}`);
  
  // Format for Google Calendar web URL: YYYYMMDDTHHmmSSZ (or YYYYMMDDTHHmmSS in local time with ctz)
  const [year, month, day] = shift.date.split('-');
  const [startH, startM] = (shift.startTime || '17:00').split(':');
  const [endH, endM] = (shift.endTime || '23:00').split(':');

  const startUtc = `${year}${month}${day}T${startH}${startM}00`;
  const endUtc = `${year}${month}${day}T${endH}${endM}00`;

  const details = encodeURIComponent(
    `【${storeName} シフト出勤】\n担当: ${roleName}\n時間: ${shift.startTime}〜${shift.endTime} (${shift.hours}h)\n${shift.note ? `メモ: ${shift.note}` : ''}`
  );
  const location = encodeURIComponent(storeName);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&ctz=Asia/Tokyo&details=${details}&location=${location}`;
}
