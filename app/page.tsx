"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  const features = [
    {
      title: "Smart Customization",
      description:
        "Personalized meal suggestions that match your taste, diet, and lifestyle.",
    },
    {
      title: "Auto Shopping Lists",
      description:
        "Your meal plan converts to organized shopping lists instantly.",
    },
    {
      title: "Save Time",
      description:
        "Plan your entire week in minutes. More living, less stress.",
    },
    {
      title: "Save Money",
      description:
        "Buy only what you need. Good for your wallet and the planet.",
    },
  ];

  return (
    <div className="bg-white">
      <div className="relative w-full min-h-screen md:min-h-[70vh] flex items-center justify-center overflow-hidden bg-[url('/mealprep.jpg')] bg-center bg-cover">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        <div className="relative z-10 px-6 py-16 md:py-0 text-center max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Plan. Cook. Enjoy.
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Simplify meal planning. Save time. Eat well.
          </p>
          <Button className="px-8 py-3 text-base md:text-lg bg-[#70e000] hover:bg-[#60d000] text-[#004b23] font-semibold rounded-lg transition-all hover:shadow-lg">
            <Link href="/plan/prep">Start Planning</Link>
          </Button>
        </div>
      </div>

      <section className="py-12 md:py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-[#004b23] mb-6">
            We handle the planning. You handle the cooking.
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed">
            WeeklyBite removes the mental load from meal planning. We help you
            eat healthier, save money, and reclaim your time—one week at a time.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#004b23] mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 md:p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl md:text-2xl font-semibold text-[#004b23] mb-3">
                  {feature.title}
                </h3>
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 bg-[#004b23]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to simplify your meals?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Join thousands eating better and saving time.
          </p>
          <Button className="px-8 py-3 text-base md:text-lg bg-[#70e000] hover:bg-[#60d000] text-[#004b23] font-semibold rounded-lg transition-all hover:shadow-lg">
            <Link href="/plan/prep">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
