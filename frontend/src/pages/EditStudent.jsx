import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    fatherPhone: '',
    occupationType: 'Student',
    instituteName: '',
    rent: '',
    room: '',
    rentStatus: 'Paid'
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`/students/${id}`);
        // Remove the id/alias from form data if present, or just spread
        setFormData({
          name: response.data.name,
          phone: response.data.phone,
          fatherPhone: response.data.fatherPhone,
          occupationType: response.data.occupationType,
          instituteName: response.data.instituteName,
          rent: response.data.rent,
          room: response.data.room,
          rentStatus: response.data.rentStatus
        });
      } catch (error) {
        console.error("Failed to fetch student details", error);
        alert("Failed to load student data.");
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/students/${id}`, {
        ...formData,
        rent: parseInt(formData.rent)
      });
      navigate('/students');
    } catch (error) {
      console.error("Failed to update student", error);
      alert("Failed to update student. Please try again.");
    }
  };

  if (loading) {
    return <div className="p-8">Loading student details...</div>;
  }

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Student</h1>
        <p className="text-slate-500 mt-1">Update details for the PG tenant.</p>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Room Number</label>
              <input type="text" name="room" value={formData.room} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Father's Phone Number</label>
              <input type="tel" name="fatherPhone" value={formData.fatherPhone} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Occupation Status</label>
              <select name="occupationType" value={formData.occupationType} onChange={handleChange} className="input-field">
                <option value="Student">Student</option>
                <option value="Working Professional">Working Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Institute / Company Name</label>
              <input type="text" name="instituteName" value={formData.instituteName} onChange={handleChange} className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Rent (₹)</label>
              <input type="number" name="rent" value={formData.rent} onChange={handleChange} className="input-field" required />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rent Status</label>
              <select name="rentStatus" value={formData.rentStatus} onChange={handleChange} className="input-field">
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;
