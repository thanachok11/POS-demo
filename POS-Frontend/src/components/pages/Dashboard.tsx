import React from "react";
import { Bar } from "react-chartjs-2";  // Change Line to Bar
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,  // Import BarElement instead of LineElement
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../styles/POSDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);  // Register BarElement

const Dashboard: React.FC = () => {
  const salesData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Daily Sales (฿)",
        data: [500, 700, 1500, 2000, 2500, 3000, 4000],
        backgroundColor: "#4caf50",  // Use backgroundColor for bar color
        borderColor: "#388e3c",      // Optionally set border color
        borderWidth: 1,              // Border width (optional)
      },
    ],
  };

  const salesOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Day of the Week",
        },
      },
      y: {
        title: {
          display: true,
          text: "Sales (฿)",
        },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>POS Dashboard</h1>
      </header>
      <main className="dashboard-main">
        <section className="dashboard-overview">
          <h2>Sales Overview</h2>
          <p>Today's Sales: ฿1,500</p>
          <p>Monthly Sales: ฿45,000</p>
        </section>
        <section className="dashboard-chart">
          <h2>Sales Performance</h2>
          <Bar data={salesData} options={salesOptions} />  {/* Changed Line to Bar */}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
