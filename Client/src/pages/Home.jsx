import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRestaurants } from "../api/menu";
import { useTranslation } from "react-i18next";

const starIcon = <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;

export default function Home() {
  const { t } = useTranslation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants()
      .then((res) => setRestaurants(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-600 bg-orange-100 rounded-full mb-4">
              {t("welcome")}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Delicious food,{" "}
              <span className="text-orange-500">delivered fast</span>
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-lg">
              Browse restaurants, pick your favorites, and enjoy a seamless dining experience from the comfort of your home.
            </p>
            <div className="flex gap-3">
              <Link
                to={restaurants.length > 0 ? `#restaurants` : "#"}
                onClick={(e) => {
                  if (restaurants.length === 0) return;
                  e.preventDefault();
                  document.getElementById("restaurants")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 shadow-sm hover:shadow-md transition-all"
              >
                {t("restaurants")}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        </div>
      </section>

      <section id="restaurants" className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{t("restaurants")}</h2>
          <span className="text-sm text-gray-400">{restaurants.length} available</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="skeleton h-5 w-3/4 mb-3" />
                <div className="skeleton h-4 w-1/2 mb-2" />
                <div className="skeleton h-4 w-1/4 mb-2" />
                <div className="skeleton h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((r, i) => (
              <Link
                to={`/restaurant/${r._id}`}
                key={r._id}
                className="group bg-white border border-gray-200 rounded-2xl p-5 card-hover animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {r.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                    {starIcon}
                    {r.rating}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
                  {r.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {r.cuisineType?.join(" · ")}
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {r.location?.address}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
