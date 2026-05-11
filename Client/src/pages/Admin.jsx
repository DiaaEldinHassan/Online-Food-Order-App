import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  getAllOrders, updateOrderStatus,
  createRestaurant, updateRestaurant, deleteRestaurant,
  addMenuItem, updateMenuItem, deleteMenuItem,
  uploadMenuItemImage,
} from "../api/admin";
import { getRestaurants } from "../api/menu";

const ORDER_STATUSES = ["placed", "preparing", "out-for-delivery", "delivered", "cancelled"];

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-400";

export default function Admin() {
  const { t } = useTranslation();

  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgInputRef = useRef(null);

  const [rForm, setRForm] = useState({ name: "", cuisineType: "", location: { address: "" } });
  const [editingRestaurant, setEditingRestaurant] = useState(null);

  const [mForm, setMForm] = useState({ name: "", description: "", price: "", category: "", image: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");

  const notify = (text, type = "success") => { setMessage({ text, type }); setTimeout(() => setMessage({ text: "", type: "" }), 3000); };
  const refreshRestaurants = () => getRestaurants().then((r) => setRestaurants(r.data)).catch(console.error);

  useEffect(() => {
    if (tab === "orders") getAllOrders().then((r) => setOrders(r.data)).catch(console.error);
    if (tab === "restaurants" || tab === "menu") refreshRestaurants();
  }, [tab]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      notify(t("order_status_updated"));
    } catch (err) { notify(err.response?.data?.message || "Failed", "error"); }
  };

  const handleRestaurantSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...rForm, cuisineType: rForm.cuisineType.split(",").map((s) => s.trim()) };
    try {
      if (editingRestaurant) { await updateRestaurant(editingRestaurant, payload); notify(t("restaurant_updated")); }
      else { await createRestaurant(payload); notify(t("restaurant_created")); }
      setRForm({ name: "", cuisineType: "", location: { address: "" } });
      setEditingRestaurant(null);
      refreshRestaurants();
    } catch (err) { notify(err.response?.data?.message || "Failed", "error"); }
  };

  const handleDeleteRestaurant = async (id) => {
    try { await deleteRestaurant(id); setRestaurants((prev) => prev.filter((r) => r._id !== id)); notify(t("restaurant_deleted")); }
    catch (err) { notify(err.response?.data?.message || "Failed", "error"); }
  };

  const handleMenuItemSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...mForm, price: Number(mForm.price) };
    try {
      if (editingItem) { await updateMenuItem(selectedRestaurant, editingItem, payload); notify(t("menu_item_updated")); }
      else { await addMenuItem(selectedRestaurant, payload); notify(t("menu_item_added")); }
      setMForm({ name: "", description: "", price: "", category: "", image: "" });
      setEditingItem(null);
      refreshRestaurants();
    } catch (err) { notify(err.response?.data?.message || "Failed", "error"); }
  };

  const handleDeleteMenuItem = async (restaurantId, itemId) => {
    try { await deleteMenuItem(restaurantId, itemId); notify(t("menu_item_deleted")); refreshRestaurants(); }
    catch (err) { notify(err.response?.data?.message || "Failed", "error"); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const result = await uploadMenuItemImage(file);
      setMForm((prev) => ({ ...prev, image: result.url }));
      notify("Image uploaded successfully");
    } catch (err) {
      notify(err.response?.data?.message || "Image upload failed", "error");
    } finally {
      setUploadingImg(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  };

  const tabs = [
    { key: "orders", label: t("all_orders"), icon: "📋" },
    { key: "restaurants", label: t("restaurants"), icon: "🏪" },
    { key: "menu", label: t("menu"), icon: "📄" },
  ];

  const statusStyles = {
    placed: "bg-yellow-100 text-yellow-700",
    preparing: "bg-blue-100 text-blue-700",
    "out-for-delivery": "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t("admin_panel")}</h2>
      </div>

      {message.text && (
        <div className={`text-sm mb-5 rounded-xl px-4 py-3 border animate-slide-in flex items-center gap-2 ${
          message.type === "error" ? "text-red-600 bg-red-50 border-red-200" : "text-green-700 bg-green-50 border-green-200"
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              tab === key ? "bg-orange-500 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="flex flex-col gap-3">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No orders yet.</div>
          ) : (
            orders.map((order, i) => (
              <div key={order._id} className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <div>
                    <span className="font-medium text-gray-800">#{order._id.slice(-6)}</span>
                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[order.status] || "bg-gray-100 text-gray-600"}`}>
                      {order.status}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-orange-500">${order.totalAmount}</span>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "restaurants" && (
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 animate-scale-in">
            <div className="flex items-center gap-2 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              <h3 className="font-semibold text-gray-800">{editingRestaurant ? t("edit_restaurant") : t("add_restaurant")}</h3>
            </div>
            <form onSubmit={handleRestaurantSubmit} className="flex flex-col gap-3 max-w-lg">
              <input placeholder={t("restaurant_name")} value={rForm.name} onChange={(e) => setRForm({ ...rForm, name: e.target.value })} required className={inputCls} />
              <input placeholder={t("cuisine_types")} value={rForm.cuisineType} onChange={(e) => setRForm({ ...rForm, cuisineType: e.target.value })} className={inputCls} />
              <input placeholder={t("address")} value={rForm.location.address} onChange={(e) => setRForm({ ...rForm, location: { address: e.target.value } })} className={inputCls} />
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                  {editingRestaurant ? t("update") : t("create")}
                </button>
                {editingRestaurant && (
                  <button type="button" onClick={() => { setEditingRestaurant(null); setRForm({ name: "", cuisineType: "", location: { address: "" } }); }} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
                    {t("cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="flex flex-col gap-3">
            {restaurants.map((r, i) => (
              <div key={r._id} className="bg-white border border-gray-200 rounded-xl px-6 py-4 flex items-center justify-between flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-sm font-bold text-orange-500">{r.name?.[0]?.toUpperCase()}</div>
                  <span className="font-medium text-gray-800">{r.name}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingRestaurant(r._id); setRForm({ name: r.name, cuisineType: r.cuisineType?.join(", ") || "", location: r.location || { address: "" } }); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
                    {t("edit")}
                  </button>
                  <button onClick={() => handleDeleteRestaurant(r._id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 active:scale-[0.98] transition-all cursor-pointer">
                    {t("delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "menu" && (
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 animate-scale-in">
            <div className="flex items-center gap-2 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              <h3 className="font-semibold text-gray-800">{editingItem ? t("edit_menu_item") : t("add_menu_item")}</h3>
            </div>
            <form onSubmit={handleMenuItemSubmit} className="flex flex-col gap-3 max-w-lg">
              <select value={selectedRestaurant} onChange={(e) => setSelectedRestaurant(e.target.value)} required className={inputCls}>
                <option value="">{t("select_restaurant")}</option>
                {restaurants.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
              <input placeholder={t("name")} value={mForm.name} onChange={(e) => setMForm({ ...mForm, name: e.target.value })} required className={inputCls} />
              <input placeholder={t("description")} value={mForm.description} onChange={(e) => setMForm({ ...mForm, description: e.target.value })} className={inputCls} />
              <input type="number" placeholder={t("price")} value={mForm.price} onChange={(e) => setMForm({ ...mForm, price: e.target.value })} required className={inputCls} />
              <input placeholder={t("category")} value={mForm.category} onChange={(e) => setMForm({ ...mForm, category: e.target.value })} className={inputCls} />
              <div className="flex gap-2">
                <input placeholder={t("image_url")} value={mForm.image} onChange={(e) => setMForm({ ...mForm, image: e.target.value })} className={inputCls} />
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  disabled={uploadingImg}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-orange-300 text-orange-600 bg-orange-50 rounded-xl text-sm font-medium hover:bg-orange-100 transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {uploadingImg ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  )}
                  {uploadingImg ? "Uploading..." : "Upload"}
                </button>
                <input ref={imgInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
                  {editingItem ? t("update") : t("add")}
                </button>
                {editingItem && (
                  <button type="button" onClick={() => { setEditingItem(null); setMForm({ name: "", description: "", price: "", category: "", image: "" }); }} className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
                    {t("cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="flex flex-col gap-3">
            {restaurants.map((r) =>
              r.menu?.map((item) => (
                <div key={item._id} className="bg-white border border-gray-200 rounded-xl px-6 py-3 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{r.name}</span>
                    <span className="font-medium text-gray-800">{item.name}</span>
                    <span className="text-sm font-bold text-orange-500">${item.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setSelectedRestaurant(r._id); setEditingItem(item._id); setMForm({ name: item.name, description: item.description || "", price: item.price, category: item.category || "", image: item.image || "" }); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-all cursor-pointer">
                      {t("edit")}
                    </button>
                    <button onClick={() => handleDeleteMenuItem(r._id, item._id)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 active:scale-[0.98] transition-all cursor-pointer">
                      {t("delete")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
