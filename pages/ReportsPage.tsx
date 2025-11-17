import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PremierDatePicker, { DateFilter } from '../components/ui/PremierCalendar';
import { toYYYYMMDD, isSameDay } from '../utils/date';

const ReportsPage: React.FC = () => {
  const { transactions } = useData();
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    mode: 'month',
    value: new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  const filteredTransactions = useMemo(() => {
    const { mode, value } = dateFilter;
    if (!value) return [];

    return transactions.filter(t => {
      if (mode === 'month') {
        const transactionDatePart = toYYYYMMDD(new Date(t.date));
        return transactionDatePart.startsWith(value as string);
      }
      if (mode === 'day') {
        const transactionDatePart = toYYYYMMDD(new Date(t.date));
        const selectedDate = toYYYYMMDD(value as Date);
        return transactionDatePart === selectedDate;
      }
       if (mode === 'range') {
          const { start, end } = value as { start: Date | null; end: Date | null };
          if (start && end) {
              const transactionTimestamp = new Date(t.date).getTime();
              const startTimestamp = new Date(start).setHours(0, 0, 0, 0);
              const endTimestamp = new Date(end).setHours(23, 59, 59, 999);
              return transactionTimestamp >= startTimestamp && transactionTimestamp <= endTimestamp;
          }
          return true;
      }
      return true;
    });
  }, [transactions, dateFilter]);

  const summary = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const expenseByCategory: { [key: string]: number } = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
        if(!expenseByCategory[t.category]) expenseByCategory[t.category] = 0;
        expenseByCategory[t.category] += t.amount;
    });
    const topCategoryEntry = Object.entries(expenseByCategory).sort(([,a],[,b]) => b-a)[0];
    const topCategory = topCategoryEntry ? `${topCategoryEntry[0]} (Rs. ${topCategoryEntry[1].toLocaleString('en-IN')})` : 'N/A';

    return { income, expense, topCategory };
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    const { mode, value } = dateFilter;
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    if (mode === 'month' && typeof value === 'string') {
        const year = parseInt(value.slice(0, 4));
        const monthIndex = parseInt(value.slice(5, 7)) - 1;
        startDate = new Date(year, monthIndex, 1);
        endDate = new Date(year, monthIndex + 1, 0);
    } else if (mode === 'range' && value && typeof value === 'object') {
        const rangeValue = value as { start: Date | null; end: Date | null };
        if (rangeValue.start && rangeValue.end && isSameDay(rangeValue.start, rangeValue.end)) {
            return []; // Don't show chart for single day range
        }
        startDate = rangeValue.start;
        endDate = rangeValue.end;
    } else if (mode === 'day') {
        return []; // Trend chart doesn't make sense for a single day.
    }
    
    if (!startDate || !endDate) return [];

    const data: { name: string, income: number, expense: number }[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dateStr = toYYYYMMDD(currentDate);
        const dailyIncome = transactions
            .filter(t => toYYYYMMDD(new Date(t.date)) === dateStr && t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const dailyExpense = transactions
            .filter(t => toYYYYMMDD(new Date(t.date)) === dateStr && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        data.push({
            name: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            income: dailyIncome,
            expense: dailyExpense,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  }, [transactions, dateFilter]);
  
  const pieData = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
        if (!categoryMap[t.category]) categoryMap[t.category] = 0;
        categoryMap[t.category] += t.amount;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899'];
  
  const showTrendChart = useMemo(() => {
    if (dateFilter.mode === 'day') return false;
    if (dateFilter.mode === 'range' && dateFilter.value) {
        const { start, end } = dateFilter.value as any;
        if (start && end && isSameDay(start, end)) return false;
    }
    return true;
  }, [dateFilter]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="animate-fade-in-up relative z-30">
        <Card>
          <label htmlFor="date-filter" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Select Period</label>
          <PremierDatePicker
            value={dateFilter}
            onChange={setDateFilter}
          />
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}><Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Income</h4><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">Rs. {summary.income.toLocaleString('en-IN')}</p></Card></div>
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}><Card><h4 className="text-zinc-500 dark:text-zinc-400">Total Expense</h4><p className="text-2xl font-bold text-rose-600 dark:text-rose-500">Rs. {summary.expense.toLocaleString('en-IN')}</p></Card></div>
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}><Card><h4 className="text-zinc-500 dark:text-zinc-400">Top Category</h4><p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{summary.topCategory}</p></Card></div>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        {showTrendChart ? (
          <Card>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Income vs Expense Trend</h3>
            <div className="text-zinc-600 dark:text-zinc-400">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-zinc-700" />
                  <XAxis dataKey="name" className="text-xs" tick={{ fill: 'currentColor' }} stroke="none"/>
                  <YAxis className="text-xs" tick={{ fill: 'currentColor' }} stroke="none" />
                  <Tooltip wrapperClassName="dark:!bg-zinc-800/80 dark:!border-zinc-700 !rounded-2xl !backdrop-blur-sm" contentStyle={{ backgroundColor: 'rgba(255, 255,255, 0.8)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                  <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} name="Expense" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ) : (
          <Card>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Daily Activity</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-center py-20">
                  Line chart is not available for a single day view. <br/> Select a range to see daily trends.
              </p>
          </Card>
        )}
      </div>
      
      <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <Card>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Category-wise Spending</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip wrapperClassName="dark:!bg-zinc-800/80 dark:!border-zinc-700 !rounded-2xl !backdrop-blur-sm" contentStyle={{ backgroundColor: 'rgba(255, 255,255, 0.8)' }} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400 text-center py-20">
                No expense data for the selected period.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;