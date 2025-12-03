// // Login.jsx
// import React, { useState } from "react";
// import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// const API_URL = "https://vanaras.onrender.com/api/v1/superadmin/login";

// function Login() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const response = await fetch(API_URL, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ email, password }),
//             });

//             const data = await response.json();
//             console.log("Login Response:", data);

//             if (response.ok && data.token) {
//                 localStorage.setItem("token", data.token);
//                 localStorage.setItem("user", JSON.stringify(data.user));

//                 toast.success("Login Successful!");

//                 if (data.user.role === "superadmin") {
//                     navigate("/superadmin/dashboard");
//                 } else if (data.user.role === "Production Department") {
//                     navigate("/employees");
//                 }
                
//                 else {
//                     navigate("/assignworkProduction");
//                 }
//             } else {
//                 toast.error(data.message || "Invalid credentials");
//             }
//         } catch (error) {
//             toast.error("Network error");
//         }

//         setLoading(false);
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
//             <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">

//                 <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
//                     Login
//                 </h2>

//                 <form onSubmit={handleLogin} className="space-y-5">
//                     {/* Email */}
//                     <div>
//                         <label className="text-gray-700 text-sm font-medium">Email</label>
//                         <div className="relative mt-1">
//                             <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
//                             <input
//                                 type="email"
//                                 className="w-full pl-10 pr-3 py-3 border rounded-lg"
//                                 placeholder="you@example.com"
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 required
//                             />
//                         </div>
//                     </div>

//                     {/* Password */}
//                     <div>
//                         <label className="text-gray-700 text-sm font-medium">Password</label>
//                         <div className="relative mt-1">
//                             <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
//                             <input
//                                 type={showPassword ? "text" : "password"}
//                                 className="w-full pl-10 pr-10 py-3 border rounded-lg"
//                                 placeholder="********"
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                             />
//                             <button
//                                 type="button"
//                                 className="absolute right-3 top-3 text-gray-500"
//                                 onClick={() => setShowPassword(!showPassword)}
//                             >
//                                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                             </button>
//                         </div>
//                     </div>

//                     {/* Login Button */}
//                     <button
//                         type="submit"
//                         className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//                         disabled={loading}
//                     >
//                         {loading ? "Loading..." : "Login"}
//                     </button>
//                 </form>

//             </div>
//         </div>
//     );
// }

// export default Login;





import React, { useState } from "react";
// Import useNavigate for actual routing
import { useNavigate } from "react-router-dom";
// Import for external toast library
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Don't forget to import the CSS

import { Mail, Lock, LogIn, Eye, EyeOff, Sparkles } from "lucide-react";
import logo from '../Images/logo.png';

// API URL remains the same
const API_URL = "https://vanaras.onrender.com/api/v1/superadmin/login";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // 1. Use the actual useNavigate hook
    const navigate = useNavigate();

    // The custom showToast and navigate functions are removed, 
    // as we now use react-toastify and useNavigate.

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("Login Response:", data);

            if (response.ok && data.token) {
                // 2. Use localStorage for persistent token and user storage
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                // 3. Use react-toastify for notifications
                toast.success("Login Successful!");

                // Navigate based on user role
                if (data.user.role === "superadmin") {
                    navigate("/superadmin/dashboard");
                } else if (data.user.role === "Production Department") {
                    navigate("/employees");
                } else {
                    // Fallback navigation from the original logic
                    navigate("/assignworkProduction");
                }
            } else {
                // Use react-toastify for error
                toast.error(data.message || "Invalid credentials");
            }
        } catch (error) {
            // Use react-toastify for network error
            toast.error("Network error");
        }

        setLoading(false);
    };

    return (
        <>
            {/* Remove custom toast container, as react-toastify handles it via ToastContainer placed in the root app */}
            {/* The rest of your visual component structure remains the same */}

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ffdf0f] via-[#000000] to-[#ffdf0f] p-6 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-md relative z-10 animate-fadeIn">
                    <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl transform transition-all duration-500 hover:shadow-indigo-500/20">

                        {/* Header with Icon */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-40    flex items-center justify-center mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-6 ">
                                <img src={logo} className="text-white" size={32} />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-gray-500 text-sm">Sign in to continue to your account</p>
                        </div>

                        {/* Use form element for proper submission handling */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email Input */}
                            <div className="group">
                                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail
                                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${focusedInput === 'email' ? 'text-indigo-600 scale-110' : 'text-gray-400'
                                            }`}
                                        size={20}
                                    />
                                    <input
                                        type="email"
                                        className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedInput('email')}
                                        onBlur={() => setFocusedInput(null)}
                                        required // Added to match the second snippet's requirement
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="group">
                                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock
                                        className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${focusedInput === 'password' ? 'text-indigo-600 scale-110' : 'text-gray-400'
                                            }`}
                                        size={20}
                                    />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedInput('password')}
                                        onBlur={() => setFocusedInput(null)}
                                        required // Added to match the second snippet's requirement
                                    />
                                    <button
                                        type="button" // Important to prevent form submission
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors duration-300"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600 group-hover:text-indigo-600 transition-colors">
                                        Remember me
                                    </span>
                                </label>
                                <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit" // Set type to submit for form handling
                                className="w-full py-4 bg-gradient-to-br from-[#ffdf0f]  to-[#000000] text-white rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={loading || !email || !password}
                            >
                                {loading ? (
                                    <>
                                        {/* Added small fix for border-width on spin animation */}
                                        <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <LogIn size={20} />
                                    </>
                                )}
                            </button>
                        </form> {/* Closing form tag */}

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <button type="button" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Sign up
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="mt-6 flex items-center justify-center gap-2 text-white/80 text-sm">
                        <Lock size={16} />
                        <span>Secured with Traxo</span>
                    </div>
                </div>

                {/* The styles below are for the visual design and are kept */}
                <style>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .animate-fadeIn {
                        animation: fadeIn 0.6s ease-out;
                    }

                    .delay-500 {
                        animation-delay: 0.5s;
                    }

                    .delay-1000 {
                        animation-delay: 1s;
                    }

                    /* Custom Toast styles removed as react-toastify is used */
                `}</style>
            </div>

            {/* Note: In a real app, ToastContainer is usually added to the main App.js/Layout component */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
        </>
    );
}

export default Login;