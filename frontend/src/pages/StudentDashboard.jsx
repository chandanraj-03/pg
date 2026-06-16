import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Briefcase, GraduationCap, Calendar, IndianRupee, FileText, Camera } from 'lucide-react';
import api from '../api';

const StudentDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docName, setDocName] = useState('');
  const [docFile, setDocFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await api.get(`/students/${id}`);
        setStudent(studentRes.data);
        
        const paymentsRes = await api.get(`/payments/student/${id}`);
        setPayments(paymentsRes.data);
        
        const docsRes = await api.get(`/documents/student/${id}`);
        setDocuments(docsRes.data);
      } catch (error) {
        console.error("Failed to fetch student data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading student details...</div>;
  }

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!docFile || !docName) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('studentId', id);
      formData.append('name', docName);
      formData.append('file', docFile);

      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocuments([response.data, ...documents]);
      setDocName('');
      setDocFile(null);
      // clear the file input
      document.getElementById('docFileInput').value = '';
      alert("Document uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  if (!student) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Student not found.</p>
        <button onClick={() => navigate('/students')} className="text-primary-500 hover:underline mt-4">
          Return to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/students')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{student.name}</h1>
          <p className="text-slate-500 mt-1">Room {student.room} | Rent: ₹{student.rent}/month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 space-y-6 self-start">
          <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Profile Details</h2>
          
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Phone className="text-slate-400 mt-0.5" size={16} />
              <div>
                <p className="font-medium text-slate-900">Phone Number</p>
                <p>{student.phone}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="text-slate-400 mt-0.5" size={16} />
              <div>
                <p className="font-medium text-slate-900">Permanent Address</p>
                <p>{student.permanentAddress}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Briefcase className="text-slate-400 mt-0.5" size={16} />
              <div>
                <p className="font-medium text-slate-900">Occupation</p>
                <p>{student.occupationType || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <GraduationCap className="text-slate-400 mt-0.5" size={16} />
              <div>
                <p className="font-medium text-slate-900">Institute / Workplace</p>
                <p>{student.instituteName || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Calendar className="text-slate-400 mt-0.5" size={16} />
              <div>
                <p className="font-medium text-slate-900">Joining Date</p>
                <p>{student.joiningDate ? new Date(student.joiningDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment History Card */}
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <IndianRupee size={18} className="text-emerald-500" />
                Payment History
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                student.rentStatus === 'Paid' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-rose-100 text-rose-700'
              }`}>
                Current Status: {student.rentStatus}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase tracking-wider font-medium">
                    <th className="py-3 px-6">For Month</th>
                    <th className="py-3 px-6">Amount</th>
                    <th className="py-3 px-6 text-right">Date Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-500">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment._id || payment.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-6 font-medium text-slate-900">{payment.month}</td>
                        <td className="py-3 px-6 text-emerald-600 font-medium">₹{payment.amount}</td>
                        <td className="py-3 px-6 text-right text-slate-500">
                          {new Date(payment.datePaid).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Documents Vault */}
          <div className="card p-6">
             <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <FileText size={18} className="text-blue-500" />
                Documents Vault
              </h2>
              
              <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 items-stretch">
                <input 
                  type="text" 
                  placeholder="Document Name (e.g. Aadhar)" 
                  className="input-field flex-1"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  required
                />
                <div className="flex gap-2 flex-1 items-stretch">
                  <input 
                    id="docFileInput"
                    type="file" 
                    accept="image/*"
                    className="input-field flex-1 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setDocFile(e.target.files[0])}
                    required={!docFile}
                  />
                  <div className="relative flex-shrink-0">
                    <input 
                      type="file" 
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        setDocFile(e.target.files[0]);
                        // Try to populate the name if it's empty
                        if (!docName) setDocName("Camera Photo");
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      title="Take Photo with Camera"
                    />
                    <button type="button" className="h-full px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                      <Camera size={16} />
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={uploading || !docFile} className="btn-primary whitespace-nowrap">
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </form>
              {docFile && <p className="text-xs text-emerald-600 mb-4 font-medium px-2 -mt-2">Selected File: {docFile.name}</p>}

              {documents.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500">
                  <p>No documents uploaded yet.</p>
                  <p className="text-xs mt-1 text-slate-400">Select an image file and upload it above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map(doc => (
                    <a 
                      key={doc._id || doc.id} 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200">
                        <FileText size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-medium text-slate-900 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
