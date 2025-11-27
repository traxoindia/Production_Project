import React, { useState } from "react";
import { Mail, Lock, LogIn, AlertTriangle, Eye, EyeOff } from "lucide-react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!email || !password) {
            setError("Please enter both email and password.");
            setLoading(false);
            return;
        }

        console.log("Attempting login with:", { email, password });

        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            if (email === "test@example.com" && password === "password") {
                localStorage.setItem("token", "mock-jwt-token-12345");

                alert("Login successful! Redirecting to dashboard...");
            } else {
                setError("Invalid credentials. Please try again.");
            }
        } catch (apiError) {
            console.error("Login API Error:", apiError);
            setError("A network error occurred. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 to-indigo-100 p-6">
            <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-2xl border border-gray-200">

                <div className="text-center mb-10">
                    <LogIn className="w-14 h-14 text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-4xl font-extrabold text-gray-900">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-md text-gray-500">
                        Please log in to your account
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">

                    {error && (
                        <div className="p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-3 border border-red-300">
                            <AlertTriangle size={22} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <div className="mt-2 relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition"
                                placeholder="you@example.com"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="mt-2 relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />

                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition"
                                placeholder="********"
                                disabled={loading}
                            />

                            {/* Show / Hide Password Button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full py-3 flex justify-center items-center rounded-lg text-white text-md font-medium shadow-md transition-all 
                        ${loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}
                        `}
                        disabled={loading}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                                    5.291A7.962 7.962 0 014 12H0c0 3.042 
                                    1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5 mr-2" />
                                Sign In
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
