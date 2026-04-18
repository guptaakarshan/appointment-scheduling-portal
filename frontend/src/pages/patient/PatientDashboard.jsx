import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/client";
import { dayNames, formatDate } from "../../utils/date";

const toIsoLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PatientDashboard = () => {
  const [specialization, setSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");

  const [booking, setBooking] = useState({
    doctorId: "",
    date: "",
    timeSlot: "",
    reason: "",
  });

  const [reschedule, setReschedule] = useState({ appointmentId: "", date: "", timeSlot: "" });

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.doctorId === booking.doctorId),
    [doctors, booking.doctorId]
  );

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !booking.date) return [];
    const day = new Date(booking.date).getDay();
    const entry = selectedDoctor.availability.find((a) => a.dayOfWeek === day);
    return entry?.slots || [];
  }, [selectedDoctor, booking.date]);

  const availableDates = useMemo(() => {
    if (!selectedDoctor || selectedDoctor.availability.length === 0) return [];

    const availableDays = new Set(selectedDoctor.availability.map((entry) => entry.dayOfWeek));
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let offset = 0; offset < 30; offset += 1) {
      const candidate = new Date(today);
      candidate.setDate(today.getDate() + offset);

      if (availableDays.has(candidate.getDay())) {
        const value = toIsoLocalDate(candidate);
        dates.push({
          value,
          label: `${dayNames[candidate.getDay()]} - ${candidate.toLocaleDateString()}`,
        });
      }
    }

    return dates;
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    const query = specialization ? `?specialization=${encodeURIComponent(specialization)}` : "";
    const { data } = await api.get(`/patient/doctors${query}`);
    setDoctors(data.doctors);
  };

  const fetchAppointments = async () => {
    const { data } = await api.get("/appointments/my");
    setAppointments(data.appointments);
  };

  const fetchNotifications = async () => {
    const { data } = await api.get("/notifications");
    setNotifications(data.notifications);
  };

  const initializePage = async () => {
    try {
      await Promise.all([fetchDoctors(), fetchAppointments(), fetchNotifications()]);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to load patient dashboard data";
      setMessage(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    initializePage();
  }, []);

  const bookAppointment = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/appointments", booking);
      setBooking({ doctorId: "", date: "", timeSlot: "", reason: "" });
      toast.success("Appointment booked successfully! The doctor will review your request.");
      await Promise.all([fetchAppointments(), fetchNotifications()]);
    } catch (error) {
      const msg = error.response?.data?.message || "Booking failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    setMessage("");
    try {
      await api.patch(`/appointments/${appointmentId}/cancel`);
      toast.success("Appointment cancelled.");
      await Promise.all([fetchAppointments(), fetchNotifications()]);
    } catch (error) {
      const msg = error.response?.data?.message || "Cancel failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const submitReschedule = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await api.patch(`/appointments/${reschedule.appointmentId}/reschedule`, {
        date: reschedule.date,
        timeSlot: reschedule.timeSlot,
      });
      setReschedule({ appointmentId: "", date: "", timeSlot: "" });
      toast.success("Appointment rescheduled! It's now pending doctor confirmation.");
      await Promise.all([fetchAppointments(), fetchNotifications()]);
    } catch (error) {
      const msg = error.response?.data?.message || "Reschedule failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      fetchNotifications();
      toast.info("Notification marked as read.", { autoClose: 2000 });
    } catch (error) {
      toast.error("Failed to mark notification as read.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="card animate-rise p-6">
        <h1 className="font-heading text-2xl font-bold">Patient Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Search doctors, book appointments, and track your history.</p>
      </section>

      {message && (
        <section className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          {message}
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-heading text-lg font-bold">Find Doctors</h2>
          <div className="mt-3 flex gap-3">
            <input
              className="input"
              placeholder="Search by specialization"
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
            />
            <button type="button" className="btn-secondary" onClick={fetchDoctors}>
              Search
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {doctors.map((doctor) => (
              <div key={doctor.doctorId} className="rounded-xl border border-slate-200 p-3">
                <p className="font-semibold text-slate-800">{doctor.name}</p>
                <p className="text-sm text-slate-600">{doctor.specialization}</p>
                <p className="mt-1 text-xs text-slate-500">{doctor.bio || "No bio available"}</p>
                <p className="mt-2 text-xs text-slate-500">Experience: {doctor.experienceYears} years</p>
                <p className="mt-2 text-xs font-medium text-brand-600">
                  Slots: {doctor.availability.length > 0 ? "Available by selected date" : "Not set yet"}
                </p>
              </div>
            ))}
            {doctors.length === 0 && <p className="text-sm text-slate-500">No doctors found.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-heading text-lg font-bold">Book Appointment</h2>
          <form className="mt-3 space-y-3" onSubmit={bookAppointment}>
            <div>
              <label className="mb-1 block text-sm font-medium">Doctor</label>
              <select
                className="input"
                value={booking.doctorId}
                onChange={(event) =>
                  setBooking((prev) => ({ ...prev, doctorId: event.target.value, date: "", timeSlot: "" }))
                }
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.doctorId} value={doctor.doctorId}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <select
                className="input"
                value={booking.date}
                onChange={(event) => setBooking((prev) => ({ ...prev, date: event.target.value, timeSlot: "" }))}
                disabled={!booking.doctorId || availableDates.length === 0}
                required
              >
                <option value="">{booking.doctorId ? "Select available date" : "Select doctor first"}</option>
                {availableDates.map((dateOption) => (
                  <option key={dateOption.value} value={dateOption.value}>
                    {dateOption.label}
                  </option>
                ))}
              </select>
              {booking.doctorId && availableDates.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">This doctor has not published any availability yet.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Time Slot</label>
              <select
                className="input"
                value={booking.timeSlot}
                onChange={(event) => setBooking((prev) => ({ ...prev, timeSlot: event.target.value }))}
                disabled={!booking.date || availableSlots.length === 0}
                required
              >
                <option value="">{booking.date ? "Select slot" : "Select date first"}</option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {booking.date && availableSlots.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">No slots available for the selected date.</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Reason (optional)</label>
              <textarea
                className="input min-h-24"
                value={booking.reason}
                onChange={(event) => setBooking((prev) => ({ ...prev, reason: event.target.value }))}
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Book Now
            </button>
          </form>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-heading text-lg font-bold">Appointment History</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4">Doctor</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Slot</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{appointment.doctor?.name || "N/A"}</td>
                  <td className="py-2 pr-4">{formatDate(appointment.date)}</td>
                  <td className="py-2 pr-4">{appointment.timeSlot}</td>
                  <td className="py-2 pr-4 capitalize">{appointment.status}</td>
                  <td className="py-2 pr-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => cancelAppointment(appointment._id)}
                        disabled={["cancelled", "completed"].includes(appointment.status)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() =>
                          setReschedule({ appointmentId: appointment._id, date: appointment.date, timeSlot: appointment.timeSlot })
                        }
                        disabled={["cancelled", "completed"].includes(appointment.status)}
                      >
                        Reschedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && <p className="mt-3 text-sm text-slate-500">No appointments yet.</p>}
        </div>
      </section>

      {reschedule.appointmentId && (
        <section className="card p-5">
          <h2 className="font-heading text-lg font-bold">Reschedule Appointment</h2>
          <form className="mt-3 grid gap-3 sm:grid-cols-3" onSubmit={submitReschedule}>
            <input
              type="date"
              className="input"
              value={reschedule.date}
              onChange={(event) => setReschedule((prev) => ({ ...prev, date: event.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Example: 10:00-10:30"
              value={reschedule.timeSlot}
              onChange={(event) => setReschedule((prev) => ({ ...prev, timeSlot: event.target.value }))}
              required
            />
            <button className="btn-secondary" type="submit">
              Save New Slot
            </button>
          </form>
        </section>
      )}

      <section className="card p-5">
        <h2 className="font-heading text-lg font-bold">Notifications</h2>
        <div className="mt-3 space-y-2">
          {notifications.map((item) => (
            <div key={item._id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-semibold text-slate-700">{item.title}</p>
                <p className="text-sm text-slate-600">{item.message}</p>
              </div>
              {!item.isRead && (
                <button type="button" className="btn-ghost" onClick={() => markNotificationRead(item._id)}>
                  Mark Read
                </button>
              )}
            </div>
          ))}
          {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications.</p>}
        </div>
      </section>
    </div>
  );
};

export default PatientDashboard;
