import React from 'react';

const TABS = [
  { key: 'donations',  label: 'Donations' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'contacts',   label: 'Contacts' },
  { key: 'prayers',    label: 'Prayers' },
  { key: 'notary',     label: 'Notary' },
  { key: 'resources',  label: 'Resources' },
];

const TabBar = ({ activeTab, onChange }) => (
  <div className="flex border-b border-slate-800">
    {TABS.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        data-testid={`admin-tab-${tab.key}`}
        className={`px-6 py-4 font-semibold capitalize transition-colors ${
          activeTab === tab.key
            ? 'bg-amber-500 text-slate-900'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default TabBar;
