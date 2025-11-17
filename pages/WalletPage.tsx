import React, { useState, useMemo, ReactNode, useEffect } from 'react';
import { useData } from '../context/DataContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CardDetails, CardType } from '../types';
import { Trash2Icon, EditIcon, XIcon, CreditCardIcon, PlusCircleIcon } from '../components/icons';
import CustomSelect, { SelectOption } from '../components/ui/CustomSelect';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';

// --- Reusable Bank Card Component ---
const BankCard: React.FC<{ card: CardDetails; children?: ReactNode; className?: string }> = ({ card, children, className }) => {
    const cardNameLower = card.cardName.toLowerCase();
    
    // Default theme
    let gradient = 'from-gray-700 to-gray-900';
    let textColor = 'text-white';
    let brandStyle = 'font-bold text-lg italic';
    let backgroundPattern = '';

    // Theme logic based on card name or type
    if (cardNameLower.includes('hnb')) {
        gradient = 'from-red-600 to-red-800';
        textColor = 'text-white';
    } else if (cardNameLower.includes('sampath')) {
        gradient = 'from-emerald-600 to-green-800';
        textColor = 'text-white';
    } else if (card.cardType === 'visa') {
        gradient = 'from-blue-500 to-indigo-600';
        textColor = 'text-white';
    } else if (card.cardType === 'mastercard') {
        gradient = 'from-gray-700 to-gray-900';
        textColor = 'text-white';
    }
    
    return (
        <div className={`relative w-full max-w-sm aspect-[1.586] rounded-xl ${textColor} p-6 shadow-lg transform transition-transform hover:scale-105 overflow-hidden ${className}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} z-0`}></div>
            {backgroundPattern && <div className={`absolute inset-0 ${backgroundPattern} opacity-10 z-0`}></div>}
            <div className="relative h-full flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                    <span className="font-semibold">{card.cardName}</span>
                    <span className={brandStyle}>{card.cardType === 'visa' ? 'VISA' : 'Mastercard'}</span>
                </div>
                <div>
                    <div className="text-2xl font-mono tracking-widest mb-2">
                        {'**** **** **** ' + card.cardNumber.slice(-4)}
                    </div>
                    <div className="flex justify-between items-end text-sm opacity-80">
                        <span>VALID THRU</span>
                        <span className="font-mono">{card.expiryDate}</span>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
};


// --- Edit/Add Card Form Component ---
const CardForm: React.FC<{ card?: CardDetails; onSubmit: (data: Omit<CardDetails, 'id'> | CardDetails) => void; onClose: () => void; }> = ({ card, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        cardName: card?.cardName || '',
        cardNumber: card?.cardNumber || '',
        expiryDate: card?.expiryDate || '',
        cardType: card?.cardType || 'visa' as CardType,
    });
    const { addToast } = useToast();

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
        // Basic Validation
        if (formData.cardNumber.length !== 16) {
            addToast("Card number must be 16 digits.", 'error');
            return;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
            addToast("Expiry date must be in MM/YY format.", 'error');
            return;
        }

        const submitData = card ? { ...card, ...formData } : formData;
        onSubmit(submitData);
    };

    const cardTypeOptions: SelectOption[] = [
        { value: 'visa', label: 'Visa' },
        { value: 'mastercard', label: 'Mastercard' },
    ];
    
    const formInputClasses = "block w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-zinc-800/50 border-slate-300/70 dark:border-zinc-700/80 text-zinc-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500";


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-end pt-4 gap-3 border-t dark:border-zinc-700/80">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">{card ? 'Save Changes' : 'Add Card'}</Button>
            </div>
        </form>
    );
};


// --- Main Wallet Page Component ---
const WalletPage: React.FC = () => {
  const { cards, deleteCard, updateCard } = useData();
  const { addToast } = useToast();
  const { searchTerm, setSearchTerm, setIsSearchable } = useSearch();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardDetails | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CardDetails | null>(null);

  useEffect(() => {
      setIsSearchable(true);
      return () => {
          setIsSearchable(false);
          setSearchTerm('');
      };
  }, [setIsSearchable, setSearchTerm]);

  const filteredCards = useMemo(() => {
    return cards.filter(card =>
        card.cardName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cards, searchTerm]);
  
  const handleEdit = (card: CardDetails) => {
    setEditingCard(card);
    setIsEditModalOpen(true);
  };

  const handleFormSubmit = (data: Omit<CardDetails, 'id'> | CardDetails) => {
    if ('id' in data) {
        updateCard(data);
        addToast('Card updated successfully!', 'success');
    }
    setIsEditModalOpen(false);
  };
  
  const handleConfirmDelete = () => {
    if (cardToDelete) {
        const success = deleteCard(cardToDelete.id);
        if (success) {
            addToast('Card deleted successfully!', 'success');
        } else {
            addToast('Cannot delete card. It is linked to one or more transactions.', 'error');
        }
        setCardToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-zinc-800 dark:text-white">My Wallet</h2>
        <Link to="/add-wallet">
            <Button><PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Card</Button>
        </Link>
      </div>
      
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredCards.map((card, index) => (
                <BankCard 
                    key={card.id} 
                    card={card} 
                    className="animate-fade-in-up group"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Button variant="secondary" onClick={(e) => {e.preventDefault(); handleEdit(card)}} className="!p-2.5" title="Edit Card">
                            <EditIcon className="w-5 h-5" />
                        </Button>
                        <Button variant="danger" onClick={(e) => {e.preventDefault(); setCardToDelete(card)}} className="!p-2.5" title="Delete Card">
                            <Trash2Icon className="w-5 h-5" />
                        </Button>
                    </div>
                </BankCard>
            ))}
        </div>
      ) : (
        <Card className="text-center py-20">
            <CreditCardIcon className="mx-auto w-16 h-16 text-slate-300 dark:text-zinc-700 mb-4" />
            <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">No Cards Found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto text-sm mt-2">
                {searchTerm ? `No cards match your search for "${searchTerm}".` : "Get started by adding your first credit or debit card to your wallet."}
            </p>
        </Card>
      )}

        {isEditModalOpen && (
            <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsEditModalOpen(false)}>
                <Card className="w-full max-w-md animate-fade-in-up !p-0" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 sm:p-6 border-b dark:border-zinc-700/80">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Edit Card</h2>
                        <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-4 sm:p-6">
                       <CardForm
                            card={editingCard || undefined}
                            onSubmit={handleFormSubmit}
                            onClose={() => setIsEditModalOpen(false)}
                        />
                    </div>
                </Card>
            </div>
        )}

        {cardToDelete && (
            <div className="fixed inset-0 bg-black/75 z-50 flex justify-center items-center p-4 animate-fade-in">
                <Card className="w-full max-w-md animate-fade-in-up" style={{ animationDuration: '300ms' }} onClick={e => e.stopPropagation()}>
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/50">
                            <Trash2Icon className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mt-5">Delete Card</h3>
                        <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            <p>Are you sure you want to delete the card "<strong>{cardToDelete.cardName}</strong>"?</p>
                            <p className="mt-4">This action cannot be undone.</p>
                        </div>
                        <div className="mt-5 sm:mt-6 flex justify-center gap-3">
                            <Button variant="secondary" onClick={() => setCardToDelete(null)}>Cancel</Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>Delete</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}
    </div>
  );
};

export default WalletPage;
