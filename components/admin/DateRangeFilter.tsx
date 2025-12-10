"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronDown } from "lucide-react";
import { format } from "date-fns";

interface DateRangeFilterProps {
  // onDateChange prop'u kaldırıldı - sadece URL güncellemesi yapılacak
}

const quickRanges = [
  { value: "allTime", label: "Tüm Zamanlar" },
  { value: "today", label: "Bugün" },
  { value: "yesterday", label: "Dün" },
  { value: "thisWeek", label: "Bu Hafta" },
  { value: "thisMonth", label: "Bu Ay" },
  { value: "thisYear", label: "Bu Yıl" },
  { value: "last7Days", label: "Son 7 Gün" },
  { value: "last30Days", label: "Son 30 Gün" },
  { value: "last90Days", label: "Son 90 Gün" },
];

export default function DateRangeFilter({}: DateRangeFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRange, setSelectedRange] = useState<string>(
    searchParams.get("range") || "thisMonth"
  );
  const [customStartDate, setCustomStartDate] = useState<string>(
    searchParams.get("startDate") || ""
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    searchParams.get("endDate") || ""
  );
  const [showCustomDates, setShowCustomDates] = useState(false);

  // URL'den state'i senkronize et
  useEffect(() => {
    const range = searchParams.get("range") || "thisMonth";
    const startParam = searchParams.get("startDate") || "";
    const endParam = searchParams.get("endDate") || "";

    setSelectedRange(range);
    setCustomStartDate(startParam);
    setCustomEndDate(endParam);
  }, [searchParams]);

  const calculateDateRange = (range: string): { start: Date; end: Date } => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (range) {
      case "allTime":
        // Tüm zamanlar için çok eski bir tarih (2000-01-01)
        start = new Date(2000, 0, 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "today":
        start = new Date(now);
        end = new Date(now);
        break;
      case "yesterday":
        start = new Date(now);
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        start = weekStart;
        end.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case "last7Days":
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "last30Days":
        start = new Date(now);
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "last90Days":
        start = new Date(now);
        start.setDate(now.getDate() - 89);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    return { start, end };
  };

  const updateURL = useCallback((range: string, startDate: string, endDate: string) => {
    const currentRange = searchParams.get("range");
    const currentStart = searchParams.get("startDate");
    const currentEnd = searchParams.get("endDate");

    // Aynı değerler ise URL'i güncelleme
    if (
      currentRange === range &&
      currentStart === startDate &&
      currentEnd === endDate
    ) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("range", range);
    if (range === "custom" && startDate && endDate) {
      params.set("startDate", startDate);
      params.set("endDate", endDate);
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }
    router.replace(`/admin/analiz?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      if (start <= end) {
        setSelectedRange("custom");
        setShowCustomDates(false);
        updateURL("custom", customStartDate, customEndDate);
      }
    }
  };

  const getDisplayText = (): string => {
    if (selectedRange === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      return `${format(start, "d MMM yyyy")} - ${format(end, "d MMM yyyy")}`;
    }
    const range = quickRanges.find((r) => r.value === selectedRange);
    return range ? range.label : "Bu Ay";
  };

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-sans font-medium text-gray-700">Tarih Aralığı:</span>
        </div>

        <div className="flex-1 flex flex-wrap gap-2">
          {quickRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => {
                setSelectedRange(range.value);
                setShowCustomDates(false);
                updateURL(range.value, "", "");
              }}
              className={`px-3 py-1.5 text-sm font-sans rounded transition-colors ${
                selectedRange === range.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {range.label}
            </button>
          ))}
          <button
            onClick={() => {
              setShowCustomDates(!showCustomDates);
              if (!showCustomDates) {
                setSelectedRange("custom");
              }
            }}
            className={`px-3 py-1.5 text-sm font-sans rounded transition-colors flex items-center gap-1 ${
              selectedRange === "custom"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Özel Tarih
            <ChevronDown className={`w-4 h-4 transition-transform ${showCustomDates ? "rotate-180" : ""}`} />
          </button>
        </div>

        {selectedRange !== "custom" && (
          <div className="text-sm font-sans text-gray-600">
            {getDisplayText()}
          </div>
        )}
      </div>

      {showCustomDates && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-sans font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCustomDateChange}
              disabled={!customStartDate || !customEndDate}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-sans font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Uygula
            </button>
          </div>
        </div>
      )}

      {selectedRange === "custom" && !showCustomDates && customStartDate && customEndDate && (
        <div className="mt-2 text-sm font-sans text-gray-600">
          {getDisplayText()}
        </div>
      )}
    </div>
  );
}

