import { useState } from "react";
import doctors from "../../../data/doctors.json";

const PatientPortal = () => {
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const timeslots = ["09:00", "10:00", "14:00", "15:00"];

  const handleConfirm = () => {
    alert(`Booked with doctor ${doctor} on ${date} at ${time}`);
  };

  return (
    <div>
      <h2>Book Appointment</h2>

      <select onChange={(e) => setDoctor(e.target.value)}>
        <option>Select Doctor</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.name}>
            {doc.name} - {doc.specialty}
          </option>
        ))}
      </select>

      <input type="date" onChange={(e) => setDate(e.target.value)} />

      <div>
        {timeslots.map((slot) => (
          <button key={slot} onClick={() => setTime(slot)}>
            {slot}
          </button>
        ))}
      </div>

      {doctor && date && time && (
        <button onClick={handleConfirm}>Confirm</button>
      )}
    </div>
  );
};

export default PatientPortal;