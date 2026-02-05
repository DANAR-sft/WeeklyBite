export default async function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative w-full min-h-screen md:min-h-[70vh] flex items-center justify-center overflow-hidden bg-[url('/mealprep4.jpg')] bg-center bg-cover">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        <div className="relative z-10 px-6 py-16 md:py-0 text-center max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            About WeeklyBite
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Simplifying meal planning for busy people everywhere.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-[#004b23] mb-6">
            Our Mission
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            We believe that a busy schedule shouldn't mean sacrificing good
            meals. Our mission is to take the mental load out of the kitchen by
            removing the stress of planning and the chaos of last-minute grocery
            runs.
          </p>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            We're here to help you eat healthier, save money, and reclaim your
            time—one meal at a time.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004b23] mb-12 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold text-[#004b23] mb-3">
                Simplicity
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Meal planning should be easy, not complicated. We strip away the
                noise.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold text-[#004b23] mb-3">
                Health
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                Good nutrition matters. We help you make better choices for your
                family.
              </p>
            </div>
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold text-[#004b23] mb-3">
                Sustainability
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                We reduce food waste and help you make choices that benefit the
                planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 md:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004b23] mb-8">
            How It Started
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
            WeeklyBite was born from a simple frustration: the endless cycle of
            "What's for dinner?" We set out to create a tool that would solve
            this problem once and for all.
          </p>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            Today, we're helping thousands of people reclaim their evenings,
            save money on groceries, and rediscover the joy of cooking together
            as a family.
          </p>
        </div>
      </section>
    </div>
  );
}
