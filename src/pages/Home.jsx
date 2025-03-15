import React from "react";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import ImpactStats from "../components/landing/ImpactStats";
import Testimonials from "../components/landing/Testimonials";
import CallToAction from "../components/landing/CallToAction";

function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <ImpactStats />
      <Testimonials />
      <CallToAction />
    </div>
  );
}

export default Home;
