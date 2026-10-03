"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "@/components/DashboardLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Suggestion = {
  id: number;
  student_id: string;
  course_name: string;
  reason: string;
  category: string;
  year: number;
  major: string;
  created_at: string;
};

export default function SubmissionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/suggestions`
      );

      if (!response.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลข้อเสนอได้");
      }

      const data = await response.json();

      setSuggestions(data);
    } catch (err) {
      console.error(err);

      setError(
        "ไม่สามารถเชื่อมต่อ Backend ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่"
      );
    } finally {
      setLoading(false);
    }
  }

  const years = useMemo(() => {
    return Array.from(
      new Set(suggestions.map((item) => item.year))
    ).sort((a, b) => a - b);
  }, [suggestions]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        suggestions.map((item) => item.category)
      )
    ).sort();
  }, [suggestions]);

  const filteredSuggestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return suggestions.filter((item) => {
      const matchesSearch =
        keyword === "" ||
        item.student_id
          .toLowerCase()
          .includes(keyword) ||
        item.course_name
          .toLowerCase()
          .includes(keyword) ||
        item.reason
          .toLowerCase()
          .includes(keyword) ||
        item.category
          .toLowerCase()
          .includes(keyword);

      const matchesYear =
        yearFilter === "all" ||
        String(item.year) === yearFilter;

      const matchesCategory =
        categoryFilter === "all" ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesYear &&
        matchesCategory
      );
    });
  }, [
    suggestions,
    search,
    yearFilter,
    categoryFilter,
  ]);

  function formatDate(date: string) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "th-TH",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  }

  function clearFilters() {
    setSearch("");
    setYearFilter("all");
    setCategoryFilter("all");
  }

  return (
    <DashboardLayout
      role="teacher"
      active="submissions"
    >
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17365d]">
            รายการข้อเสนอ
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            รายการข้อเสนอรายวิชาเสรีทั้งหมดจากนักศึกษา
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Summary */}
        {!loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

            <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    ข้อเสนอทั้งหมด
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#17365d]">
                    {suggestions.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    รายการ
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  📋
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    ผลการค้นหา
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#17365d]">
                    {filteredSuggestions.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    รายการที่ตรงเงื่อนไข
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                  🔎
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    หมวดหมู่
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#17365d]">
                    {categories.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    หมวดหมู่ที่มีข้อเสนอ
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
                  🗂️
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#17365d]">
              ค้นหาและกรองรายการ
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              ค้นหาจากรหัสนักศึกษา รายวิชา เหตุผล หรือหมวดหมู่
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            {/* Search */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-600">
                ค้นหา
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="ค้นหารายการ..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1264d8] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                ชั้นปี
              </label>

              <select
                value={yearFilter}
                onChange={(e) =>
                  setYearFilter(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#1264d8] focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  ทุกชั้นปี
                </option>

                {years.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    ปี {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                หมวดหมู่
              </label>

              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#1264d8] focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  ทุกหมวดหมู่
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear */}
          {(search ||
            yearFilter !== "all" ||
            categoryFilter !== "all") && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                ล้างตัวกรอง
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[#dbe7f2] bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5">
            <h2 className="text-lg font-bold text-[#17365d]">
              รายการข้อเสนอรายวิชา
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              แสดงข้อมูลข้อเสนอที่นักศึกษาส่งเข้าระบบ
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-slate-500">
                กำลังโหลดข้อมูล...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      รหัสนักศึกษา
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      รายวิชา
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      เหตุผล / ความสนใจ
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      หมวดหมู่
                    </th>

                    <th className="px-5 py-3 text-center text-sm font-semibold text-slate-600">
                      ชั้นปี
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                      วันที่เสนอ
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >

                        <td className="px-5 py-4 text-sm font-medium text-[#17365d]">
                          {item.student_id}
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-[#17365d]">
                          {item.course_name}
                        </td>

                        <td className="max-w-[400px] px-5 py-4 text-sm leading-6 text-slate-600">
                          {item.reason}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {item.category}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center text-sm text-slate-600">
                          ปี {item.year}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {formatDate(
                            item.created_at
                          )}
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-16 text-center"
                      >
                        <div className="text-4xl">
                          📭
                        </div>

                        <p className="mt-3 text-sm font-medium text-slate-600">
                          ไม่พบรายการข้อเสนอ
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}