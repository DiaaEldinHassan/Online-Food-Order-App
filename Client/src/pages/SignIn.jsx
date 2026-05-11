import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signIn, sendOtp, verifyOtp, googleAuth } from "../api/auth";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";

const InputField = ({ type, placeholder, value, onChange, required, icon }) => (
  <div className="relative">
    {icon && (
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        {icon}
      </div>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-4 py-3 ${icon ? "pl-10" : ""} bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-400`}
    />
  </div>
);

const MailIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;

const LockIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;

export default function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState("credentials");
  const [otp, setOtp] = useState("");
  const [pendingData, setPendingData] = useState(null);
  const [resending, setResending] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError("");
      try {
        const res = await googleAuth(tokenResponse.access_token);
        login(res.data.accessToken, res.data.refreshToken, res.data.role);
        navigate("/");
      } catch (err) {
        setError(err.response?.data?.message || t("google_auth_failed"));
      }
    },
    onError: () => setError(t("google_auth_failed")),
  });

  const handleCredentials = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await signIn(form);
      login(res.data.accessToken, res.data.refreshToken, res.data.role);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || t("sign_in_failed");
      setError(msg);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await sendOtp(form.email);
      setPendingData(form);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || t("send_otp_failed"));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await verifyOtp(pendingData.email, otp);
      const res = await signIn(pendingData);
      login(res.data.accessToken, res.data.refreshToken, res.data.role);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t("verify_otp_failed"));
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await sendOtp(pendingData.email);
    } catch (err) {
      setError(err.response?.data?.message || t("send_otp_failed"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === "credentials" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t("sign_in")}</h2>
                <p className="text-sm text-gray-500 mt-1">Welcome back! Enter your credentials.</p>
              </div>

              {error && (
                <div className={`text-sm mb-5 rounded-xl px-4 py-3 border animate-slide-in ${
                  error.toLowerCase().includes("locked")
                    ? "text-orange-600 bg-orange-50 border-orange-200"
                    : "text-red-600 bg-red-50 border-red-200"
                }`}>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleCredentials} className="flex flex-col gap-4">
                <InputField type="email" placeholder={t("email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required icon={MailIcon} />
                <InputField type="password" placeholder={t("password")} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required icon={LockIcon} />
                <button type="submit" className="py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                  {t("sign_in")}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">{t("or")}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                onClick={() => handleGoogleLogin()}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer font-medium text-gray-700 text-sm"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t("google_sign_in")}
              </button>

              <div className="mt-6 flex flex-col gap-3 text-center text-sm">
                <p className="text-gray-500">
                  {t("no_account")}{" "}
                  <Link to="/signup" className="text-orange-500 font-semibold hover:text-orange-600">{t("sign_up")}</Link>
                </p>
                <button onClick={handleSendOtp} disabled={!form.email} className="text-orange-500 hover:text-orange-600 font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs">
                  {t("verify_email")} / {t("resend_otp")}
                </button>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t("verify_email")}</h2>
                <p className="text-sm text-gray-500 mt-1">{t("otp_sent")}</p>
              </div>
              {error && (
                <div className="text-sm mb-5 rounded-xl px-4 py-3 border text-red-600 bg-red-50 border-red-200 animate-slide-in">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <input
                  placeholder={t("enter_otp")}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-2xl tracking-[0.5em] font-mono text-center focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-300"
                />
                <button type="submit" className="py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                  {t("verify_otp")}
                </button>
              </form>
              <div className="mt-5 flex justify-between text-sm">
                <button onClick={() => { setStep("credentials"); setError(""); setOtp(""); }} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  {t("sign_in")}
                </button>
                <button onClick={handleResend} disabled={resending} className="text-orange-500 hover:text-orange-600 font-medium disabled:opacity-40 cursor-pointer">
                  {resending ? "Sending..." : t("resend_otp")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
