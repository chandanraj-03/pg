import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Download, X, UserMinus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    student: null,
    amount: '',
    month: '',
    datePaid: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students/');
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const openPaymentModal = (student) => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setPaymentModal({
      isOpen: true,
      student,
      amount: student.rent,
      month: currentMonth,
      datePaid: today
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const studentId = paymentModal.student._id || paymentModal.student.id;
      const paymentDateStr = new Date(paymentModal.datePaid).toISOString();
      await api.post('/payments/', {
        studentId: studentId,
        amount: parseInt(paymentModal.amount),
        month: paymentModal.month,
        datePaid: paymentDateStr
      });
      setStudents(students.map(s => (s._id || s.id) === studentId ? { ...s, rentStatus: 'Paid', lastPaidDate: paymentDateStr } : s));
      setPaymentModal({ isOpen: false, student: null, amount: '', month: '', datePaid: '' });
    } catch (error) {
      console.error("Failed to record payment", error);
      alert("Failed to record payment.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(students.filter(s => (s._id || s.id) !== id));
    } catch (error) {
      console.error("Failed to delete student", error);
      alert("Failed to delete student.");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Left' ? 'Active' : 'Left';
    if (!window.confirm(`Are you sure you want to mark this student as ${newStatus}?`)) return;
    try {
      await api.patch(`/students/${id}/status?status=${newStatus}`);
      setStudents(students.map(s => (s._id || s.id) === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status.");
    }
  };

  const handleExport = () => {
    if (students.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Name", "Room", "Phone", "Occupation", "Institute", "Rent", "Rent Status", "Paid On"];
    const csvRows = [headers.join(',')];

    for (const s of students) {
      const values = [
        `"${s.name}"`,
        `"${s.room}"`,
        `"${s.phone}"`,
        `"${s.occupationType || ''}"`,
        `"${s.instituteName || ''}"`,
        s.rent,
        s.rentStatus,
        s.lastPaidDate ? new Date(s.lastPaidDate).toLocaleDateString() : '-'
      ];
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'students_export.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Students - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h1>
          <p className="text-slate-500 mt-1">Manage all your PG tenants here.</p>
        </div>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
          <Download size={18} />
          Export Data
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-600 font-medium">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Room</th>
                <th className="py-4 px-6">Rent</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Paid On</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {students.map((student) => {
                const id = student._id || student.id;
                return (
                  <tr key={id} className={`transition-colors ${student.status === 'Left' ? 'bg-slate-100/50 opacity-75' : 'hover:bg-slate-50/50'}`}>
                    <td className="py-4 px-6 font-medium text-primary-600 hover:text-primary-700 cursor-pointer" onClick={() => navigate(`/student/${id}`)}>
                      <div className="flex items-center gap-2">
                        <span className={student.status === 'Left' ? 'text-slate-500' : ''}>{student.name}</span>
                        {student.status === 'Left' && <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium">Left</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{student.room}</td>
                    <td className="py-4 px-6 text-slate-600">₹{student.rent}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => openPaymentModal(student)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${student.rentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        title="Record Payment"
                      >
                        {student.rentStatus}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-sm">
                      {student.lastPaidDate ? new Date(student.lastPaidDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button
                          onClick={() => navigate(`/student/${id}`)}
                          className="hover:text-primary-500 transition-colors"
                          title="View Dashboard"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/edit-student/${id}`)}
                          className="hover:text-amber-500 transition-colors"
                          title="Edit Student"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(id, student.status || 'Active')}
                          className={`transition-colors ${student.status === 'Left' ? 'hover:text-emerald-600 text-emerald-500' : 'hover:text-amber-600'}`}
                          title={student.status === 'Left' ? "Reactivate Student" : "Mark as Left"}
                        >
                          {student.status === 'Left' ? <UserCheck size={18} /> : <UserMinus size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="hover:text-rose-600 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {students.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No students found. Add one to get started.
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
                  onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">For Month</label>
                <input
                  type="text"
                  className="input-field"
                  value={paymentModal.month}
                  placeholder="e.g. June 2026"
                  onChange={(e) => setPaymentModal({ ...paymentModal, month: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Date Paid</label>
                <input
                  type="date"
                  className="input-field"
                  value={paymentModal.datePaid}
                  onChange={(e) => setPaymentModal({ ...paymentModal, datePaid: e.target.value })}
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

export default Students;
