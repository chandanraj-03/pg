import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ledger from './pages/Ledger';
import Students from './pages/Students';
import StudentDashboard from './pages/StudentDashboard';
import AddStudent from './pages/AddStudent';
import EditStudent from './pages/EditStudent';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/students" element={<Students />} />
            <Route path="/student/:id" element={<StudentDashboard />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/edit-student/:id" element={<EditStudent />} />
            <Route path="/settings" element={<Settings />} />
            {/* Future routes:
            <Route path="/students/:id" element={<StudentDetails />} />
            */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
