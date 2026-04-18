import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/client";
import { formatDate } from "../../utils/date";

const days = [
  { label: "Sunday", value: 0 },
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

const DoctorDashboard = () => {
  const [availabilityForm, setAvailabilityForm] = useState({ dayOfWeek: 1, slotsText: "09:00-09:30,10:00-10:30" });
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dailyDate, setDailyDate] = useState("");
  const [dailySchedule, setDailySchedule] = useState([]);
  const [message, setMessage] = useState("");

  const fetchAppointments = async () => {
    const { data } = await api.get("/doctor/appointments");
    setAppointments(data.appointments);
  };

  useEffect(() => {
    fetchAppointments().catch((error) => {
      const msg = error.response?.data?.message || "Failed to load appointments";
      setMessage(msg);
      toast.error(msg);
    });
  }, []);

  const addAvailabilityRule = () => {
    const slots = availabilityForm.slotsText
      .split(",")
      .map((slot) => slot.trim())
      .filter(Boolean);

    if (slots.length === 0) return;

    // Replace existing day rule so each day has one consolidated slot list.
    setAvailability((prev) => {
      const others = prev.filter((row) => row.dayOfWeek !== Number(availabilityForm.dayOfWeek));
      return [...others, { dayOfWeek: Number(availabilityForm.dayOfWeek), slots }].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    });
  };

  const saveAvailability = async () => {
    setMessage("");
    try {
      await api.put("/doctor/availability", { availability });
      toast.success("Availability updated! Your schedule is now live.");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update availability";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    setMessage("");
    try {
      await api.patch(`/doctor/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully! Patient has been notified.`);
      fetchAppointments();
    } catch (error) {
      const msg = error.response?.data?.message || "Status update failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const loadDailySchedule = async () => {
    if (!dailyDate) return;
    setMessage("");
    try {
      const { data } = await api.get(`/doctor/schedule?date=${dailyDate}`);
      setDailySchedule(data.appointments);
      toast.success(`Schedule loaded for ${dailyDate}. ${data.appointments.length} appointments.`);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to load daily schedule";
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="font-heading text-2xl font-bold">Doctor Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Set your availability and manage appointment requests.</p>
      </section>

      {message && (
        <section className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          {message}
        </section>
      )}

      <section className="card p-5">
        <h2 className="font-heading text-lg font-bold">Availability Manager</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <select
            className="input"
            value={availabilityForm.dayOfWeek}
            onChange={(event) => setAvailabilityForm((prev) => ({ ...prev, dayOfWeek: Number(event.target.value) }))}
          >
            {days.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>

          <input
            className="input"
            value={availabilityForm.slotsText}
            onChange={(event) => setAvailabilityForm((prev) => ({ ...prev, slotsText: event.target.value }))}
            placeholder="09:00-09:30,10:00-10:30"
          />

          <button type="button" className="btn-secondary" onClick={addAvailabilityRule}>
            Add / Replace Day Slots
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {availability.map((row) => (
            <div key={row.dayOfWeek} className="rounded-xl border border-slate-200 p-3 text-sm">
              <p className="font-semibold text-slate-700">{days[row.dayOfWeek].label}</p>
              <p className="text-slate-600">{row.slots.join(", ")}</p>
            </div>
          ))}
        </div>

        <button type="button" className="btn-primary mt-4" onClick={saveAvailability}>
          Save Availability
        </button>
      </section>

      <section className="card p-5">
        <h2 className="font-heading text-lg font-bold">Appointment Requests</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4">Patient</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Slot</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{appointment.patient?.name || "N/A"}</td>
                  <td className="py-2 pr-4">{formatDate(appointment.date)}</td>
                  <td className="py-2 pr-4">{appointment.timeSlot}</td>
                  <td className="py-2 pr-4 capitalize">{appointment.status}</td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="btn-ghost" onClick={() => updateStatus(appointment._id, "confirmed")}>
                        Confirm
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => updateStatus(appointment._id, "rejected")}>
                        Reject
                      </button>
                      <button type="button" className="btn-ghost" onClick={() => updateStatus(appointment._id, "completed")}>
                        Complete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && <p className="mt-3 text-sm text-slate-500">No appointment requests yet.</p>}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-heading text-lg font-bold">Daily Schedule</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <input type="date" className="input max-w-xs" value={dailyDate} onChange={(event) => setDailyDate(event.target.value)} />
          <button type="button" className="btn-secondary" onClick={loadDailySchedule}>
            Load Day
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {dailySchedule.map((appointment) => (
            <div key={appointment._id} className="rounded-xl border border-slate-200 p-3 text-sm">
              <p className="font-semibold text-slate-700">
                {appointment.timeSlot} - {appointment.patient?.name || "Unknown patient"}
              </p>
              <p className="capitalize text-slate-600">Status: {appointment.status}</p>
            </div>
          ))}
          {dailyDate && dailySchedule.length === 0 && <p className="text-sm text-slate-500">No appointments for this date.</p>}
        </div>
      </section>
    </div>
  );
};

export default DoctorDashboard;
