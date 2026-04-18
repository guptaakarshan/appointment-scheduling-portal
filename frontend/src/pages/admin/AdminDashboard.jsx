import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/client";
import { formatDate } from "../../utils/date";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    const [usersResponse, doctorsResponse, appointmentsResponse] = await Promise.all([
      api.get("/admin/users"),
      api.get("/admin/doctors"),
      api.get("/admin/appointments"),
    ]);

    setUsers(usersResponse.data.users);
    setDoctors(doctorsResponse.data.doctors);
    setAppointments(appointmentsResponse.data.appointments);
  };

  useEffect(() => {
    fetchData().catch((error) => {
      const msg = error.response?.data?.message || "Failed to load admin dashboard";
      setMessage(msg);
      toast.error(msg);
    });
  }, []);

  const updateDoctorApproval = async (doctorId, isApproved) => {
    setMessage("");
    try {
      const response = await api.patch(`/admin/doctors/${doctorId}/approval`, { isApproved });
      const doctorName = response.config.body ? JSON.parse(response.config.body) : "Doctor";
      if (isApproved) {
        toast.success("Doctor approved! They can now accept appointments.");
      } else {
        toast.warning("Doctor status updated to not approved.");
      }
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || "Approval update failed";
      setMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Monitor users, doctors, and appointments from one place.</p>
      </section>

      {message && (
        <section className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          {message}
        </section>
      )}

      <section className="card p-5">
        <h2 className="font-heading text-lg font-bold">All Users</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{user.name}</td>
                  <td className="py-2 pr-4">{user.email}</td>
                  <td className="py-2 pr-4 capitalize">{user.role}</td>
                  <td className="py-2 pr-4">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-heading text-lg font-bold">Doctors Approval</h2>
        <div className="mt-3 space-y-3">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
              <div>
                <p className="font-semibold text-slate-700">{doctor.name}</p>
                <p className="text-sm text-slate-600">{doctor.email}</p>
                <p className="text-xs text-slate-500">
                  {doctor.specialization} | {doctor.experienceYears} years
                </p>
              </div>

              <div className="flex gap-2">
                {doctor.isApproved ? (
                  <span className="flex items-center rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    ✓ Approved
                  </span>
                ) : (
                  <>
                    <button type="button" className="btn-secondary" onClick={() => updateDoctorApproval(doctor._id, true)}>
                      Approve
                    </button>
                    <button type="button" className="btn-ghost" onClick={() => updateDoctorApproval(doctor._id, false)}>
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {doctors.length === 0 && <p className="text-sm text-slate-500">No doctors registered yet.</p>}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-heading text-lg font-bold">All Appointments</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4">Patient</th>
                <th className="py-2 pr-4">Doctor</th>
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Slot</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{appointment.patient?.name || "N/A"}</td>
                  <td className="py-2 pr-4">{appointment.doctor?.name || "N/A"}</td>
                  <td className="py-2 pr-4">{formatDate(appointment.date)}</td>
                  <td className="py-2 pr-4">{appointment.timeSlot}</td>
                  <td className="py-2 pr-4 capitalize">{appointment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {appointments.length === 0 && <p className="mt-3 text-sm text-slate-500">No appointments found.</p>}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
