import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp, sendOtp, verifyOtp, googleAuth } from "../api/auth";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

const InputField = ({ type, placeholder, value, onChange, required, icon }) => (
  <div className="relative">
    {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
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

const UserIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const MailIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const LockIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const PhoneIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;

export default function SignUp() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
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

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signUp(form);
      await sendOtp(form.email);
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || t("sign_up_failed"));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await verifyOtp(form.email, otp);
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || t("verify_otp_failed"));
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await sendOtp(form.email);
    } catch (err) {
      setError(err.response?.data?.message || t("send_otp_failed"));
    } finally {
      setResending(false);
    }
  };

  const fields = [
    { key: "username", type: "text", label: t("username"), icon: UserIcon },
    { key: "email", type: "email", label: t("email"), icon: MailIcon },
    { key: "password", type: "password", label: t("password"), icon: LockIcon },
    { key: "phone", type: "text", label: t("phone_optional"), icon: PhoneIcon },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {step === "form" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t("sign_up")}</h2>
                <p className="text-sm text-gray-500 mt-1">Create your account to get started.</p>
              </div>

              {error && (
                <div className="text-sm mb-5 rounded-xl px-4 py-3 border text-red-600 bg-red-50 border-red-200 animate-slide-in">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                {fields.map(({ key, type, label, icon }) => (
                  <InputField key={key} type={type} placeholder={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={key !== "phone"} icon={icon} />
                ))}
                <button type="submit" className="py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                  {t("sign_up")}
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

              <p className="mt-6 text-sm text-gray-500 text-center">
                {t("have_account")}{" "}
                <Link to="/signin" className="text-orange-500 font-semibold hover:text-orange-600">{t("sign_in")}</Link>
              </p>
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
                <button onClick={() => { setStep("form"); setError(""); setOtp(""); }} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 font-medium cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                  {t("sign_up")}
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
