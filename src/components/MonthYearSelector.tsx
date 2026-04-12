import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setMonthYear } from "../store/slices/summarySlice";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const MonthYearSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { month, year } = useAppSelector((state) => state.summary);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleMonthChange = (newMonth: number) => {
    dispatch(setMonthYear({ month: newMonth, year }));
  };

  const handleYearChange = (newYear: number) => {
    dispatch(setMonthYear({ month, year: newYear }));
  };

  return (
    <div className="flex gap-3 items-center">
      <select
        value={month}
        onChange={(e) => handleMonthChange(Number(e.target.value))}
        className="px-3 py-2 rounded-md border border-border bg-background text-fg text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-0"
      >
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => handleYearChange(Number(e.target.value))}
        className="px-3 py-2 rounded-md border border-border bg-background text-fg text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-0"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthYearSelector;