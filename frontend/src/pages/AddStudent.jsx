import { useState } from 'react';
import { Save, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AddStudent = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    fatherPhone: '',
    occupationType: 'Student',
    instituteName: '',
    rent: '',
    room: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const res = await api.post('/students/', {
        ...formData,
        rent: parseInt(formData.rent)
      });
      
      const newStudentId = res.data._id || res.data.id;

      if (aadhaarFile) {
        try {
          const formData = new FormData();
          formData.append('studentId', newStudentId);
          formData.append('name', 'Aadhaar Card');
          formData.append('file', aadhaarFile);
          await api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (error) {
          console.error("Failed to upload Aadhaar", error);
        }
      }

      if (idCardFile) {
        try {
          const formData = new FormData();
          formData.append('studentId', newStudentId);
          formData.append('name', 'College ID Card');
          formData.append('file', idCardFile);
          await api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (error) {
          console.error("Failed to upload ID Card", error);
        }
      }

      navigate('/students');
    } catch (error) {
      console.error("Failed to add student", error);
      alert("Failed to add student. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add New Student</h1>
        <p className="text-slate-500 mt-1">Enter details for the new PG tenant.</p>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Aadhaar Card Photo (Optional)</label>
              <div className="flex gap-2 items-stretch">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setAadhaarFile(e.target.files[0])}
                  className="input-field cursor-pointer flex-1 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
                <div className="relative flex-shrink-0">
                  <input 
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => setAadhaarFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Take Photo with Camera"
                  />
                  <button type="button" className="h-full px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                    <Camera size={16} />
                    Camera
                  </button>
                </div>
              </div>
              {aadhaarFile && <p className="text-xs text-emerald-600 mt-1 font-medium">Selected: {aadhaarFile.name}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">College ID Card Photo (Optional)</label>
              <div className="flex gap-2 items-stretch">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setIdCardFile(e.target.files[0])}
                  className="input-field cursor-pointer flex-1 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
                <div className="relative flex-shrink-0">
                  <input 
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => setIdCardFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Take Photo with Camera"
                  />
                  <button type="button" className="h-full px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                    <Camera size={16} />
                    Camera
                  </button>
                </div>
              </div>
              {idCardFile && <p className="text-xs text-emerald-600 mt-1 font-medium">Selected: {idCardFile.name}</p>}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary" disabled={uploading}>Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={uploading}>
              <Save size={18} />
              {uploading ? 'Saving...' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
