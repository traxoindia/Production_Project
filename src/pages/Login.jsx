// Login.jsx
import React, { useState } from "react";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const API_URL = "https://vanaras.onrender.com/api/v1/superadmin/login";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                toast.success("Login Successful!");

                if (data.user.role === "superadmin") {
                    navigate("/superadmin/dashboard");
                } else if (data.user.role === "Production Department") {
                    navigate("/assignworkProduction");
                }
                else {
                    navigate("/employees");
                }
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (error) {
            toast.error("Network error");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">

                <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
                    Login
                </h2>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="text-gray-700 text-sm font-medium">Email</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="email"
                                className="w-full pl-10 pr-3 py-3 border rounded-lg"
                                placeholder="you@example.com"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-gray-700 text-sm font-medium">Password</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-10 pr-10 py-3 border rounded-lg"
                                placeholder="********"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-3 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Login"}
                    </button>
                </form>

            </div>
        </div>
    );
}

export default Login;
