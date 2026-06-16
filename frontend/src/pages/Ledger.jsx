import { useState, useEffect } from 'react';
import { CheckCircle, X, Download } from 'lucide-react';
import api from '../api';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Ledger = () => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  
  const [paymentModal, setPaymentModal] = useState({ 
    isOpen: false, 
    student: null, 
    amount: '', 
    month: '', 
    datePaid: '' 
  });

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      const studentsRes = await api.get('/students/');
      const paymentsRes = await api.get(`/payments/ledger/${year}`);
      setStudents(studentsRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error("Failed to fetch ledger data", error);
    }
  };

  const paymentMap = {};
  for (const p of payments) {
    if (!paymentMap[p.studentId]) {
      paymentMap[p.studentId] = {};
    }
    // month is stored like "June 2026"
    const monthName = p.month.split(' ')[0];
    paymentMap[p.studentId][monthName] = true;
  }

  const openPaymentModal = (student, monthName) => {
    const today = new Date().toISOString().split('T')[0];
    setPaymentModal({
      isOpen: true,
      student,
      amount: student.rent,
      month: `${monthName} ${year}`,
      datePaid: today
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const studentId = paymentModal.student._id || paymentModal.student.id;
      await api.post('/payments/', {
        studentId: studentId,
        amount: parseInt(paymentModal.amount),
        month: paymentModal.month,
        datePaid: new Date(paymentModal.datePaid).toISOString()
      });
      // Refresh the data to show the checkmark
      await fetchData();
      setPaymentModal({ isOpen: false, student: null, amount: '', month: '', datePaid: '' });
    } catch (error) {
      console.error("Failed to record payment", error);
      alert("Failed to record payment.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rent Ledger</h1>
          <p className="text-slate-500 mt-1">Track monthly payments for all students.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          <label className="text-sm font-medium text-slate-600 pl-2">Select Year:</label>
          <select 
            value={year} 
            onChange={(e) => setYear(e.target.value)}
            className="input-field border-none bg-slate-50 py-1.5 focus:ring-0"
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-600 font-medium">
                <th className="py-4 px-6 sticky left-0 bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Student / Room</th>
                {MONTHS.map(month => (
                  <th key={month} className="py-4 px-4 text-center">{month.substring(0, 3)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students.map((student) => {
                const studentId = student._id || student.id;
                const pMap = paymentMap[studentId] || {};
                
                return (
                  <tr key={studentId} className={`transition-colors ${student.status === 'Left' ? 'bg-slate-100/50 opacity-75' : 'hover:bg-slate-50/50'}`}>
                    <td className={`py-3 px-6 font-medium text-slate-900 sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${student.status === 'Left' ? 'bg-slate-50' : 'bg-white'}`}>
                      <div className="flex items-center gap-2">
                        <span className={student.status === 'Left' ? 'text-slate-500' : ''}>{student.name}</span>
                        {student.status === 'Left' && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium">Left</span>}
                      </div>
                      <div className="text-xs text-slate-500 font-normal">Room: {student.room} | ₹{student.rent}</div>
                    </td>
                    
                    {MONTHS.map(month => {
                      const isPaid = pMap[month];
                      return (
                        <td key={month} className="py-3 px-4 text-center">
                          {isPaid ? (
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-500">
                              <CheckCircle size={18} />
                            </div>
                          ) : (
                            <button 
                              onClick={() => openPaymentModal(student, month)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-slate-300 hover:bg-primary-50 hover:text-primary-500 transition-colors cursor-pointer"
                              title={`Record payment for ${month} ${year}`}
                            >
                              -
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>
              <button 
                onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <p className="text-sm text-slate-500 mb-4">
                Recording payment for <span className="font-medium text-slate-900">{paymentModal.student?.name}</span>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount Paid (₹)</label>
                <input 
                  type="number" 
                  className="input-field"
                  value={paymentModal.amount}
                  onChange={(e) => setPaymentModal({...paymentModal, amount: e.target.value})}
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">For Month</label>
                <input 
                  type="text" 
                  className="input-field bg-slate-50 text-slate-500"
                  value={paymentModal.month}
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date Paid</label>
                <input 
                  type="date" 
                  className="input-field"
                  value={paymentModal.datePaid}
                  onChange={(e) => setPaymentModal({...paymentModal, datePaid: e.target.value})}
                  required 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setPaymentModal({ ...paymentModal, isOpen: false })}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;
