import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { RequireAuth } from "./components/common/RequireAuth";
import { VehicleList } from "./features/vehicles/VehicleList";
import { Login } from "./features/auth/Login";
import { Register } from "./features/auth/Register";
import { BookingForm } from "./features/bookings/BookingForm";
import { BookingList } from "./features/bookings/BookingList";
import { OwnerDashboard } from "./features/owner/OwnerDashboard";
import { AdminPanel } from "./features/admin/AdminPanel";

// Initialize QueryClient
const queryClient = new QueryClient();

const Navigation = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="glass-nav">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center text-white font-bold text-xl shadow-lg">R</div>
                        <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">RentLanka</Link>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Vehicles</Link>
                        {user ? (
                            <>
                                <Link to="/bookings" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">My Bookings</Link>
                                {user.role === "OWNER" && <Link to="/owner" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Owner Panel</Link>}
                                {user.role === "ADMIN" && <Link to="/admin" className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Admin Panel</Link>}
                                <div className="h-4 w-px bg-slate-700"></div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-400 hidden md:block">Hi, {user.name.split(' ')[0]}</span>
                                    <button onClick={logout} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded-md">Logout</button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign in</Link>
                                <Link to="/register" className="text-sm font-medium bg-white text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <BrowserRouter>
                    <div className="min-h-screen flex flex-col bg-[#020617] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
                        <Toaster position="top-center" toastOptions={{
                            style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
                        }} />
                        <Navigation />
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<VehicleList />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                
                                {/* Protected */}
                                <Route path="/book/:id" element={<RequireAuth><BookingForm /></RequireAuth>} />
                                <Route path="/bookings" element={<RequireAuth><BookingList /></RequireAuth>} />
                                <Route path="/owner" element={<RequireAuth roles={['OWNER', 'ADMIN']}><OwnerDashboard /></RequireAuth>} />
                                <Route path="/admin" element={<RequireAuth roles={['ADMIN']}><AdminPanel /></RequireAuth>} />
                            </Routes>
                        </main>
                        <footer className="border-t border-slate-800/60 py-8 mt-12 text-center text-slate-500 text-sm">
                            <p>© {new Date().getFullYear()} RentLanka. Built for Sri Lanka.</p>
                        </footer>
                    </div>
                </BrowserRouter>
            </AuthProvider>
        </QueryClientProvider>
    );
};
export default App;
