import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../api/order";
import { useTranslation } from "react-i18next";

const statusConfig = {
  placed: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  preparing: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  "out-for-delivery": { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  delivered: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

export default function Orders() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}</div>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t("my_orders")}</h2>
        {orders.length > 0 && (
          <span className="text-sm text-gray-400">{orders.length} total</span>
        )}
      </div>

      {!orders.length ? (
        <div className="text-center py-20 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          <p className="text-lg text-gray-400 mb-4">{t("no_orders")}</p>
          <Link to="/" className="inline-flex px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-sm">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, i) => {
            const status = statusConfig[order.status] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-500" };
            return (
              <Link
                to={`/orders/${order._id}`}
                key={order._id}
                className="group bg-white border border-gray-200 rounded-xl px-6 py-5 card-hover animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center font-bold text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">Order #{order._id.slice(-6)}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-orange-500">${order.totalAmount?.toFixed(2)}</span>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
