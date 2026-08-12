"use client";

import { motion } from "framer-motion";
import { WorkflowStep } from "@/types/installer";

interface Props {
  workflow: WorkflowStep[];
  companyName: string;
}

export default function WorkflowTimeline({ workflow, companyName }: Props) {
  if (!workflow || workflow.length === 0) return null;

  return (
    <>
      <hr className="border-border" />
      <div id="workflow" className="space-y-6 pt-4">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Installation Itinerary</h3>
          <p className="text-text-muted text-sm">
            What to expect when you book with {companyName}.
          </p>
        </div>

        <div className="relative border-l-2 border-[#E5E5E0] ml-[7px] space-y-8 pt-2 pb-2 mt-6">
          {workflow.map((step, index) => (
            <motion.div
              key={step.id || index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
              className="relative pl-8"
            >
              {/* Dot marker */}
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#1A5E38] ring-4 ring-white" />
              
              <div className="space-y-1.5">
                <h4 className="font-bold text-text-primary text-[15px]">
                  {step.title}
                </h4>
                <p className="text-text-muted text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
