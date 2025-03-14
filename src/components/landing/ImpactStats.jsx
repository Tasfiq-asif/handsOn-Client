import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const ImpactCounter = ({ value, label, suffix = "", delay = 0 }) => {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="text-4xl md:text-5xl font-bold">
        {value}
        {suffix}
      </div>
      <div className="mt-2 text-lg opacity-90">{label}</div>
    </motion.div>
  );
};

const ImpactStats = () => {
  const stats = [
    { value: 10000, label: "Volunteers", suffix: "+" },
    { value: 5000, label: "Events Completed", suffix: "+" },
    { value: 25000, label: "Hours Contributed", suffix: "+" },
    { value: 120, label: "Communities Served", suffix: "" },
  ];

  return (
    <section className="py-16 bg-green-600 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2
            className="text-3xl md:text-4xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Collective Impact
          </motion.h2>
          <motion.p
            className="mt-4 text-xl opacity-90 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Together, we're creating meaningful change in communities worldwide
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <ImpactCounter
              key={index}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactStats;
