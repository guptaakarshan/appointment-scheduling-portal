import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { dayNames } from "../utils/date";

const specialtyPills = [
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
];

const DoctorDirectoryPage = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const fetchDoctors = async (specialization = activeFilter) => {
    setLoading(true);
    setError("");

    try {
      const query = specialization ? `?specialization=${encodeURIComponent(specialization)}` : "";
      const { data } = await api.get(`/patient/public/doctors${query}`);
      setDoctors(data.doctors);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const visibleDoctors = useMemo(() => {
    if (!search.trim()) return doctors;
    const term = search.trim().toLowerCase();
    return doctors.filter((doctor) => {
      return (
        doctor.name.toLowerCase().includes(term) ||
        doctor.specialization.toLowerCase().includes(term) ||
        (doctor.bio || "").toLowerCase().includes(term)
      );
    });
  }, [doctors, search]);

  const clearFilters = () => {
    setSearch("");
    setActiveFilter("");
    fetchDoctors("");
  };

  const countSlots = (availability) => availability.reduce((total, day) => total + (day.slots?.length || 0), 0);

  const updateScrollState = () => {
    const slider = sliderRef.current;
    if (!slider) return;

    setCanScrollLeft(slider.scrollLeft > 4);
    setCanScrollRight(slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 4);
  };

  const slideCards = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const amount = Math.max(slider.clientWidth * 0.85, 320);
    slider.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const timer = setTimeout(updateScrollState, 0);
    return () => clearTimeout(timer);
  }, [visibleDoctors, loading]);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-brand-500 via-brand-600 to-accent-600 p-8 text-white shadow-soft sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
              Doctor Directory
            </span>
            <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
              Find the right doctor, faster.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
              Explore the seeded doctors in a clean directory view, filter by specialization, and check availability at a glance.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
                Join to Book Appointments
              </Link>
              <button type="button" className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15" onClick={clearFilters}>
                Reset Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-white/70">Doctors</p>
              <p className="mt-1 text-3xl font-bold">{doctors.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-white/70">Specialties</p>
              <p className="mt-1 text-3xl font-bold">5</p>
            </div>
            <div className="col-span-2 rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-white/70">Available slots</p>
              <p className="mt-1 text-3xl font-bold">{doctors.reduce((sum, doctor) => sum + countSlots(doctor.availability), 0)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-heading text-xl font-bold text-ink">Browse doctors</h2>
            <p className="mt-1 text-sm text-slate-600">Filter by specialty or search by name and bio.</p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
            <input
              className="input lg:w-80"
              placeholder="Search name, specialization, bio"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <button type="button" className="btn-secondary" onClick={() => fetchDoctors()}>
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveFilter("");
              fetchDoctors("");
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              !activeFilter ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {specialtyPills.map((specialty) => (
            <button
              key={specialty}
              type="button"
              onClick={() => {
                setActiveFilter(specialty);
                fetchDoctors(specialty);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeFilter === specialty ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </section>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

      {loading ? (
        <div className="card p-8 text-center text-slate-600">Loading doctors...</div>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-600">Slide to view all available doctors ({visibleDoctors.length})</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => slideCards("prev")}
                disabled={!canScrollLeft}
              >
                Prev
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => slideCards("next")}
                disabled={!canScrollRight}
              >
                Next
              </button>
            </div>
          </div>

          <div
            ref={sliderRef}
            onScroll={updateScrollState}
            className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory"
          >
            {visibleDoctors.map((doctor) => (
              <article
                key={doctor.doctorId}
                className="card w-[88vw] shrink-0 snap-start overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-soft sm:w-[420px] lg:w-[440px]"
              >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-bold text-white">
                      {doctor.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-ink">{doctor.name}</h3>
                      <p className="text-sm text-brand-700">{doctor.specialization}</p>
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Approved
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">{doctor.bio || "No biography provided yet."}</p>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                <span className="text-slate-500">Experience</span>
                <span className="font-semibold text-slate-800">{doctor.experienceYears} years</span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Weekly availability</p>
                <div className="mt-2 space-y-2">
                  {doctor.availability.length === 0 ? (
                    <p className="text-sm text-slate-500">No availability set yet.</p>
                  ) : (
                    doctor.availability.map((day) => (
                      <div key={day.dayOfWeek} className="rounded-2xl border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-700">{dayNames[day.dayOfWeek]}</p>
                          <span className="text-xs text-slate-500">{day.slots.length} slots</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {day.slots.map((slot) => (
                            <span key={slot} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </article>
          ))}
          </div>
        </section>
      )}

      {!loading && visibleDoctors.length === 0 && (
        <div className="card p-8 text-center text-slate-500">No doctors match your current search.</div>
      )}
    </div>
  );
};

export default DoctorDirectoryPage;
