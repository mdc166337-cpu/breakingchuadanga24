// Bengali number translation
export function toBengaliNumber(num: number | string): string {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bengaliDigits[parseInt(digit, 10)]);
}

// Format date into Bengali e.g. "বুধবার, ৯ সেপ্টেম্বর ২০২৬"
export function getBengaliDate(dateInput: Date | string = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const months = [
    'জানুয়ারি',
    'ফেব্রুয়ারি',
    'মার্চ',
    'এপ্রিল',
    'মে',
    'জুন',
    'জুলাই',
    'আগস্ট',
    'সেপ্টেম্বর',
    'অক্টোবর',
    'নভেম্বর',
    'ডিসেম্বর',
  ];

  const dayName = days[date.getDay()];
  const day = toBengaliNumber(date.getDate());
  const monthName = months[date.getMonth()];
  const year = toBengaliNumber(date.getFullYear());

  return `${dayName}, ${day} ${monthName} ${year}`;
}

// Approximate Bengali calendar date
export function getBengaliCalendarString(): string {
  // 9 September is 25 Bhadra 1433
  const today = new Date();
  const enDay = today.getDate();
  const enMonth = today.getMonth(); // 0-indexed

  // Simple mapping approximation for display
  const bnYear = toBengaliNumber(1433);
  let bnMonth = 'ভাদ্র';
  let bnDate = toBengaliNumber(Math.max(1, enDay + 16));

  if (enMonth === 8) { // September
    bnMonth = 'ভাদ্র';
    bnDate = toBengaliNumber(enDay + 16);
  }

  return `${bnDate} ${bnMonth} ${bnYear} বঙ্গাব্দ`;
}

// Relative time in Bengali e.g. "১০ মিনিট আগে", "২ ঘণ্টা আগে"
export function getRelativeBengaliTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'এইমাত্র';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${toBengaliNumber(diffInMinutes)} মিনিট আগে`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${toBengaliNumber(diffInHours)} ঘণ্টা আগে`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${toBengaliNumber(diffInDays)} দিন আগে`;
  }

  return getBengaliDate(date);
}
