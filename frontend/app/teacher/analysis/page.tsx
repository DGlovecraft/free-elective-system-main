"use client";

import { useEffect, useState } from "react";
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

type CategorySummary = {
  category: string;
  count: number;
};

type YearSummary = {
  year: number;
  count: number;
};

export default function AnalysisPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [years, setYears] = useState<YearSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalysis();
  }, []);

  async function fetchAnalysis() {
    try {
      setLoading(true);
      setError("");

      const [categoriesRes, yearsRes] = await Promise.all([
        fetch("/api/dashboard/categories"),
        fetch("/api/dashboard/years"),
      ]);

      if (!categoriesRes.ok || !yearsRes.ok) {
        throw new Error("โหลดข้อมูลไม่สำเร็จ");
      }

      const categoriesData = await categoriesRes.json();
      const yearsData = await yearsRes.json();

      setCategories(categoriesData);
      setYears(yearsData);
    } catch (err) {
      console.error(err);

      setError(
        "ไม่สามารถเชื่อมต่อ Backend ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่"
      );
    } finally {
      setLoading(false);
    }
  }

  const totalSuggestions = categories.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const totalCategories = categories.length;

  const mostPopularCategory =
    categories.length > 0 ? categories[0] : null;

  const mostPopularYear =
    years.length > 0
      ? [...years].sort((a, b) => b.count - a.count)[0]
      : null;

  const yearChartData = years.map((item) => ({
    year: `ปี ${item.year}`,
    count: item.count,
  }));

  const categoryChartData = categories.map((item) => ({
    category: item.category,
    count: item.count,
  }));

  return (
    <DashboardLayout
      role="teacher"
      active="analysis"
    >
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#17365d]">
            ผลการวิเคราะห์
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            วิเคราะห์ความต้องการรายวิชาเสรีจากข้อเสนอของนักศึกษา
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[#dbe7f2] bg-white">
            <p className="text-sm text-slate-500">
              กำลังโหลดข้อมูล...
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
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

              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
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

              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  หมวดหมู่ที่มีข้อเสนอสูงสุด
                </p>

                <p className="mt-2 truncate text-xl font-bold text-[#17365d]">
                  {mostPopularCategory
                    ? mostPopularCategory.category
                    : "-"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {mostPopularCategory
                    ? `${mostPopularCategory.count} ข้อเสนอ`
                    : "ยังไม่มีข้อมูล"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
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
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

              {/* Category */}
              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#17365d]">
                    ความต้องการแยกตามหมวดหมู่
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    จำนวนข้อเสนอในแต่ละหมวดหมู่
                  </p>
                </div>

                <div style={{ height: 360 }}>
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
                          tick={{ fontSize: 12 }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
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
                      ยังไม่มีข้อมูล
                    </div>
                  )}
                </div>
              </div>

              {/* Year */}
              <div className="rounded-2xl border border-[#dbe7f2] bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#17365d]">
                    ความต้องการแยกตามชั้นปี
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    จำนวนข้อเสนอของนักศึกษาแต่ละชั้นปี
                  </p>
                </div>

                <div style={{ height: 360 }}>
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
                          tick={{ fontSize: 13 }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fontSize: 12 }}
                        />

                        <Tooltip
                          formatter={(value) => [
                            `${value} ข้อเสนอ`,
                            "จำนวน",
                          ]}
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
                      ยังไม่มีข้อมูล
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Analysis explanation */}
            <div className="rounded-2xl border border-[#dbe7f2] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#17365d]">
                สรุปผลการวิเคราะห์
              </h2>

              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>
                  ระบบรวบรวมข้อเสนอรายวิชาเสรีจากนักศึกษา
                  และจัดกลุ่มข้อเสนอออกเป็นหมวดหมู่
                  เพื่อดูแนวโน้มความต้องการของนักศึกษา
                </p>

                <p>
                  จากข้อมูลปัจจุบัน พบว่าหมวดหมู่ที่มีข้อเสนอสูงสุดคือ{" "}
                  <span className="font-semibold text-[#1264d8]">
                    {mostPopularCategory
                      ? mostPopularCategory.category
                      : "-"}
                  </span>
                </p>

                <p>
                  ชั้นปีที่มีจำนวนข้อเสนอมากที่สุดคือ{" "}
                  <span className="font-semibold text-[#1264d8]">
                    {mostPopularYear
                      ? `ปี ${mostPopularYear.year}`
                      : "-"}
                  </span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}