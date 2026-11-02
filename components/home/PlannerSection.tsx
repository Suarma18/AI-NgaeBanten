"use client";

import type { PlanState } from "./usePlan";
import PlanInputCards from "./PlanInputCards";
import ChecklistCard from "./ChecklistCard";
import BudgetSidebar from "./BudgetSidebar";

interface PlannerSectionProps {
  plan: PlanState;
}

export default function PlannerSection({ plan }: PlannerSectionProps) {
  return (
    <section className="planner-section wrap" id="perencana">
      <div className="section-heading">
        <span className="section-kicker">PERENCANA KEBUTUHAN</span>
        <h2>Apa yang perlu disiapkan?</h2>
        <p>Tulis kebutuhan yang sudah diketahui, lalu periksa daftar dan lengkapi harganya bersama keluarga.</p>
      </div>

      <div className="planner-layout">
        <div className="planner-main">
          <PlanInputCards plan={plan} />
          <ChecklistCard plan={plan} />
        </div>

        <BudgetSidebar plan={plan} />
      </div>
    </section>
  );
}

