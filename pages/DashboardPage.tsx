import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toYYYYMMDD } from '../utils/date';
import { BarChart3Icon, LandmarkIcon, CreditCardIcon, UsersIcon, ScaleIcon, DownloadIcon, PlusCircleIcon } from '../components/icons';
import { NavLink, Link } from 'react-router-dom';
import { CardDetails } from '../types';

const BalanceCard: React.FC<{ title: string; amount: number; icon: React.ElementType; cardDetails?: CardDetails }> = ({ title, amount, icon: Icon, cardDetails }) => (
    <Card className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center">
            <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Rs. {amount.toLocaleString('en-IN')}</p>
            {cardDetails && <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">**** {cardDetails.cardNumber.slice(-4)}</p>}
        </div>
    </Card>
);


const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-white/80 dark:bg-zinc-700/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 dark:border-zinc-600">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">{label}</p>
                {payload.map((pld: any) => (
                     <p key={pld.dataKey} className="text-sm text-zinc-600 dark:text-zinc-300">
                        <span style={{ color: pld.stroke }}>●</span> {pld.name}: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{`Rs. ${pld.value.toLocaleString('en-IN')}`}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardPage: React.FC = () => {
    const { transactions, cards, creditEntries, creditReceivedEntries, balances } = useData();
    
    const totalBalance = useMemo(() => {
        // FIX: Explicitly type the accumulator and value in the reduce function to resolve type inference issue.
        return Object.values(balances).reduce((sum: number, b: number) => sum + b, 0);
    }, [balances]);

    const creditSummary = useMemo(() => {
        const totalLent = creditEntries.reduce((sum, e) => sum + e.amount, 0);
        const totalReturned = creditEntries.reduce((sum, e) => sum + e.returnedAmount, 0);
        return { totalLent, totalPending: totalLent - totalReturned };
    }, [creditEntries]);
    
    const topPendingCredits = useMemo(() => {
        const pendingByPerson: { [key: string]: number } = {};
        creditEntries
            .filter(e => e.status === 'pending' || e.status === 'partially-paid')
            .forEach(e => {
                const pending = e.amount - e.returnedAmount;
                pendingByPerson[e.personName] = (pendingByPerson[e.personName] || 0) + pending;
            });

        return Object.entries(pendingByPerson)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([personName, pendingAmount]) => ({ personName, pendingAmount }));
    }, [creditEntries]);

    const creditReceivedSummary = useMemo(() => {
        const totalBorrowed = creditReceivedEntries.reduce((sum, e) => sum + e.amount, 0);
        const totalReturned = creditReceivedEntries.reduce((sum, e) => sum + e.returnedAmount, 0);
        return { totalBorrowed, totalPending: totalBorrowed - totalReturned };
    }, [creditReceivedEntries]);
    
    const weeklySpending = useMemo(() => {
        const creditCategories = ['Credit', 'Credit Return', 'Credit Received', 'Credit Return Paid'];
        const isCreditTransaction = (t: any) => creditCategories.includes(t.category);
        
        const data: { name: string, expense: number, income: number }[] = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayStr = toYYYYMMDD(date);
            
            const dailyExpense = transactions
                .filter(t => toYYYYMMDD(new Date(t.date)) === dayStr && t.type === 'expense' && !isCreditTransaction(t))
                .reduce((sum, t) => sum + t.amount, 0);
            const dailyIncome = transactions
                .filter(t => toYYYYMMDD(new Date(t.date)) === dayStr && t.type === 'income' && !isCreditTransaction(t))
                .reduce((sum, t) => sum + t.amount, 0);
            data.push({ name: dayName, expense: dailyExpense, income: dailyIncome });
        }
        return data;
    }, [transactions]);
    

    return (
        <div className="space-y-8 animate-fade-in dashboard-content">
             <div>
                <h2 className="text-xl font-bold text-zinc-800 dark:text-white mb-4">Overall Summary</h2>
                <Card className="bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                            <ScaleIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm text-brand-200">Total Balance</p>
                            <p className="text-3xl font-bold">Rs. {totalBalance.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                </Card>
            </div>
            
            <div>
                <h2 className="text-xl font-bold text-zinc-800 dark:text-white mb-4">Individual Balances</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <BalanceCard title="Cash on Hand" amount={balances.cash} icon={LandmarkIcon} />
                    {cards.map(card => (
                        <BalanceCard key={card.id} title={card.cardName} amount={balances[card.id] || 0} icon={CreditCardIcon} cardDetails={card} />
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Analysis Section */}
                    <Card>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Weekly Summary</h3>
                        {weeklySpending.some(d => d.expense > 0 || d.income > 0) ? (
                            <ResponsiveContainer width="100%" height={250}>
                              <AreaChart data={weeklySpending} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                  <defs>
                                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor' }} className="text-xs text-zinc-500 dark:text-zinc-400"/>
                                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor' }} className="text-xs text-zinc-500 dark:text-zinc-400" tickFormatter={(value) => `Rs.${Number(value) / 1000}k`} />
                                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(128,128,128,0.2)', strokeWidth: 1, strokeDasharray: "3 3" }} />
                                  <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={2.5} name="Income" />
                                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#colorExpense)" strokeWidth={2.5} name="Expense" />
                              </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="flex flex-col items-center justify-center h-[250px] text-center">
                                <BarChart3Icon className="w-16 h-16 text-slate-300 dark:text-zinc-700 mb-4" />
                                <h4 className="font-semibold text-zinc-700 dark:text-zinc-300">No Recent Activity</h4>
                                <p className="text-zinc-500 dark:text-zinc-400 max-w-xs text-sm">Data for the last 7 days will appear here.</p>
                            </div>
                        )}
                    </Card>

                     <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Credit Received</h3>
                            <NavLink to="/credit-received" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
                                Details
                            </NavLink>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center">
                                    <DownloadIcon className="w-6 h-6 text-sky-500 dark:text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Borrowed</p>
                                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Rs. {creditReceivedSummary.totalBorrowed.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                                    <DownloadIcon className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Pending to Return</p>
                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-500">Rs. {creditReceivedSummary.totalPending.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                 {/* Credit Summary Section */}
                <Card className="flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Credit Lent</h3>
                        <NavLink to="/credit" className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline">
                            Details
                        </NavLink>
                    </div>
                    {creditEntries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center flex-grow py-8">
                            <UsersIcon className="w-16 h-16 text-slate-300 dark:text-zinc-700 mb-4" />
                            <h4 className="font-semibold text-zinc-700 dark:text-zinc-300">No Credit Lent Yet</h4>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 mb-4">Track money you lend to others.</p>
                            <Link to="/credit">
                                <Button variant="secondary">
                                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                                    Add First Credit
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-700/50 flex items-center justify-center">
                                        <UsersIcon className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Lent</p>
                                        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Rs. {creditSummary.totalLent.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
                                        <UsersIcon className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Pending</p>
                                        <p className="text-lg font-bold text-rose-600 dark:text-rose-500">Rs. {creditSummary.totalPending.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>

                            {topPendingCredits.length > 0 ? (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
                                    <h4 className="text-sm font-semibold text-zinc-600 dark:text-zinc-300 mb-3">Top Pending</h4>
                                    <ul className="space-y-3">
                                        {topPendingCredits.map(({ personName, pendingAmount }) => (
                                            <li key={personName}>
                                                <Link to={`/credit/person/${encodeURIComponent(personName)}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700/50 transition-colors">
                                                    <img src={`https://api.dicebear.com/8.x/avataaars/svg?seed=${personName}`} alt={`${personName}'s avatar`} className="w-8 h-8 rounded-full bg-slate-200" />
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">{personName}</p>
                                                    </div>
                                                    <p className="font-bold text-sm text-rose-600 dark:text-rose-500">Rs. {pendingAmount.toLocaleString('en-IN')}</p>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700 text-center flex-grow flex items-center justify-center">
                                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-500">All dues cleared! 🎉</p>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;