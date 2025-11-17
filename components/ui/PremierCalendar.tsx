import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { isSameDay, toYYYYMMDD } from '../../utils/date';
import Card from './Card';
import Button from './Button';

type FilterMode = 'month' | 'day' | 'range';
export type DateFilter = {
    mode: FilterMode;
    value: string | Date | { start: Date | null; end: Date | null } | null;
}

interface PremierDatePickerProps {
  value: DateFilter;
  onChange: (value: DateFilter) => void;
  allowRangeSelection?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const useIsMobile = (breakpoint = 768) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    return isMobile;
};

const getStartOfDay = (date: Date) => new Date(new Date(date).setHours(0, 0, 0, 0));

const isDateInRange = (date: Date, start: Date | null, end: Date | null) => {
    if (!start || !end) return false;
    const time = getStartOfDay(date).getTime();
    const startTime = getStartOfDay(start).getTime();
    const endTime = getStartOfDay(end).getTime();
    return time >= startTime && time <= endTime;
};

const CalendarView: React.FC<{
  displayDate: Date;
  setDisplayDate: React.Dispatch<React.SetStateAction<Date>>;
  value: DateFilter;
  handleDaySelect: (day: Date) => void;
  allowRangeSelection: boolean;
  rangeStart: Date | null;
  hoveredDate: Date | null;
  setHoveredDate: React.Dispatch<React.SetStateAction<Date | null>>;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
}> = ({
  displayDate,
  setDisplayDate,
  value,
  handleDaySelect,
  allowRangeSelection,
  rangeStart,
  hoveredDate,
  setHoveredDate,
  onClose,
  minDate,
  maxDate
}) => {
    const [view, setView] = useState<'days' | 'months'>('days');

    const calendarGrid = useMemo(() => {
        const month = displayDate.getMonth();
        const year = displayDate.getFullYear();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday is 0
        const grid = [];
        
        for (let i = firstDayIndex; i > 0; i--) {
            grid.push({ date: new Date(year, month, 1 - i), isPadding: true });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push({ date: new Date(year, month, i), isPadding: false });
        }
        while (grid.length % 7 !== 0) {
            grid.push({ date: new Date(year, month + 1, grid.length - daysInMonth - firstDayIndex + 1), isPadding: true });
        }
        return grid;
    }, [displayDate]);

    const handleTodayClick = () => {
        const today = new Date();
        setDisplayDate(today);
        handleDaySelect(today);
    };

    const renderDaysView = () => (
        <>
            <div className="flex items-center justify-between p-2">
                <button type="button" onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                <button type="button" onClick={() => setView('months')} className="font-semibold text-lg p-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-700">
                    {displayDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </button>
                <button type="button" onClick={() => setDisplayDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-zinc-500 dark:text-zinc-400 p-2 border-b dark:border-zinc-700">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 p-2" onMouseLeave={() => setHoveredDate(null)}>
                {calendarGrid.map(({date, isPadding}, index) => {
                    const dayStart = getStartOfDay(date);
                    const isToday = isSameDay(dayStart, new Date());
                    const isDisabled = (minDate && dayStart < getStartOfDay(minDate)) || (maxDate && dayStart > getStartOfDay(maxDate));

                    const isSelectedDay = value.mode === 'day' && value.value && isSameDay(dayStart, value.value as Date);
                    
                    let isStart = false, isEnd = false, isInRange = false;

                    if (allowRangeSelection) {
                      const effectiveRangeStart = rangeStart || (value.mode === 'range' ? (value.value as any)?.start : null);
                      const effectiveRangeEnd = (rangeStart ? hoveredDate : null) || (value.mode === 'range' ? (value.value as any)?.end : null);
                      
                      let start: Date | null = null;
                      let end: Date | null = null;

                      if (effectiveRangeStart && effectiveRangeEnd) {
                          start = effectiveRangeEnd < effectiveRangeStart ? effectiveRangeEnd : effectiveRangeStart;
                          end = effectiveRangeEnd < effectiveRangeStart ? effectiveRangeStart : effectiveRangeEnd;
                      } else if (effectiveRangeStart) {
                          start = effectiveRangeStart;
                      }
                      
                      isStart = start && isSameDay(dayStart, start);
                      isEnd = end && isSameDay(dayStart, end);
                      isInRange = start && end && !isStart && !isEnd && isDateInRange(dayStart, start, end);
                    }

                    const classes = ['h-10 w-10 text-sm transition-all duration-150 flex items-center justify-center'];
                    
                    if(isPadding) classes.push('text-slate-400 dark:text-zinc-600 cursor-default');
                    else if (isDisabled) classes.push('text-slate-400 dark:text-zinc-600 cursor-not-allowed opacity-50');
                    else classes.push('hover:bg-slate-200 dark:hover:bg-zinc-700');

                    if (isSelectedDay || isStart || isEnd) {
                        classes.push('bg-brand-600 text-white dark:bg-brand-500 dark:text-white font-bold');
                    } else if (isInRange) {
                        classes.push('bg-brand-100 dark:bg-brand-900/50 rounded-none');
                    } else if (isToday) {
                        classes.push('text-brand-600 dark:text-brand-400 font-bold');
                    }
                    
                    if (isStart && !isEnd) classes.push('rounded-l-full rounded-r-none');
                    else if (isEnd && !isStart) classes.push('rounded-r-full rounded-l-none');
                    else classes.push('rounded-full');

                    return (
                        <button
                            key={index}
                            type="button"
                            disabled={isPadding || isDisabled}
                            onClick={() => handleDaySelect(date)}
                            onMouseEnter={() => !isPadding && !isDisabled && allowRangeSelection && setHoveredDate(date)}
                            className={classes.join(' ')}
                        >
                            {date.getDate()}
                        </button>
                    )
                })}
            </div>
            <div className="flex justify-end gap-2 p-2 border-t dark:border-zinc-700">
                <Button type="button" variant="secondary" onClick={onClose} className="!px-3 !py-1.5 !text-sm">Cancel</Button>
                <Button type="button" onClick={handleTodayClick} className="!px-3 !py-1.5 !text-sm">Today</Button>
            </div>
        </>
    );

    const renderMonthsView = () => (
        <>
            <div className="flex items-center justify-between p-2">
                <button type="button" onClick={() => setDisplayDate(d => new Date(d.getFullYear() - 1, d.getMonth(), 1))} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><ChevronLeftIcon className="w-5 h-5" /></button>
                <span className="font-semibold text-lg">{displayDate.getFullYear()}</span>
                <button type="button" onClick={() => setDisplayDate(d => new Date(d.getFullYear() + 1, d.getMonth(), 1))} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2 p-2">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, index) => (
                    <button
                        key={month}
                        type="button"
                        onClick={() => {
                            setDisplayDate(new Date(displayDate.getFullYear(), index, 1));
                            setView('days');
                        }}
                        className="p-3 text-sm rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-700"
                    >
                        {month}
                    </button>
                ))}
            </div>
        </>
    );

    return view === 'days' ? renderDaysView() : renderMonthsView();
}

const PremierDatePicker: React.FC<PremierDatePickerProps> = ({ value, onChange, allowRangeSelection = true, minDate, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const [displayDate, setDisplayDate] = useState(new Date());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside, true);
    return () => window.removeEventListener('mousedown', handleClickOutside, true);
  }, []);
  
  useEffect(() => {
      if (isOpen && !isMobile) {
          if (triggerRef.current) {
              const rect = triggerRef.current.getBoundingClientRect();
              const CALENDAR_HEIGHT = 420;
              const spaceBelow = window.innerHeight - rect.bottom;
              const opensUp = spaceBelow < CALENDAR_HEIGHT && rect.top > CALENDAR_HEIGHT;

              setDropdownStyle({
                  position: 'fixed',
                  top: opensUp ? `${rect.top - CALENDAR_HEIGHT - 4}px` : `${rect.bottom + 4}px`,
                  left: `${rect.left}px`,
                  width: '320px',
                  transformOrigin: opensUp ? 'bottom' : 'top',
              });
          }
      }
  }, [isOpen, isMobile]);
  
  useEffect(() => {
      if (isOpen) {
          let initialDate = new Date();
          if (value.value) {
            try {
              if (value.mode === 'day' && value.value instanceof Date) initialDate = value.value;
              else if (value.mode === 'month') initialDate = new Date((value.value as string) + '-02');
              else if (value.mode === 'range' && (value.value as any)?.start) initialDate = (value.value as any).start;
            } catch(e) { /* use default */ }
          }
          setDisplayDate(initialDate);
      } else {
        setRangeStart(null);
        setHoveredDate(null);
      }
  }, [isOpen, value]);

  const handleDaySelect = (day: Date) => {
    if (allowRangeSelection) {
      if (!rangeStart) {
          setRangeStart(day);
      } else {
          let start = rangeStart;
          let end = day;
          if (end < start) [start, end] = [end, start];
          onChange(isSameDay(start, end) ? { mode: 'day', value: start } : { mode: 'range', value: { start, end } });
          setIsOpen(false);
      }
    } else {
      onChange({ mode: 'day', value: day });
      setIsOpen(false);
    }
  };
  
  const getButtonLabel = () => {
    const { mode, value: filterValue } = value;
    if (!filterValue) return "Select Date";
    try {
        if (mode === 'month') {
            return new Date((filterValue as string) + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        if (mode === 'day') {
            return (filterValue as Date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'});
        }
        if (mode === 'range') {
            const { start, end } = filterValue as { start: Date | null, end: Date | null };
            if (start && end) {
                if (isSameDay(start, end)) {
                    return start.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric'});
                }
                const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                return `${startStr} - ${endStr}`;
            }
        }
    } catch(e) { return "Select Date"; }
    return "Select Date";
  }

  const calendarProps = {
    displayDate,
    setDisplayDate,
    value,
    handleDaySelect,
    allowRangeSelection,
    rangeStart,
    hoveredDate,
    setHoveredDate,
    onClose: () => setIsOpen(false),
    minDate,
    maxDate,
  };

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left bg-slate-50 dark:bg-zinc-800/50 border border-slate-300/70 dark:border-zinc-700/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all duration-200"
      >
        <span className="flex items-center">
          <CalendarIcon className="w-5 h-5 mr-3 text-zinc-400 dark:text-zinc-500" />
          <span className={`text-zinc-900 dark:text-zinc-100 ${!value.value ? 'text-zinc-500 dark:text-zinc-400' : ''}`}>{getButtonLabel()}</span>
        </span>
      </button>

      {isOpen && createPortal(
         isMobile ? (
             <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in">
                 <Card ref={dropdownRef} className="w-full max-w-sm animate-pop-in">
                     <CalendarView {...calendarProps} />
                 </Card>
             </div>
         ) : (
             <div 
                ref={dropdownRef}
                style={dropdownStyle}
                className={`
                    z-50 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden
                    ${dropdownStyle.transformOrigin === 'bottom' ? 'animate-fade-in-down' : 'animate-fade-in-up'}
                `}
             >
                <CalendarView {...calendarProps} />
             </div>
         ),
         document.body
      )}
    </div>
  );
};

export default PremierDatePicker;
