import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from 'lucide-react';

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Parse date string into components (Month 1-12, Day 1-31, Year YYYY, Hour 0-23, Minute 0-59)
function parseDateTimeString(str) {
  const now = new Date();
  if (!str || typeof str !== 'string') {
    return {
      month: now.getMonth() + 1,
      day: now.getDate(),
      year: now.getFullYear(),
      hour: now.getHours(),
      minute: now.getMinutes()
    };
  }

  // Check MM/DD/YYYY HH:mm or MM/DD/YYYY at hh:mm AM/PM
  const matchMMDDYYYY = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(?:at\s+)?(\d{1,2}):(\d{1,2})(?::\d{2})?(?:\s*(AM|PM))?)?/i);
  if (matchMMDDYYYY) {
    const p1 = parseInt(matchMMDDYYYY[1], 10);
    const p2 = parseInt(matchMMDDYYYY[2], 10);
    const yr = parseInt(matchMMDDYYYY[3], 10);
    let hr = matchMMDDYYYY[4] !== undefined ? parseInt(matchMMDDYYYY[4], 10) : now.getHours();
    const mn = matchMMDDYYYY[5] !== undefined ? parseInt(matchMMDDYYYY[5], 10) : now.getMinutes();
    const ampm = matchMMDDYYYY[6] ? matchMMDDYYYY[6].toUpperCase() : null;

    if (ampm === 'PM' && hr < 12) hr += 12;
    if (ampm === 'AM' && hr === 12) hr = 0;

    let month = p1;
    let day = p2;
    if (month > 12 && day <= 12) {
      month = p2;
      day = p1;
    }
    return {
      month: Math.min(Math.max(month, 1), 12),
      day: Math.min(Math.max(day, 1), 31),
      year: yr,
      hour: Math.min(Math.max(hr, 0), 23),
      minute: Math.min(Math.max(mn, 0), 59)
    };
  }

  // Try standard Date parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return {
      month: d.getMonth() + 1,
      day: d.getDate(),
      year: d.getFullYear(),
      hour: d.getHours(),
      minute: d.getMinutes()
    };
  }

  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    year: now.getFullYear(),
    hour: now.getHours(),
    minute: now.getMinutes()
  };
}

function formatUSDateTime(month, day, year, hour, minute) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const yyyy = String(year);
  const hh = String(hour).padStart(2, '0');
  const min = String(minute).padStart(2, '0');
  return `${mm}/${dd}/${yyyy} ${hh}:${min}`;
}

export default function DateTimePicker({ value, onChange, placeholder = 'MM/DD/YYYY HH:mm' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const hoursColRef = useRef(null);
  const minutesColRef = useRef(null);

  const initial = parseDateTimeString(value);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month); // 1-12
  const [selectedDay, setSelectedDay] = useState(initial.day);
  const [selectedHour, setSelectedHour] = useState(initial.hour);
  const [selectedMinute, setSelectedMinute] = useState(initial.minute);

  // Sync internal state when external value changes
  useEffect(() => {
    if (value) {
      const p = parseDateTimeString(value);
      setViewYear(p.year);
      setViewMonth(p.month);
      setSelectedDay(p.day);
      setSelectedHour(p.hour);
      setSelectedMinute(p.minute);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll active hour and minute into view when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hoursColRef.current) {
          const activeEl = hoursColRef.current.querySelector('[data-active="true"]');
          if (activeEl) {
            activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
        if (minutesColRef.current) {
          const activeEl = minutesColRef.current.querySelector('[data-active="true"]');
          if (activeEl) {
            activeEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
          }
        }
      }, 50);
    }
  }, [isOpen]);

  const notifyChange = (m, d, y, h, min) => {
    const formatted = formatUSDateTime(m, d, y, h, min);
    onChange(formatted);
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    setSelectedDay(day);
    notifyChange(viewMonth, day, viewYear, selectedHour, selectedMinute);
  };

  const handleSelectHour = (h) => {
    setSelectedHour(h);
    notifyChange(viewMonth, selectedDay, viewYear, h, selectedMinute);
  };

  const handleSelectMinute = (m) => {
    setSelectedMinute(m);
    notifyChange(viewMonth, selectedDay, viewYear, selectedHour, m);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const y = now.getFullYear();
    const h = now.getHours();
    const min = now.getMinutes();

    setViewYear(y);
    setViewMonth(m);
    setSelectedDay(d);
    setSelectedHour(h);
    setSelectedMinute(min);
    notifyChange(m, d, y, h, min);
  };

  // Build calendar matrix
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth - 1, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();

  const prevMonthDays = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    prevMonthDays.push(daysInPrevMonth - i);
  }

  const currentMonthDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentMonthDays.push(d);
  }

  const totalCells = prevMonthDays.length + currentMonthDays.length;
  const nextMonthDays = [];
  const trailingCount = (7 - (totalCells % 7)) % 7;
  for (let d = 1; d <= trailingCount; d++) {
    nextMonthDays.push(d);
  }

  const monthLabel = `${MONTH_NAMES_EN[viewMonth - 1]} ${viewYear}`;

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-20'}`} ref={containerRef}>
      {/* Input Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 cursor-pointer hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all text-xs text-slate-800 font-medium select-none"
      >
        <span className={value ? 'text-slate-800 font-medium' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <CalendarIcon size={15} className="text-slate-500 shrink-0 ml-2" />
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-1.5 left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 flex flex-row gap-3 animate-fadeIn select-none w-full max-w-[340px] sm:max-w-[370px]">
          {/* Calendar Section (Left) */}
          <div className="flex-1 min-w-[190px] sm:min-w-[210px]">
            {/* Header: Month / Year + Navigation */}
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-xs font-bold text-slate-800 capitalize">
                {monthLabel}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Previous month"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {WEEKDAYS.map((wd, i) => (
                <div key={i} className="text-[10px] font-bold text-slate-600 py-0.5">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {prevMonthDays.map((d, i) => (
                <div key={`prev-${i}`} className="text-[11px] text-slate-300 py-1 font-normal">
                  {d}
                </div>
              ))}

              {currentMonthDays.map((d) => {
                const isSelected = d === selectedDay;
                return (
                  <button
                    key={`curr-${d}`}
                    type="button"
                    onClick={() => handleSelectDay(d)}
                    className={`text-[11px] font-medium py-1 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d}
                  </button>
                );
              })}

              {nextMonthDays.map((d, i) => (
                <div key={`next-${i}`} className="text-[11px] text-slate-300 py-1 font-normal">
                  {d}
                </div>
              ))}
            </div>

            {/* Footer buttons: Clear / Today */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 px-1">
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleToday}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Today
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-[1px] bg-slate-200 self-stretch my-1" />

          {/* Time Section (Right) */}
          <div className="flex gap-1.5 h-60">
            {/* Hours column */}
            <div
              ref={hoursColRef}
              className="w-10 overflow-y-auto no-scrollbar flex flex-col gap-1 py-1 pr-0.5"
            >
              {Array.from({ length: 24 }, (_, i) => i).map((h) => {
                const isSelected = h === selectedHour;
                return (
                  <button
                    key={`h-${h}`}
                    type="button"
                    data-active={isSelected}
                    onClick={() => handleSelectHour(h)}
                    className={`text-xs py-1.5 px-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {String(h).padStart(2, '0')}
                  </button>
                );
              })}
            </div>

            {/* Minutes column */}
            <div
              ref={minutesColRef}
              className="w-10 overflow-y-auto no-scrollbar flex flex-col gap-1 py-1 pr-0.5"
            >
              {Array.from({ length: 60 }, (_, i) => i).map((m) => {
                const isSelected = m === selectedMinute;
                return (
                  <button
                    key={`m-${m}`}
                    type="button"
                    data-active={isSelected}
                    onClick={() => handleSelectMinute(m)}
                    className={`text-xs py-1.5 px-1.5 rounded-lg font-bold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {String(m).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
