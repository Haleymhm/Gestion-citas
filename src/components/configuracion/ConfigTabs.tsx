"use client";
import React, { useState } from "react";
import ScheduleEditor from "./ScheduleEditor";
import HolidaysEditor from "./HolidaysEditor";
import BrandingEditor from "./BrandingEditor";

type Tab = 'schedule' | 'holidays' | 'branding';

const TABS: { key: Tab; label: string; icon: string; description: string }[] = [
  { key: 'schedule', label: 'Horarios', icon: '🕐', description: 'Horario semanal de la clínica' },
  { key: 'holidays', label: 'Feriados', icon: '📅', description: 'Días no laborables' },
  { key: 'branding', label: 'Marca', icon: '🎨', description: 'Logo, colores y nombre para PDFs y emails' },
];

export default function ConfigTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('schedule');

  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'schedule' && <ScheduleEditor />}
        {activeTab === 'holidays' && <HolidaysEditor />}
        {activeTab === 'branding' && <BrandingEditor />}
      </div>
    </div>
  );
}
