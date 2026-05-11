import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRestaurant, getMenuItems } from "../api/menu";
import { addToCart } from "../api/cart";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function Restaurant() {
  const { restaurantId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    Promise.all([getRestaurant(restaurantId), getMenuItems(restaurantId)])
      .then(([rRes, mRes]) => {
        setRestaurant(rRes.data);
        setMenu(mRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleAddToCart = async (item) => {
    if (!user) return navigate("/signin");
    try {
      await addToCart({ restaurantId, menuItemId: item._id, name: item.name, quantity: 1, price: item.price, image: item.image });
      setMessage(t("item_added_to_cart"));
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || t("failed_add_cart"));
    }
  };

  const availableItems = menu.filter((item) => item.isAvailable);
  const categories = ["all", ...new Set(availableItems.map((i) => i.category).filter(Boolean))];
  const filtered = activeCategory === "all" ? availableItems : availableItems.filter((i) => i.category === activeCategory);

  if (loading)
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-5 w-48 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="skeleton h-40 w-full rounded-none" />
              <div className="p-4"><div className="skeleton h-5 w-3/4 mb-3" /><div className="skeleton h-4 w-full mb-2" /><div className="skeleton h-4 w-1/4" /></div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
                {restaurant?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{restaurant?.name}</h2>
                <p className="text-sm text-gray-500">{restaurant?.cuisineType?.join(" · ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-yellow-600 font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                {restaurant?.rating}
              </span>
              <span className="flex items-center gap-1 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                {restaurant?.location?.address}
              </span>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2 animate-slide-in">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          {message}
        </div>
      )}

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {cat === "all" ? t("all") : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, i) => (
          <div
            key={item._id}
            className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {item.image && (
              <div className="relative overflow-hidden h-40">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{item.name}</h4>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-orange-500">${item.price}</span>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                  {t("add_to_cart")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <p className="text-gray-400">No items found in this category.</p>
        </div>
      )}
    </div>
  );
}
