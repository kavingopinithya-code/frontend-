import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    console.log("Submitting data:", { name, email }); // ✅ DEBUG

    try {
      const res = await fetch("https://backend-dcp9.onrender.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email })
      });

      // ❗ safer handling
      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      console.log("Response:", data);

      alert("Data sent successfully ✅");

      // ✅ clear form after success
      setName("");
      setEmail("");

    } catch (err) {
      console.log("Error:", err);
      alert("Error ❌ (Check backend or CORS)");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Test Form</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br /><br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
