"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRIES, flagOf } from "@/lib/data/countries";
import { cn } from "@/lib/cn";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  defaultIso2?: string;
}

// Rich international phone field: a searchable country/dial-code selector plus
// the local number. Emits the combined value, e.g. "+44 7911123456".
export function PhoneInput({
  value,
  onChange,
  required,
  defaultIso2 = "GB",
}: PhoneInputProps) {
  const [iso2, setIso2] = useState(defaultIso2);
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const country = useMemo(
    () => COUNTRIES.find((c) => c.iso2 === iso2) ?? COUNTRIES[0],
    [iso2],
  );

  // Keep the empty-state in sync if the parent resets the value.
  useEffect(() => {
    if (value === "") setNumber("");
  }, [value]);

  // Close the dropdown on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function emit(nextIso2: string, rawNumber: string) {
    const c = COUNTRIES.find((x) => x.iso2 === nextIso2) ?? country;
    const digits = rawNumber.replace(/[^\d]/g, "");
    onChange(digits ? `${c.dial} ${digits}` : "");
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.includes(q),
    );
  }, [query]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="flex">
        {/* Country selector */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Select country dialing code"
          className="flex items-center gap-1.5 border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 transition-colors hover:bg-slate-100"
        >
          <span className="text-base leading-none">{flagOf(country.iso2)}</span>
          <span className="font-medium tabular-nums">{country.dial}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {/* Local number */}
        <input
          type="tel"
          inputMode="tel"
          required={required}
          value={number}
          onChange={(e) => {
            setNumber(e.target.value);
            emit(iso2, e.target.value);
          }}
          placeholder="7911 123456"
          className="w-full border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 z-30 mt-1 w-72 border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <ul className="max-h-60 overflow-auto py-1">
            {filtered.map((c) => (
              <li key={c.iso2}>
                <button
                  type="button"
                  onClick={() => {
                    setIso2(c.iso2);
                    setOpen(false);
                    setQuery("");
                    emit(c.iso2, number);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50",
                    c.iso2 === iso2 && "bg-red-50",
                  )}
                >
                  <span className="text-base leading-none">{flagOf(c.iso2)}</span>
                  <span className="flex-1 truncate text-slate-800">{c.name}</span>
                  <span className="tabular-nums text-slate-400">{c.dial}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-slate-500">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
