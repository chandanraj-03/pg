import { useState, useEffect } from 'react';
import { IndianRupee, Trash2, Plus } from 'lucide-react';
import api from '../api';

const CATEGORIES = ["Electricity", "Water", "Groceries", "Salary", "Maintenance", "Other"];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [newExpense, setNewExpense] = useState({
    category: 'Electricity',
    amount: '',
    description: '',
    dateIncurred: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses/');
      setExpenses(res.data);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      await api.post('/expenses/', {
        ...newExpense,
        amount: parseInt(newExpense.amount),
        dateIncurred: new Date(newExpense.dateIncurred).toISOString()
      });
      setNewExpense({
        category: 'Electricity',
        amount: '',
        description: '',
        dateIncurred: new Date().toISOString().split('T')[0]
      });
      await fetchExpenses();
    } catch (error) {
      console.error("Failed to add expense", error);
      alert("Failed to add expense.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      await fetchExpenses();
    } catch (error) {
      console.error("Failed to delete expense", error);
      alert("Failed to delete expense.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expense Tracking</h1>
        <p className="text-slate-500 mt-1">Log and manage your PG's operational expenses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Expense Form */}
        <div className="card p-6 h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Plus size={20} className="text-blue-500" />
            Add New Expense
          </h2>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select 
                className="input-field" 
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input 
                type="number" 
                required
                className="input-field" 
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input 
                type="text" 
                required
                placeholder="e.g. June Electricity Bill"
                className="input-field" 
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input 
                type="date" 
                required
                className="input-field" 
                value={newExpense.dateIncurred}
                onChange={(e) => setNewExpense({...newExpense, dateIncurred: e.target.value})}
              />
            </div>

            <button type="submit" disabled={adding} className="btn-primary w-full justify-center">
              {adding ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>

        {/* Expenses List */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Recent Expenses</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider font-medium">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500">Loading expenses...</td></tr>
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-500">No expenses recorded yet.</td></tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp._id || exp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6 text-slate-600">
                        {new Date(exp.dateIncurred).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-6 font-medium text-slate-900">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs">{exp.category}</span>
                      </td>
                      <td className="py-3 px-6 text-slate-700">{exp.description}</td>
                      <td className="py-3 px-6 text-rose-600 font-medium">₹{(exp.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-6 text-right">
                        <button 
                          onClick={() => handleDelete(exp._id || exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
