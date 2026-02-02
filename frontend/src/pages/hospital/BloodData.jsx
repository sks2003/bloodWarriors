import React, { useState } from "react";
import "./Hospital.css";

const BloodData = () => {
  const [requestData, setRequestData] = useState({
    bloodType: "",
    quantity: "",
    urgency: "normal",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [bloodInventory, setBloodInventory] = React.useState([
    { type: "A+", quantity: 0, status: "Unknown" },
    { type: "A-", quantity: 0, status: "Unknown" },
    { type: "B+", quantity: 0, status: "Unknown" },
    { type: "B-", quantity: 0, status: "Unknown" },
    { type: "AB+", quantity: 0, status: "Unknown" },
    { type: "AB-", quantity: 0, status: "Unknown" },
    { type: "O+", quantity: 0, status: "Unknown" },
    { type: "O-", quantity: 0, status: "Unknown" },
  ]);

  React.useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return;
      const user = JSON.parse(stored);
      if (!user || user.role !== "hospital") return;
      const res = await fetch(
        `http://localhost:5000/api/blood-banks/${user.id}`,
      );
      if (!res.ok) throw new Error("Failed to fetch inventory");
      const data = await res.json();
      const inv = data.inventory || {};
      const mapped = bloodInventory.map((b) => ({
        type: b.type,
        quantity: inv[b.type] || 0,
        status:
          (inv[b.type] || 0) > 20
            ? "Available"
            : (inv[b.type] || 0) > 5
              ? "Low"
              : "Critical",
      }));
      setBloodInventory(mapped);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "var(--success-color)";
      case "Low":
        return "var(--warning-color)";
      case "Critical":
        return "var(--danger-color)";
      default:
        return "var(--text-secondary)";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRequestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!requestData.bloodType || !requestData.quantity) {
      setMessage("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Create request data
      const stored = localStorage.getItem("user");
      const user = stored ? JSON.parse(stored) : null;
      const hospitalId = user && user.role === "hospital" ? user.id : "HOSP001";

      const requestPayload = {
        id: `REQ${Date.now()}`, // Generate unique ID
        bloodGroup: requestData.bloodType,
        message: `Blood request for ${requestData.bloodType} - ${requestData.notes || "No additional notes"}`,
        urgency:
          requestData.urgency === "normal"
            ? "Low"
            : requestData.urgency === "urgent"
              ? "High"
              : "Emergency",
        quantity: parseInt(requestData.quantity),
        hospitalId,
      };

      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to create blood request");
      }

      const result = await response.json();
      // refresh inventory display after submitting
      await fetchInventory();
      setMessage("Blood request submitted successfully!");

      // Reset form
      setRequestData({
        bloodType: "",
        quantity: "",
        urgency: "normal",
        notes: "",
      });
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error("Error submitting request:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="blood-data-container">
      <div className="blood-data-header">
        <h2>Blood Inventory Management</h2>
        <p>Monitor blood stock levels and submit requests</p>
      </div>

      <div className="blood-data-content">
        <div className="inventory-section">
          <h3>Current Blood Inventory</h3>
          <div className="blood-inventory-grid">
            {bloodInventory.map((blood) => (
              <div key={blood.type} className="blood-card">
                <div className="blood-type-header">
                  <h4>Blood Type: {blood.type}</h4>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(blood.status) }}
                  >
                    {blood.status}
                  </span>
                </div>

                <div className="quantity-display">
                  <span className="quantity-number">{blood.quantity}</span>
                  <span className="quantity-unit">units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="request-section">
          <h3>Blood Request Form</h3>
          <form className="request-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Blood Type:</label>
              <select
                className="blood-type-select"
                name="bloodType"
                value={requestData.bloodType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Blood Type</option>
                {bloodInventory.map((blood) => (
                  <option key={blood.type} value={blood.type}>
                    {blood.type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantity Needed (units):</label>
              <input
                type="number"
                name="quantity"
                value={requestData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                min="1"
                max="1000"
                className="quantity-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Urgency:</label>
              <select
                className="urgency-select"
                name="urgency"
                value={requestData.urgency}
                onChange={handleInputChange}
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notes:</label>
              <textarea
                name="notes"
                placeholder="Additional information about the request..."
                className="notes-textarea"
                rows="3"
                value={requestData.notes}
                onChange={handleInputChange}
              ></textarea>
            </div>

            {message && (
              <div
                className={`message ${message.includes("Error") ? "error" : "success"}`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="submit-request-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Blood Request"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BloodData;
