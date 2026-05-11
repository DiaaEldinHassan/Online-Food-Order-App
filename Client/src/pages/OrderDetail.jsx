import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, cancelOrder } from "../api/order";
import { processPayment } from "../api/payment";
import { useTranslation } from "react-i18next";

const statusConfig = {
  placed: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", icon: "📋" },
  preparing: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", icon: "👨‍🍳" },
  "out-for-delivery": { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", icon: "🚚" },
  delivered: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", icon: "✅" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", icon: "❌" },
};

const statusOrder = ["placed", "preparing", "out-for-delivery", "delivered"];

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [payForm, setPayForm] = useState({ method: "cod", cardNumber: "", cardHolder: "", expiryDate: "", cvv: "" });

  const fetchOrder = () =>
    getOrderById(orderId)
      .then((res) => setOrder(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { fetchOrder(); }, [orderId]);

  const handleCancel = async () => {
    try {
      await cancelOrder(orderId);
      fetchOrder();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || t("cancel_failed"), type: "error" });
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      await processPayment({ orderId, ...payForm });
      setMessage({ text: t("payment_processed"), type: "success" });
      fetchOrder();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || t("payment_failed"), type: "error" });
    }
  };

  if (loading)
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="skeleton h-40 w-full mb-5 rounded-2xl" />
        <div className="skeleton h-32 w-full rounded-2xl" />
      </div>
    );

  if (!order)
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <p className="text-gray-400">{t("order_not_found")}</p>
      </div>
    );

  const status = statusConfig[order.status] || { bg: "bg-gray-100", text: "text-gray-600" };
  const currentStatusIndex = statusOrder.indexOf(order.status);
  const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white transition-all placeholder:text-gray-400";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-orange-500 mb-6 transition-colors cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        {t("back_to_orders")}
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 animate-scale-in">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order #{order._id.slice(-6)}</h2>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {order.status !== "cancelled" && (
          <div className="flex items-center gap-2 mb-5">
            {statusOrder.map((s, i) => {
              const isActive = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;
              return (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"
                  } ${isCurrent ? "ring-2 ring-orange-300 ring-offset-2" : ""}`}>
                    {i + 1}
                  </div>
                  {i < statusOrder.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 transition-colors ${i < currentStatusIndex ? "bg-orange-500" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-gray-400 text-xs mb-1">{t("payment")}</p>
            <p className={`font-semibold capitalize ${order.paymentStatus === "paid" || order.paymentStatus === "completed" ? "text-green-600" : "text-yellow-600"}`}>
              {order.paymentStatus}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-gray-400 text-xs mb-1">{t("total")}</p>
            <p className="font-bold text-orange-500">${order.totalAmount?.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-gray-400 text-xs mb-1">{t("date")}</p>
            <p className="font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 animate-scale-in">
        <div className="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
          <h3 className="font-semibold text-gray-800">{t("items")}</h3>
        </div>
        <div className="flex flex-col gap-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <span className="font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400">x{item.quantity}</span>
                <span className="font-semibold text-gray-800">${item.priceAtPurchase}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message.text && (
        <div className={`text-sm mb-5 rounded-xl px-4 py-3 border animate-slide-in flex items-center gap-2 ${
          message.type === "error" ? "text-red-600 bg-red-50 border-red-200" : "text-green-700 bg-green-50 border-green-200"
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 flex-shrink-0 ${message.type === "error" ? "" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {message.type === "error" ? <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></> : <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>}
          </svg>
          {message.text}
        </div>
      )}

      {order.paymentStatus === "pending" && order.status !== "cancelled" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
            <h3 className="font-semibold text-gray-800">{t("pay_now")}</h3>
          </div>
          <form onSubmit={handlePayment} className="flex flex-col gap-3">
            <select value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })} className={inputCls}>
              <option value="cod">{t("cash_on_delivery")}</option>
              <option value="online">{t("online")}</option>
            </select>
            {payForm.method === "online" && (
              <>
                <input placeholder={t("card_number")} value={payForm.cardNumber} onChange={(e) => setPayForm({ ...payForm, cardNumber: e.target.value })} className={inputCls} />
                <input placeholder={t("card_holder")} value={payForm.cardHolder} onChange={(e) => setPayForm({ ...payForm, cardHolder: e.target.value })} className={inputCls} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder={t("expiry")} value={payForm.expiryDate} onChange={(e) => setPayForm({ ...payForm, expiryDate: e.target.value })} className={inputCls} />
                  <input placeholder={t("cvv")} value={payForm.cvv} onChange={(e) => setPayForm({ ...payForm, cvv: e.target.value })} className={inputCls} />
                </div>
              </>
            )}
            <button type="submit" className="py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm">
              {t("process_payment")}
            </button>
          </form>
        </div>
      )}

      {["placed", "preparing"].includes(order.status) && (
        <button
          onClick={handleCancel}
          className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          {t("cancel_order")}
        </button>
      )}
    </div>
  );
}
