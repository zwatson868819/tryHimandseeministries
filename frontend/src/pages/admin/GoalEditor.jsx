import React from 'react';
import { Target, Edit, Check } from 'lucide-react';

const GoalEditor = ({ progress, editing, goalInput, onEditStart, onCancelEdit, onGoalInputChange, onSave }) => {
  if (!progress) return null;
  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 mb-8" data-testid="admin-goal-card">
      <div className="flex justify-between items-start mb-4 flex-wrap gap-3">
        <div className="flex items-center">
          <Target className="text-amber-400 mr-3" size={28} />
          <div>
            <h3 className="text-white font-bold text-lg">{progress.month} Outreach Goal</h3>
            <p className="text-slate-400 text-sm">
              ${Math.round(progress.raised).toLocaleString()} raised of ${Math.round(progress.goal).toLocaleString()} ({progress.percent}%)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  min="1"
                  step="50"
                  value={goalInput}
                  onChange={(e) => onGoalInputChange(e.target.value)}
                  data-testid="admin-goal-input"
                  className="pl-7 pr-3 py-2 w-32 bg-slate-950 border border-slate-700 rounded text-white"
                />
              </div>
              <button
                onClick={onSave}
                data-testid="admin-goal-save"
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <Check size={16} />
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onEditStart}
              data-testid="admin-goal-edit"
              className="px-4 py-2 bg-amber-500 text-slate-900 rounded font-semibold hover:bg-amber-400 transition-colors flex items-center"
            >
              <Edit className="mr-2" size={16} />
              Edit Goal
            </button>
          )}
        </div>
      </div>
      <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 ease-out"
          style={{ width: `${Math.max(progress.percent, progress.percent > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
};

export default GoalEditor;
