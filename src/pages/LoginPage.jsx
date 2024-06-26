import { useState, useEffect, useMemo } from "react";
import { loginUser } from "../utils/request";
import { useDispatch } from "react-redux";
import { login } from "../features/user/userSlice";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Link } from "react-router-dom";
import validator from "validator";
import Cookies from "universal-cookie";
import { fetchMainData } from "../features/main/mainSlice";
import { fetchChartData } from "../features/chart/chartDataSlice";
import GoogleIcon from "@mui/icons-material/Google";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cookie = useMemo(() => new Cookies(), []);
  const reactEnv = "production";
  const backendURL =
    reactEnv === "production"
      ? "https://expense-tracker-backend-0ijd.onrender.com"
      : "http://localhost:8000";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const username = urlParams.get("username");
    const userId = urlParams.get("userId");
    if (token) {
      dispatch(login({ token, user: username, userId }));
      dispatch(fetchMainData({ token, userId }));
      dispatch(fetchChartData({ token }));
      cookie.set("token", token, {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "none",
        secure: true,
      });
      toast.success("Login successful");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    }
  }, [navigate, dispatch, cookie]);

  const googleAuth = async () => {
    window.open(`${backendURL}/auth/google`, "_self");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        return toast.error("Please provide email and password");
      }

      if (!validator.isEmail(email)) {
        return toast.error("Please provide a valid email address");
      }

      const userData = await loginUser({ email, password });

      if (!userData.token) {
        return toast.error("Wrong credentials, check email or password");
      }
      dispatch(login(userData));
      dispatch(
        fetchMainData({ token: userData.token, userId: userData.userId })
      );
      dispatch(fetchChartData({ token: userData.token }));
      cookie.set("token", userData.token, {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "none",
        secure: true,
      });
      toast.success("Login successful");
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error", error);
    }
  };
  return (
    <div className="h-[100vh] flex flex-col gap-5 justify-center items-center">
      <div className="w-[40%]">
        <h1 className="text-4xl text-left font-bold">Sign In</h1>
        <h4 className="text-gray-500 font-bold mt-3 text-xl">
          Log into your account
        </h4>
      </div>
      <form className="p-10 rounded-xl w-[40%] bg-white shadow-xl flex flex-col">
        <label className="text-black text-lg" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-100 p-3 border-2 border-gray-200 rounded-md outline-none text-black"
        />
        <label className="text-black text-lg mt-5" htmlFor="passowrd">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-100 p-3 border-2 border-gray-200 rounded-md outline-none text-black"
        />
        <button
          className="bg-black text-white py-2 pt-3 text-lg rounded-md mt-10 mb-4"
          onClick={handleSubmit}
        >
          Sign In
        </button>
        <p className="text-black text-lg mt-5">
          Don&apos;t have an account?
          <Link to="/register" className="text-black ml-1 underline">
            Sign Up
          </Link>
        </p>
      </form>
      <h4 className="text-black font-bold mt-3 text-xl">or</h4>
      <button
        className="bg-black text-white w-[40%] flex gap-1 justify-center items-center py-2 pt-3 text-lg rounded-md"
        onClick={googleAuth}
      >
        <GoogleIcon />
        Sign in with Google
      </button>
      <ToastContainer />
    </div>
  );
}
export default LoginPage;
