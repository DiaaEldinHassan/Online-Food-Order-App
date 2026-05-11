import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getProfile, updateProfile, uploadProfilePic } from "../api/profile";

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-400";

export default function Profile() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("info");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [infoForm, setInfoForm] = useState({ name: "", email: "", password: "" });

  const [addrForm, setAddrForm] = useState({ title: "", street: "", city: "", zipCode: "", isDefault: false });
  const [showAddrForm, setShowAddrForm] = useState(false);

  const notify = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const fetchProfile = () =>
    getProfile()
      .then((res) => {
        setProfile(res.data);
        setInfoForm({ name: res.data.name, email: res.data.email, password: "" });
      })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { fetchProfile(); }, []);

  const handlePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadProfilePic(file);
      setProfile((prev) => ({ ...prev, profilePic: result.profilePic }));
      notify("Profile picture updated");
    } catch (err) {
      notify(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: infoForm.name, email: infoForm.email };
      if (infoForm.password) payload.password = infoForm.password;
      await updateProfile(payload);
      notify(t("profile_updated"));
      fetchProfile();
    } catch (err) {
      notify(err.response?.data?.message || t("update_failed"), "error");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ address: addrForm });
      notify(t("profile_updated"));
      setAddrForm({ title: "", street: "", city: "", zipCode: "", isDefault: false });
      setShowAddrForm(false);
      fetchProfile();
    } catch (err) {
      notify(err.response?.data?.message || t("update_failed"), "error");
    }
  };

  if (loading)
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="skeleton h-48 w-full mb-6 rounded-2xl" />
        <div className="skeleton h-48 w-full rounded-2xl" />
      </div>
    );

  const tabs = [
    { key: "info", label: t("my_profile"), icon: "👤" },
    { key: "addresses", label: t("addresses"), icon: "📍" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">{t("my_profile")}</h2>

      {message.text && (
        <div className={`text-sm mb-5 rounded-xl px-4 py-3 border animate-slide-in flex items-center gap-2 ${
          message.type === "error" ? "text-red-600 bg-red-50 border-red-200" : "text-green-700 bg-green-50 border-green-200"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              tab === key ? "bg-orange-500 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-scale-in">
            <div className="flex items-center gap-5 mb-6">
              <div className="relative group">
                <div className={`w-16 h-16 rounded-2xl ${profile.profilePic ? "" : "bg-orange-100"} flex items-center justify-center text-2xl font-bold text-orange-500 overflow-hidden`}>
                  {profile.profilePic ? (
                    <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    profile.name?.[0]?.toUpperCase()
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-all shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePicUpload}
                  className="hidden"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">{profile.name}</p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>
            {uploading && (
              <div className="mb-4 text-sm text-orange-600 bg-orange-50 rounded-xl px-4 py-2 flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>
                Uploading...
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-gray-400 text-xs mb-1">{t("role")}</p>
                <p className="font-medium text-gray-700 capitalize">{profile.role}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-gray-400 text-xs mb-1">{t("member_since")}</p>
                <p className="font-medium text-gray-700">{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">{t("phones")}</p>
              {profile.phones?.length ? (
                <div className="flex flex-wrap gap-2">
                  {profile.phones.map((p, i) => (
                    <span key={i} className="bg-orange-50 text-orange-600 text-sm px-3 py-1 rounded-full border border-orange-200">{p}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t("no_phones")}</p>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-scale-in">
            <div className="flex items-center gap-2 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              <h3 className="font-semibold text-gray-800">{t("save_changes")}</h3>
            </div>
            <form onSubmit={handleInfoSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">{t("full_name")}</label>
                <input value={infoForm.name} onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })} className={inputCls} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">{t("email")}</label>
                <input type="email" value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })} className={inputCls} required />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block font-medium">{t("new_password")}</label>
                <input type="password" placeholder="••••••••" value={infoForm.password} onChange={(e) => setInfoForm({ ...infoForm, password: e.target.value })} className={inputCls} />
              </div>
              <button type="submit" className="py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                {t("save_changes")}
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === "addresses" && (
        <div className="flex flex-col gap-4">
          {profile.addresses?.length ? (
            profile.addresses.map((addr, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl px-6 py-5 flex items-start justify-between gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800">{addr.title || "Address"}</span>
                      {addr.isDefault && (
                        <span className="text-xs font-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{[addr.street, addr.city, addr.zipCode].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 bg-white border border-gray-200 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              {t("no_addresses")}
            </div>
          )}

          {!showAddrForm ? (
            <button
              onClick={() => setShowAddrForm(true)}
              className="w-full py-3 border-2 border-dashed border-orange-300 text-orange-500 font-medium rounded-2xl hover:bg-orange-50 active:scale-[0.98] transition-all cursor-pointer"
            >
              + {t("add_address")}
            </button>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-scale-in">
              <div className="flex items-center gap-2 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <h3 className="font-semibold text-gray-800">{t("add_address")}</h3>
              </div>
              <form onSubmit={handleAddAddress} className="flex flex-col gap-3">
                <input placeholder={t("address_title")} value={addrForm.title} onChange={(e) => setAddrForm({ ...addrForm, title: e.target.value })} className={inputCls} />
                <input placeholder={t("street")} value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder={t("city")} value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} className={inputCls} />
                  <input placeholder={t("zip_code")} value={addrForm.zipCode} onChange={(e) => setAddrForm({ ...addrForm, zipCode: e.target.value })} className={inputCls} />
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer py-1">
                  <input type="checkbox" checked={addrForm.isDefault} onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })} className="w-4 h-4 accent-orange-500 rounded" />
                  {t("set_default")}
                </label>
                <div className="flex gap-3 pt-1">
                  <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm">{t("add")}</button>
                  <button type="button" onClick={() => setShowAddrForm(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">{t("cancel")}</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
