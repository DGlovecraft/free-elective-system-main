"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";

type Suggestion = {
  id: number;
  student_id: string;
  course_name: string;
  reason: string;
  category: string;
  year: number;
  major: string;
  created_at: string | null;
};

export default function StudentPage() {
  const router = useRouter();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [allSuggestions, setAllSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [year, setYear] = useState("");
  const [major, setMajor] = useState("");
  const [studentId, setStudentId] = useState("");

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);

      // =====================================================
      // ข้อมูลนักศึกษาที่ได้จาก Google Login
      // ห้ามให้หน้า Dashboard สร้างหรือเปลี่ยน student_id เอง
      // =====================================================

      const currentStudentId =
        localStorage.getItem("student_id") || "";

      const currentYear =
        localStorage.getItem("year") || "";

      const currentMajor =
        localStorage.getItem("major") ||
        "วิทยาการคอมพิวเตอร์และสารสนเทศ";

      setStudentId(currentStudentId);
      setYear(currentYear);
      setMajor(currentMajor);

      // ถ้า Login มาแต่ไม่มี student_id
      // แสดงว่า Google Account ยังไม่ได้ผูกกับนักศึกษา
      if (!currentStudentId) {
        setSuggestions([]);
        setAllSuggestions([]);
        setLoading(false);

        console.warn(
          "ไม่พบ student_id ใน localStorage"
        );

        return;
      }

      // =====================================================
      // โหลดข้อเสนอทั้งหมดจาก Backend
      // =====================================================

      const response = await fetch(
        "/api/suggestions",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "ไม่สามารถโหลดข้อมูลข้อเสนอได้"
        );
      }

      const data: Suggestion[] =
        await response.json();

      setAllSuggestions(data);

      // =====================================================
      // แสดงเฉพาะข้อมูลของ student_id ที่ Login อยู่
      // =====================================================

      const mySuggestions = data
        .filter(
          (item) =>
            String(item.student_id).trim() ===
            String(currentStudentId).trim()
        )
        .sort((a, b) => {
          const dateA = a.created_at
            ? new Date(a.created_at).getTime()
            : 0;

          const dateB = b.created_at
            ? new Date(b.created_at).getTime()
            : 0;

          return dateB - dateA;
        });

      setSuggestions(mySuggestions);
    } catch (error) {
      console.error(
        "เกิดข้อผิดพลาดในการโหลดข้อมูล:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // ตรวจสอบสิทธิ์ Login
  // =====================================================

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "student") {
      router.replace("/");
      return;
    }

    fetchSuggestions();
  }, [router, fetchSuggestions]);

  // =====================================================
  // โหลดข้อมูลใหม่เมื่อกลับมาที่หน้า Dashboard
  // =====================================================

  useEffect(() => {
    const handleFocus = () => {
      fetchSuggestions();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [fetchSuggestions]);

  // =====================================================
  // Logout
  // =====================================================

  const logout = () => {
    localStorage.clear();
    router.replace("/");
  };

  // =====================================================
  // Format Date
  // =====================================================

  const formatDate = (
    dateString: string | null
  ) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // =====================================================
  // จำนวนหมวดหมู่ที่นักศึกษาคนนี้เคยเสนอ
  // =====================================================

  const categoryCount = new Set(
    suggestions
      .map((item) => item.category)
      .filter(Boolean)
  ).size;

  // =====================================================
  // จำนวนข้อเสนอของชั้นปีเดียวกัน
  // =====================================================

  const yearSuggestionsCount =
    year !== ""
      ? allSuggestions.filter(
          (item) =>
            String(item.year) ===
            String(year)
        ).length
      : 0;

  // =====================================================
  // รายชื่อหมวดหมู่ที่เคยเสนอ
  // =====================================================

  const categories = Array.from(
    new Set(
      suggestions
        .map((item) => item.category)
        .filter(Boolean)
    )
  );

  // =====================================================
  // Loading
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#eef5fb] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />

            <span className="text-sm text-slate-600">
              กำลังโหลดข้อมูล...
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout
      role="student"
      active="home"
    >
      {/* =====================================================
          Page Header
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-blue-600 font-medium mb-1">
            หน้าหลัก
          </p>

          <h2 className="text-2xl md:text-3xl font-bold text-[#17365d]">
            ยินดีต้อนรับสู่ระบบ
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            เสนอรายวิชาที่คุณสนใจ
            เพื่อช่วยวิเคราะห์ความต้องการของนักศึกษา
          </p>

          {/* =================================================
              รหัสนักศึกษาถูกล็อกตาม Google Account
          ================================================= */}

          {studentId && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200">
              <span className="text-xs text-slate-500">
                รหัสนักศึกษา
              </span>

              <span className="text-sm font-semibold text-[#17365d]">
                {studentId}
              </span>

              <span className="text-xs text-green-600">
                ผูกบัญชีแล้ว
              </span>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          ออกจากระบบ
        </button>
      </div>

      {/* =====================================================
          Hero
      ===================================================== */}

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#dff0ff] via-[#eaf5ff] to-white border border-blue-100 mb-6">
        <div className="relative z-10 p-6 md:p-8 lg:p-10 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-4">
            Free Elective
          </span>

          <h3 className="text-2xl md:text-3xl font-bold text-[#12345b] leading-snug">
            เสนอรายวิชาเสรี
            <br />
            ที่คุณอยากเรียน
          </h3>

          <p className="text-sm text-slate-600 mt-3 leading-7 max-w-xl">
            เสนอรายวิชาหรือหัวข้อที่คุณสนใจ
            พร้อมบอกเหตุผล เพื่อให้ระบบวิเคราะห์
            และจัดหมวดหมู่ความสนใจของนักศึกษา
          </p>

          <button
            onClick={() =>
              router.push(
                "/student/suggestion"
              )
            }
            className="mt-6 inline-flex items-center gap-2 bg-[#1264d8] text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 hover:bg-[#0d57bd] transition"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 5V19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            เสนอรายวิชา
          </button>
        </div>

        <div className="absolute right-[-30px] top-[-50px] w-72 h-72 rounded-full bg-blue-100/60" />

        <div className="absolute right-16 bottom-[-70px] w-56 h-56 rounded-full bg-sky-100/70" />

        <div className="absolute right-20 top-10 hidden lg:block">
          <div className="w-36 h-36 rounded-3xl bg-white/70 border border-white shadow-sm flex items-center justify-center">
            <svg
              width="75"
              height="75"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M12 3V21"
                stroke="#1264d8"
                strokeWidth="1.3"
                strokeLinecap="round"
              />

              <path
                d="M4 12H20"
                stroke="#1264d8"
                strokeWidth="1.3"
                strokeLinecap="round"
              />

              <path
                d="M6.5 6.5L17.5 17.5"
                stroke="#1264d8"
                strokeWidth="1.3"
                strokeLinecap="round"
              />

              <path
                d="M17.5 6.5L6.5 17.5"
                stroke="#1264d8"
                strokeWidth="1.3"
                strokeLinecap="round"
              />

              <circle
                cx="12"
                cy="12"
                r="4"
                fill="#1264d8"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* =====================================================
          Stats
      ===================================================== */}

      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#17365d]">
              ภาพรวมของคุณ
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              ข้อมูลการเสนอรายวิชาของคุณ
            </p>
          </div>

          <button
            onClick={fetchSuggestions}
            className="text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            รีเฟรชข้อมูล
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* จำนวนข้อเสนอของฉัน */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  จำนวนข้อเสนอของฉัน
                </p>

                <p className="text-3xl font-bold text-[#17365d] mt-2">
                  {suggestions.length}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  รายการ
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M5 4H19V20H5V4Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M8 8H16"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M8 12H16"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M8 16H13"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* หมวดหมู่ */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  หมวดหมู่ที่เคยเสนอ
                </p>

                <p className="text-3xl font-bold text-[#17365d] mt-2">
                  {categoryCount}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  หมวดหมู่
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="7"
                    cy="7"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <circle
                    cx="17"
                    cy="7"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <circle
                    cx="12"
                    cy="17"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M9 9L11 14"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M15 9L13 14"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* จำนวนข้อเสนอของชั้นปี */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  จำนวนข้อเสนอของชั้นปี
                </p>

                <p className="text-3xl font-bold text-[#17365d] mt-2">
                  {yearSuggestionsCount}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  นักศึกษาชั้นปี {year || "-"}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M4 19V10"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M10 19V5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M16 19V8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <path
                    d="M22 19H2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          Categories
      ===================================================== */}

      {categories.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 mb-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#17365d]">
              หมวดหมู่ที่คุณเคยเสนอ
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              หมวดหมู่จากข้อเสนอของคุณ
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          History
      ===================================================== */}

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 md:px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#17365d]">
              รายการที่เคยเสนอ
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              ประวัติการเสนอรายวิชาของคุณ
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                "/student/suggestion"
              )
            }
            className="text-sm text-blue-600 font-semibold hover:text-blue-700"
          >
            + เสนอรายวิชาเพิ่ม
          </button>
        </div>

        {suggestions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 4H19V20H5V4Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />

                <path
                  d="M8 8H16"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />

                <path
                  d="M8 12H13"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="font-semibold text-slate-700">
              ยังไม่มีประวัติการเสนอรายวิชา
            </p>

            <p className="text-sm text-slate-400 mt-2">
              เริ่มต้นเสนอรายวิชาที่คุณสนใจได้เลย
            </p>

            <button
              onClick={() =>
                router.push(
                  "/student/suggestion"
                )
              }
              className="mt-5 bg-[#1264d8] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0d57bd] transition"
            >
              เสนอรายวิชาแรก
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    รายวิชา / หัวข้อ
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    เหตุผล
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    หมวดหมู่
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    ชั้นปี
                  </th>

                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    วันที่เสนอ
                  </th>
                </tr>
              </thead>

              <tbody>
                {suggestions.map(
                  (suggestion) => (
                    <tr
                      key={suggestion.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-700">
                          {suggestion.course_name}
                        </p>
                      </td>

                      <td className="px-5 py-4 max-w-md">
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {suggestion.reason}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium whitespace-nowrap">
                          {suggestion.category}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-500 whitespace-nowrap">
                          ปี {suggestion.year}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(
                          suggestion.created_at
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}