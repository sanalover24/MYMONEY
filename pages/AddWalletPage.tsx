import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CardType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import { XIcon, PlusCircleIcon } from '../components/icons';

const AddWalletPage: React.FC = () => {
    const { addCard } = useData();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cardType: 'visa' as CardType,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value } = e.target;
        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').slice(0, 16);
        }
        if (name === 'expiryDate') {
            value = value.replace(/\D/g, '').slice(0, 4);
            if (value.length > 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.cardNumber.length !== 16) {
            addToast("Card number must be 16 digits.", 'error');
            return;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
            addToast("Expiry date must be in MM/YY format.", 'error');
            return;
        }
        addCard(formData);
        addToast('New card added to wallet!', 'success');
        navigate('/wallet');
    };

    const cardTypeOptions: SelectOption[] = [
        { value: 'visa', label: 'Visa' },
        { value: 'mastercard', label: 'Mastercard' },
    ];
    
    const formInputClasses = "block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-zinc-800/50 border-slate-300/70 dark:border-zinc-700/80 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500";


    return (
        <div className="min-h-[calc(100vh-150px)] flex items-center justify-center animate-fade-in-up">
            <Card className="w-full max-w-lg mx-auto !p-0 overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">Add New Card</h2>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700/50 hover:text-zinc-900 dark:hover:text-white transition-colors"
                                aria-label="Cancel and go back"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="cardName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Card Name</label>
                                <input type="text" id="cardName" name="cardName" value={formData.cardName} onChange={handleChange} className={formInputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="cardNumber" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Card Number</label>
                                <input type="text" id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="**** **** **** ****" className={formInputClasses} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="expiryDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Expiry Date</label>
                                    <input type="text" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleChange} placeholder="MM/YY" className={formInputClasses} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Card Type</label>
                                    <CustomSelect value={formData.cardType} onChange={(v) => setFormData(p => ({...p, cardType: v as CardType}))} options={cardTypeOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t dark:border-zinc-800/80">
                        <Button type="submit" className="w-full flex items-center justify-center text-base py-3">
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add Card
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AddWalletPage;
