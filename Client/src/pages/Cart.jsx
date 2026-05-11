import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCart, updateCartItem, removeFromCart, clearCart } from "../api/cart";
import { placeOrder } from "../api/order";
import { useTranslation } from "react-i18next";

export default function Cart() {
  const { t } = useTranslation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchCart = () =>
    getCart()
      .then((res) => setCart(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { fetchCart(); }, []);

  const handleUpdate = async (menuItemId, quantity) => {
    if (quantity < 1) return handleRemove(menuItemId);
    await updateCartItem(menuItemId, quantity);
    fetchCart();
  };

  const handleRemove = async (menuItemId) => {
    await removeFromCart(menuItemId);
    fetchCart();
  };

  const handleClear = async () => {
    await clearCart();
    fetchCart();
  };

  const handleCheckout = async () => {
    if (!cart?.items?.length) return;
    try {
      const res = await placeOrder({
        restaurantId: cart.items[0].restaurantId,
        items: cart.items.map((i) => ({ menuItemId: i.menuItemId, name: i.name, quantity: i.quantity, priceAtPurchase: i.price })),
        totalAmount: cart.totalAmount,
        paymentMethod: "cod",
      });
      navigate(`/orders/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || t("checkout_failed"));
    }
  };

  if (loading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="flex flex-col gap-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 w-full rounded-xl" />)}</div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t("your_cart")}</h2>
        {cart?.items?.length > 0 && (
          <span className="text-sm text-gray-400">{cart.items.length} {cart.items.length === 1 ? "item" : "items"}</span>
        )}
      </div>

      {error && (
        <div className="text-sm mb-5 rounded-xl px-4 py-3 border text-red-600 bg-red-50 border-red-200 animate-slide-in flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          {error}
        </div>
      )}

      {!cart?.items?.length ? (
        <div className="text-center py-20 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
          <p className="text-lg text-gray-400 mb-4">{t("cart_empty")}</p>
          <Link to="/" className="inline-flex px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all shadow-sm">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-6">
            {cart.items.map((item, i) => (
              <div
                key={item.menuItemId}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center gap-4 flex-wrap animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex-1 min-w-[140px]">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-sm text-gray-400 ml-2">${item.price} each</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdate(item.menuItemId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-lg font-medium text-gray-600 transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdate(item.menuItemId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-lg font-medium text-gray-600 transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                </div>
                <span className="font-bold text-gray-900 w-20 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  onClick={() => handleRemove(item.menuItemId)}
                  className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-900">${cart.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-base text-gray-500">Delivery</span>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Free</span>
            </div>
            <div className="border-t border-gray-100 pt-4 flex items-center justify-between mb-6">
              <span className="text-lg font-bold text-gray-900">{t("total")}</span>
              <span className="text-xl font-bold text-orange-500">${cart.totalAmount?.toFixed(2)}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
              >
                {t("clear_cart")}
              </button>
              <button
                onClick={handleCheckout}
                className="flex-[2] px-5 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                {t("checkout_cod")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
