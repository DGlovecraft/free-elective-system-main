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

type CategorySummary = {
  category: string;
  count: number;
  students: number;
  years: number[];
};

export default function CategoriesPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<string | null>(null);

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
        throw new Error(
          "ไม่สามารถโหลดข้อมูลข้อเสนอได้"
        );
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

  const categorySummaries = useMemo<CategorySummary[]>(() => {
    const map = new Map<
      string,
      {
        count: number;
        students: Set<string>;
        years: Set<number>;
      }
    >();

    suggestions.forEach((item) => {
      if (!map.has(item.category)) {
        map.set(item.category, {
          count: 0,
          students: new Set<string>(),
          years: new Set<number>(),
        });
      }

      const data = map.get(item.category)!;

      data.count += 1;
      data.students.add(item.student_id);
      data.years.add(item.year);
    });

    return Array.from(map.entries())
      .map(([category, data]) => ({
        category,
        count: data.count,
        students: data.students.size,
        years: Array.from(data.years).sort(
          (a, b) => a - b
        ),
      }))
      .sort((a, b) => b.count - a.count);
  }, [suggestions]);

  const selectedSuggestions = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    return suggestions.filter(
      (item) => item.category === selectedCategory
    );
  }, [suggestions, selectedCategory]);

  const selectedSummary = useMemo(() => {
    if (!selectedCategory) {
      return null;
    }

    const items = selectedSuggestions;

    const students = new Set(
      items.map((item) => item.student_id)
    );

    const years = new Set(
      items.map((item) => item.year)
    );

    const courses = new Set(
      items.map((item) => item.course_name)
    );

    return {
      count: items.length,
      students: students.size,
      years: Array.from(years).sort(
        (a, b) => a - b
      ),
      courses: courses.size,
    };
  }, [selectedCategory, selectedSuggestions]);

  const popularCategory =
    categorySummaries.length > 0
      ? categorySummaries[0]
      : null;

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

  return (
    <DashboardLayout
      role="teacher"
      active="categories"
    >
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17365d]">
            รายละเอียดหมวดหมู่
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            รายละเอียดข้อเสนอรายวิชาเสรีแยกตามหมวดหมู่
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-[#dbe7f2] bg-white p-12 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  จำนวนหมวดหมู่
                </p>

                <p className="mt-2 text-3xl font-bold text-[#17365d]">
                  {categorySummaries.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  หมวดหมู่ที่มีข้อเสนอ
                </p>
              </div>

              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
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

              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  หมวดหมู่ที่มีข้อเสนอมากที่สุด
                </p>

                <p className="mt-2 text-xl font-bold text-[#17365d]">
                  {popularCategory
                    ? popularCategory.category
                    : "-"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {popularCategory
                    ? `${popularCategory.count} รายการ`
                    : "ไม่มีข้อมูล"}
                </p>
              </div>

            </div>

            {/* Category List */}
            <div className="rounded-2xl border border-[#dbe7f2] bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-5">
                <h2 className="text-lg font-bold text-[#17365d]">
                  หมวดหมู่ทั้งหมด
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  เลือกหมวดหมู่เพื่อดูรายละเอียดข้อเสนอ
                </p>
              </div>

              {categorySummaries.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    ยังไม่มีข้อมูลหมวดหมู่
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    เมื่อมีนักศึกษาส่งข้อเสนอ ข้อมูลจะแสดงที่นี่
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {categorySummaries.map(
                    (item) => {
                      const isSelected =
                        selectedCategory ===
                        item.category;

                      return (
                        <button
                          key={item.category}
                          onClick={() =>
                            setSelectedCategory(
                              isSelected
                                ? null
                                : item.category
                            )
                          }
                          className={[
                            "flex w-full items-center justify-between px-5 py-4 text-left transition",
                            isSelected
                              ? "bg-blue-50"
                              : "hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-[#17365d]">
                              {item.category}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                              <span>
                                นักศึกษา{" "}
                                {item.students} คน
                              </span>

                              <span>
                                ชั้นปี{" "}
                                {item.years
                                  .map(
                                    (year) =>
                                      `ปี ${year}`
                                  )
                                  .join(", ")}
                              </span>
                            </div>

                          </div>

                          <div className="ml-4 flex shrink-0 items-center gap-3">

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              {item.count} รายการ
                            </span>

                            <span className="text-slate-400">
                              {isSelected
                                ? "−"
                                : "+"}
                            </span>

                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Selected Category Detail */}
            {selectedCategory &&
              selectedSummary && (
                <div className="rounded-2xl border border-[#dbe7f2] bg-white shadow-sm">

                  <div className="border-b border-slate-100 px-5 py-5">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-xs font-medium text-blue-600">
                          รายละเอียดหมวดหมู่
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-[#17365d]">
                          {selectedCategory}
                        </h2>
                      </div>

                      <button
                        onClick={() =>
                          setSelectedCategory(null)
                        }
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                      >
                        ปิดรายละเอียด
                      </button>

                    </div>

                  </div>

                  {/* Selected Summary */}
                  <div className="grid grid-cols-1 gap-4 border-b border-slate-100 p-5 sm:grid-cols-2 xl:grid-cols-4">

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        จำนวนข้อเสนอ
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[#17365d]">
                        {selectedSummary.count}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        จำนวนนักศึกษา
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[#17365d]">
                        {selectedSummary.students}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        จำนวนรายวิชาที่เสนอ
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[#17365d]">
                        {selectedSummary.courses}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        ชั้นปีที่มีข้อเสนอ
                      </p>

                      <p className="mt-1 text-sm font-semibold text-[#17365d]">
                        {selectedSummary.years.length > 0
                          ? selectedSummary.years
                              .map(
                                (year) =>
                                  `ปี ${year}`
                              )
                              .join(", ")
                          : "-"}
                      </p>
                    </div>

                  </div>

                  {/* Detail Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] border-collapse">

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

                          <th className="px-5 py-3 text-center text-sm font-semibold text-slate-600">
                            ชั้นปี
                          </th>

                          <th className="px-5 py-3 text-left text-sm font-semibold text-slate-600">
                            วันที่เสนอ
                          </th>

                        </tr>
                      </thead>

                      <tbody>
                        {selectedSuggestions.map(
                          (item) => (
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

                              <td className="max-w-[450px] px-5 py-4 text-sm leading-6 text-slate-600">
                                {item.reason}
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
                          )
                        )}
                      </tbody>

                    </table>
                  </div>

                </div>
              )}
          </>
        )}

      </div>
    </DashboardLayout>
  );
}