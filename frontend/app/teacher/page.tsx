"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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
};

type YearSummary = {
  year: number;
  count: number;
};

type CategoryYearSummary = {
  category: string;
  year: number;
  count: number;
};

export default function TeacherPage() {
  const router = useRouter();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [years, setYears] = useState<YearSummary[]>([]);
  const [categoryYears, setCategoryYears] = useState<
    CategoryYearSummary[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [
        suggestionsRes,
        categoriesRes,
        yearsRes,
        categoryYearsRes,
      ] = await Promise.all([
        fetch(`${API_URL}/api/suggestions`),
        fetch(`${API_URL}/api/dashboard/categories`),
        fetch(`${API_URL}/api/dashboard/years`),
        fetch(`${API_URL}/api/dashboard/category-years`),
      ]);

      if (
        !suggestionsRes.ok ||
        !categoriesRes.ok ||
        !yearsRes.ok ||
        !categoryYearsRes.ok
      ) {
        throw new Error("ไม่สามารถโหลดข้อมูลจาก Backend ได้");
      }

      const [
        suggestionsData,
        categoriesData,
        yearsData,
        categoryYearsData,
      ] = await Promise.all([
        suggestionsRes.json(),
        categoriesRes.json(),
        yearsRes.json(),
        categoryYearsRes.json(),
      ]);

      setSuggestions(suggestionsData);
      setCategories(categoriesData);
      setYears(yearsData);
      setCategoryYears(categoryYearsData);
    } catch (err) {
      console.error(err);

      setError(
        "ไม่สามารถเชื่อมต่อ Backend ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่"
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("role");
    localStorage.removeItem("student_id");
    localStorage.removeItem("year");
    localStorage.removeItem("major");

    router.push("/");
  }

  const totalSuggestions = suggestions.length;
  const totalCategories = categories.length;

  const uniqueStudents = new Set(
    suggestions.map((item) => item.student_id)
  ).size;

  const mostPopularYear =
    years.length > 0
      ? [...years].sort((a, b) => b.count - a.count)[0]
      : null;

  /*
   * เตรียมข้อมูลสำหรับกราฟหมวดหมู่
   */
  const categoryChartData = categories.map((item) => ({
    category: item.category,
    count: item.count,
  }));

  /*
   * เตรียมข้อมูลสำหรับกราฟชั้นปี
   */
  const yearChartData = years.map((item) => ({
    year: `ปี ${item.year}`,
    count: item.count,
  }));

  /*
   * เตรียมข้อมูลตาราง Category x Year
   */
  const uniqueCategories = Array.from(
    new Set(categoryYears.map((item) => item.category))
  );

  const uniqueYears = Array.from(
    new Set(categoryYears.map((item) => item.year))
  ).sort((a, b) => a - b);

  function getCategoryYearCount(
    category: string,
    year: number
  ) {
    const item = categoryYears.find(
      (data) =>
        data.category === category && data.year === year
    );

    return item?.count ?? 0;
  }

  function getCategoryTotal(category: string) {
    return categoryYears
      .filter((item) => item.category === category)
      .reduce((sum, item) => sum + item.count, 0);
  }

  return (
    <DashboardLayout role="teacher" active="home">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#17365d]">
              วิเคราะห์ความต้องการรายวิชาเสรี
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              ภาพรวมข้อเสนอรายวิชาเสรีของนักศึกษา
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-fit rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            ออกจากระบบ
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[#dbe7f2] bg-white">
            <div className="text-sm text-slate-500">
              กำลังโหลดข้อมูล...
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* Card 1 */}
              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      ข้อเสนอทั้งหมด
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#17365d]">
                      {totalSuggestions}
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

              {/* Card 2 */}
              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      หมวดหมู่ทั้งหมด
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#17365d]">
                      {totalCategories}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      หมวดหมู่
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                    🗂️
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      นักศึกษาที่เสนอ
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#17365d]">
                      {uniqueStudents}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      คน
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-2xl">
                    👥
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      ชั้นปีที่เสนอมากที่สุด
                    </p>

                    <p className="mt-2 text-3xl font-bold text-[#17365d]">
                      {mostPopularYear
                        ? `ปี ${mostPopularYear.year}`
                        : "-"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {mostPopularYear
                        ? `${mostPopularYear.count} ข้อเสนอ`
                        : "ยังไม่มีข้อมูล"}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                    🎓
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

              {/* Category Chart */}
              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#17365d]">
                    จำนวนข้อเสนอแยกตามหมวดหมู่
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    แสดงจำนวนความต้องการรายวิชาในแต่ละหมวดหมู่
                  </p>
                </div>

                <div
                  className="w-full"
                  style={{ height: 360 }}
                >
                  {categoryChartData.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={categoryChartData}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 0,
                          bottom: 70,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="category"
                          tick={{
                            fontSize: 12,
                          }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: 12,
                          }}
                        />

                        <Tooltip
                          formatter={(value) => [
                            `${value} ข้อเสนอ`,
                            "จำนวน",
                          ]}
                          labelFormatter={(label) =>
                            `หมวดหมู่: ${label}`
                          }
                        />

                        <Bar
                          dataKey="count"
                          name="จำนวนข้อเสนอ"
                          fill="#1264d8"
                          radius={[6, 6, 0, 0]}
                          barSize={45}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      ยังไม่มีข้อมูลสำหรับแสดงกราฟ
                    </div>
                  )}
                </div>
              </div>

              {/* Year Chart */}
              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#17365d]">
                    จำนวนข้อเสนอแยกตามชั้นปี
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    แสดงจำนวนข้อเสนอของนักศึกษาแต่ละชั้นปี
                  </p>
                </div>

                <div
                  className="w-full"
                  style={{ height: 360 }}
                >
                  {yearChartData.length > 0 ? (
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={yearChartData}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 0,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                        />

                        <XAxis
                          dataKey="year"
                          tick={{
                            fontSize: 13,
                          }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: 12,
                          }}
                        />

                        <Tooltip
                          formatter={(value) => [
                            `${value} ข้อเสนอ`,
                            "จำนวน",
                          ]}
                          labelFormatter={(label) =>
                            `${label}`
                          }
                        />

                        <Bar
                          dataKey="count"
                          name="จำนวนข้อเสนอ"
                          fill="#0d3b70"
                          radius={[6, 6, 0, 0]}
                          barSize={55}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      ยังไม่มีข้อมูลสำหรับแสดงกราฟ
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category x Year */}
            <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-[#17365d]">
                  วิเคราะห์ความต้องการตามหมวดหมู่และชั้นปี
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  เปรียบเทียบจำนวนข้อเสนอของแต่ละหมวดหมู่ในแต่ละชั้นปี
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        หมวดหมู่
                      </th>

                      {uniqueYears.map((year) => (
                        <th
                          key={year}
                          className="px-4 py-3 text-center text-sm font-semibold text-slate-600"
                        >
                          ปี {year}
                        </th>
                      ))}

                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">
                        รวม
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {uniqueCategories.length > 0 ? (
                      uniqueCategories.map((category) => (
                        <tr
                          key={category}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-4 text-sm font-medium text-[#17365d]">
                            {category}
                          </td>

                          {uniqueYears.map((year) => (
                            <td
                              key={`${category}-${year}`}
                              className="px-4 py-4 text-center text-sm text-slate-600"
                            >
                              {getCategoryYearCount(
                                category,
                                year
                              )}
                            </td>
                          ))}

                          <td className="px-4 py-4 text-center text-sm font-bold text-[#1264d8]">
                            {getCategoryTotal(category)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={uniqueYears.length + 2}
                          className="px-4 py-10 text-center text-sm text-slate-400"
                        >
                          ยังไม่มีข้อมูล
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Suggestions Table */}
            <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-[#17365d]">
                  รายการข้อเสนอรายวิชา
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  รายละเอียดข้อเสนอที่นักศึกษาส่งเข้าระบบ
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        รหัสนักศึกษา
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        รายวิชา
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        เหตุผล / ความสนใจ
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        หมวดหมู่
                      </th>

                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600">
                        ชั้นปี
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
                        วันที่
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {suggestions.length > 0 ? (
                      suggestions.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-4 text-sm text-slate-600">
                            {item.student_id}
                          </td>

                          <td className="px-4 py-4 text-sm font-medium text-[#17365d]">
                            {item.course_name}
                          </td>

                          <td className="max-w-[350px] px-4 py-4 text-sm leading-6 text-slate-600">
                            {item.reason}
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                              {item.category}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-center text-sm text-slate-600">
                            ปี {item.year}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-500">
                            {item.created_at
                              ? new Date(
                                  item.created_at
                                ).toLocaleDateString("th-TH")
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-10 text-center text-sm text-slate-400"
                        >
                          ยังไม่มีข้อเสนอรายวิชา
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}