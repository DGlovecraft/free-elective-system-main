"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

const DEMO_STUDENT_IDS = [
  "65000001",
  "65000002",
  "65000003",
  "65000004",
];

const MAJOR =
  "วิทยาการคอมพิวเตอร์และสารสนเทศ";

export default function StudentSuggestionPage() {
  const router = useRouter();

  // =====================================================
  // STATE
  // =====================================================

  const [studentId, setStudentId] =
    useState("");

  const [year, setYear] =
    useState("");

  const [courseName, setCourseName] =
    useState("");

  const [reason, setReason] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD SAVED STUDENT DATA
  // =====================================================

  useEffect(() => {
    const role =
      localStorage.getItem("role");

    // ต้องเป็นนักศึกษาเท่านั้น
    if (role !== "student") {
      router.replace("/");
      return;
    }

    // ===================================================
    // รหัสนักศึกษาได้มาจาก Google Login เท่านั้น
    // ไม่ให้หน้านี้สร้างหรือแก้ไข student_id เอง
    // ===================================================

    const savedStudentId =
      localStorage.getItem("student_id") || "";

    const savedYear =
      localStorage.getItem("year") || "";

    if (!savedStudentId) {
      setError(
        "ไม่พบรหัสนักศึกษา กรุณาเข้าสู่ระบบด้วย Google ใหม่อีกครั้ง"
      );
      return;
    }

    setStudentId(savedStudentId);

    if (savedYear) {
      setYear(savedYear);
    }
  }, [router]);

  // =====================================================
  // STUDENT ID VALIDATION
  // =====================================================

  const isStudentIdValid =
    useMemo(() => {
      if (!studentId) {
        return false;
      }

      if (
        DEMO_STUDENT_IDS.includes(
          studentId
        )
      ) {
        return true;
      }

      return /^(66|67|68|69)\d{8}$/.test(
        studentId
      );
    }, [studentId]);

  // =====================================================
  // STUDENT ID ERROR
  // =====================================================

  const studentIdError =
    useMemo(() => {
      if (!studentId) {
        return "ไม่พบรหัสนักศึกษาที่ผูกกับบัญชี Google";
      }

      if (
        DEMO_STUDENT_IDS.includes(
          studentId
        )
      ) {
        return "";
      }

      if (
        !/^\d+$/.test(
          studentId
        )
      ) {
        return "รหัสนักศึกษาไม่ถูกต้อง";
      }

      if (
        studentId.length !== 10
      ) {
        return "รหัสนักศึกษาไม่ถูกต้อง";
      }

      if (
        !/^(66|67|68|69)/.test(
          studentId
        )
      ) {
        return "รหัสนักศึกษาไม่ถูกต้อง";
      }

      return "";
    }, [studentId]);

  // =====================================================
  // FORM VALID
  // =====================================================

  const isFormValid =
    isStudentIdValid &&
    year !== "" &&
    courseName.trim() !== "" &&
    reason.trim() !== "";

  // =====================================================
  // RESET
  // =====================================================

  function resetForm() {
    setCourseName("");
    setReason("");
    setCategory("");
    setError("");
    setSuccess("");
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setCategory("");

    // ---------------------------------------------------
    // ดึง student_id จาก localStorage อีกครั้ง
    // เพื่อให้แน่ใจว่าใช้รหัสที่ผูกกับ Google Account
    // ---------------------------------------------------

    const lockedStudentId =
      localStorage.getItem(
        "student_id"
      ) || "";

    // ---------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------

    if (!lockedStudentId) {
      setError(
        "ไม่พบรหัสนักศึกษา กรุณาเข้าสู่ระบบด้วย Google ใหม่อีกครั้ง"
      );
      return;
    }

    if (!isStudentIdValid) {
      setError(
        "รหัสนักศึกษาที่ผูกกับบัญชีไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่"
      );
      return;
    }

    if (!year) {
      setError(
        "กรุณาเลือกชั้นปี"
      );
      return;
    }

    if (!courseName.trim()) {
      setError(
        "กรุณากรอกชื่อรายวิชาที่ต้องการเสนอ"
      );
      return;
    }

    if (!reason.trim()) {
      setError(
        "กรุณากรอกเหตุผลหรือความสนใจของคุณ"
      );
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // STEP 1
      // NLP + TF-IDF + KNN
      //
      // ใช้ชื่อรายวิชา + เหตุผล
      // =================================================

      const predictionText =
        `${courseName.trim()} ${reason.trim()}`;

      console.log(
        "ข้อความส่งเข้า ML:",
        predictionText
      );

      const predictionResponse =
        await fetch(
          `${API_URL}/api/predict`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              text:
                predictionText,
            }),
          }
        );

      const predictionData =
        await predictionResponse
          .json()
          .catch(
            () => null
          );

      if (
        !predictionResponse.ok
      ) {
        throw new Error(
          predictionData?.detail ||
            "ไม่สามารถวิเคราะห์หมวดหมู่ได้"
        );
      }

      const predictedCategory =
        predictionData?.category;

      if (!predictedCategory) {
        throw new Error(
          "ระบบไม่สามารถระบุหมวดหมู่ได้"
        );
      }

      // แสดง Category
      setCategory(
        predictedCategory
      );

      // =================================================
      // STEP 2
      // SAVE DATABASE
      // =================================================

      const suggestionResponse =
        await fetch(
          `${API_URL}/api/suggestions`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              // สำคัญ:
              // ใช้ lockedStudentId
              // ไม่ใช้ค่าจาก input
              student_id:
                lockedStudentId.trim(),

              course_name:
                courseName.trim(),

              reason:
                reason.trim(),

              category:
                predictedCategory,

              year:
                Number(year),

              major:
                MAJOR,
            }),
          }
        );

      const suggestionData =
        await suggestionResponse
          .json()
          .catch(
            () => null
          );

      if (
        !suggestionResponse.ok
      ) {
        throw new Error(
          suggestionData?.detail ||
            "ไม่สามารถบันทึกข้อเสนอได้"
        );
      }

      // =================================================
      // SAVE STUDENT INFO
      // =================================================

      // ยืนยัน student_id เดิม
      // ไม่เปลี่ยนรหัสนักศึกษา
      localStorage.setItem(
        "student_id",
        lockedStudentId.trim()
      );

      localStorage.setItem(
        "year",
        year
      );

      localStorage.setItem(
        "major",
        MAJOR
      );

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "ส่งข้อเสนอรายวิชาเสรีเรียบร้อยแล้ว"
      );

      // ล้างเฉพาะข้อมูลรายวิชา
      setCourseName("");
      setReason("");

      // =================================================
      // RETURN TO STUDENT HOME
      // =================================================

      setTimeout(() => {
        router.push(
          "/student"
        );
      }, 800);

    } catch (err) {
      console.error(
        "เกิดข้อผิดพลาด:",
        err
      );

      if (
        err instanceof Error
      ) {
        setError(
          err.message
        );
      } else {
        setError(
          "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <DashboardLayout
      role="student"
      active="suggestion"
    >
      <div className="mx-auto w-full max-w-4xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#17365d]">
            เสนอรายวิชาเสรี
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            เสนอรายวิชาที่คุณสนใจและต้องการให้มหาวิทยาลัยพิจารณาเปิดสอน
          </p>
        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <div className="rounded-2xl border border-[#dbe7f2] bg-white shadow-sm">

          {/* CARD HEADER */}

          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-lg font-bold text-[#17365d]">
              ข้อมูลข้อเสนอ
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              กรุณากรอกข้อมูลให้ครบถ้วน
            </p>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6"
          >

            {/* =================================================
                STUDENT
            ================================================= */}

            <div>
              <h3 className="mb-4 text-base font-semibold text-[#17365d]">
                ข้อมูลนักศึกษา
              </h3>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* STUDENT ID */}

                <div>
                  <label
                    htmlFor="studentId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    รหัสนักศึกษา
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  {/* =================================================
                      LOCKED STUDENT ID

                      รหัสนี้มาจาก Google Login
                      ผู้ใช้ไม่สามารถแก้ไขได้
                  ================================================= */}

                  <input
                    id="studentId"
                    type="text"
                    inputMode="numeric"
                    value={studentId}
                    readOnly
                    aria-readonly="true"
                    className={[
                      "w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm text-slate-600 outline-none",
                      "cursor-not-allowed",
                      "border-slate-200",
                    ].join(" ")}
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    รหัสนักศึกษาถูกผูกกับบัญชี Google และไม่สามารถแก้ไขได้
                  </p>

                  {studentIdError && (
                    <p className="mt-2 text-xs text-red-500">
                      {studentIdError}
                    </p>
                  )}

                  {studentId &&
                    isStudentIdValid && (
                      <p className="mt-2 text-xs text-green-600">
                        รหัสนักศึกษาถูกต้องและผูกกับบัญชีแล้ว
                      </p>
                    )}
                </div>

                {/* YEAR */}

                <div>
                  <label
                    htmlFor="year"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    ชั้นปี
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    id="year"
                    value={year}
                    onChange={(event) => {
                      setYear(
                        event.target.value
                      );

                      setError("");
                      setSuccess("");
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#1264d8] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      เลือกชั้นปี
                    </option>

                    <option value="1">
                      ปี 1
                    </option>

                    <option value="2">
                      ปี 2
                    </option>

                    <option value="3">
                      ปี 3
                    </option>

                    <option value="4">
                      ปี 4
                    </option>
                  </select>
                </div>

              </div>
            </div>

            {/* =================================================
                MAJOR
            ================================================= */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                สาขา / หลักสูตร
              </label>

              <input
                type="text"
                value={MAJOR}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500"
              />
            </div>

            {/* =================================================
                COURSE
            ================================================= */}

            <div className="border-t border-slate-100 pt-6">
              <h3 className="mb-4 text-base font-semibold text-[#17365d]">
                รายละเอียดรายวิชาที่เสนอ
              </h3>

              {/* COURSE NAME */}

              <div className="mb-5">
                <label
                  htmlFor="courseName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  ชื่อรายวิชาที่ต้องการเสนอ
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="courseName"
                  type="text"
                  value={courseName}
                  onChange={(event) => {
                    setCourseName(
                      event.target.value
                    );

                    setError("");
                    setSuccess("");
                  }}
                  placeholder="เช่น การพัฒนา Backend ด้วย FastAPI"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1264d8] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* REASON */}

              <div>
                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  เหตุผล / ความสนใจ
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  id="reason"
                  value={reason}
                  onChange={(event) => {
                    setReason(
                      event.target.value
                    );

                    setError("");
                    setSuccess("");
                    setCategory("");
                  }}
                  rows={6}
                  placeholder="อธิบายว่าทำไมคุณจึงสนใจรายวิชานี้ และต้องการเรียนรู้อะไรจากรายวิชา"
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1264d8] focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  ข้อมูลจะถูกวิเคราะห์ด้วย NLP + TF-IDF + KNN
                </p>
              </div>
            </div>

            {/* =================================================
                CATEGORY
            ================================================= */}

            {category && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
                <p className="text-xs font-medium text-blue-600">
                  หมวดหมู่ที่ระบบวิเคราะห์
                </p>

                <p className="mt-1 text-base font-bold text-[#17365d]">
                  {category}
                </p>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm leading-6 text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm leading-6 text-green-700">
                  {success}
                </p>

                {category && (
                  <p className="mt-1 text-sm text-green-700">
                    ระบบจัดหมวดหมู่เป็น:{" "}
                    <span className="font-semibold">
                      {category}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* =================================================
                BUTTON
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ล้างข้อมูล
              </button>

              <button
                type="submit"
                disabled={
                  !isFormValid ||
                  loading
                }
                className="rounded-lg bg-[#1264d8] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d56bd] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading
                  ? "กำลังส่งข้อมูล..."
                  : "ส่งข้อเสนอ"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}