import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "./api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";

function Dashboard({ userName }) {

  const [balance, setBalance] = useState(0);
  const [showForm, setShowForm] = useState(false);
const [budget, setBudget] = useState(0);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
const [foodTotal, setFoodTotal] = useState(0);
const [travelTotal, setTravelTotal] = useState(0);
const [shoppingTotal, setShoppingTotal] = useState(0);
const [otherTotal, setOtherTotal] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState("");
const [daysLeft, setDaysLeft] = useState(0);
const [dailyLimit, setDailyLimit] = useState(0);
const [trendData, setTrendData] = useState([]);
 const userString =
  localStorage.getItem("user");

const user =
  userString ? JSON.parse(userString) : null;

const userId = user?.id;
const [activePage, setActivePage] =
  useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
if (!userId) {
  console.log("No User Session Found");
}
console.log("USER =", user);
console.log("USER ID =", userId);
  const COLORS = [
  "#FF8042", // Food
  "#0088FE", // Travel
  "#00C49F", // Shopping
  "#FFBB28"  // Other
];


const [currentMonth, setCurrentMonth] = useState(0);
const [previousMonth, setPreviousMonth] = useState(0);

  const [currentWeek, setCurrentWeek] = useState(0);
const [previousWeek, setPreviousWeek] = useState(0);

const chartData = [
  { name: "Food", value: foodTotal },
  { name: "Travel", value: travelTotal },
  { name: "Shopping", value: shoppingTotal },
  { name: "Other", value: otherTotal }
].filter(item => item.value > 0);
const [categorySummary, setCategorySummary] = useState({});
const [weeklyData, setWeeklyData] = useState([]);





  // 🔹 Load data on page load
 useEffect(() => {

  if (!userId) return;

  loadData();
  fetchWeekly();

}, [userId]);
useEffect(() => {
  calculateAdvice();
}, [budget, expenses]);
useEffect(() => {
  calculateCategoryTotals();
}, [expenses]);
useEffect(() => {
  calculateBudgetStatus();
}, [budget, expenses]);



const fetchWeekly = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/expense/weekly-trend?userId=${userId}`
    );
console.log("RAW RESPONSE:", res.data);
    const formatted = Object.keys(res.data).map((key) => ({
      day: key,
      amount: res.data[key]
    }));

    setWeeklyData(formatted);

  } catch (err) {
    console.log(err);
  }
  
};
const fetchTrend = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/expense/monthly-trend?userId=${userId}`
    );

    const formatted = Object.keys(res.data).map((key) => ({
      month: key,
      amount: res.data[key]
    }));

    setTrendData(formatted);

  } catch (err) {
    console.log(err);
  }
};
 const loadData = async () => {
  await fetchBudget();
  await fetchBalance();
  await fetchExpenses();
  await fetchMonthlyComparison();
   await fetchCategorySummary();
   await fetchWeeklyComparison();
   await fetchTrend();
   
  calculateAdvice();
};

  // 🔹 Balance API
  const fetchBalance = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/dashboard/balance?userId=${userId}`
      );
      setBalance(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchWeeklyComparison = async () => {

  console.log("userId =", userId);

  if (!userId) {
    console.log("User ID missing");
    return;
  }

  const res = await axios.get(
    `${BASE_URL}/expense/weekly-comparison?userId=${userId}`
  );

  setCurrentWeek(res.data.currentWeek);
  setPreviousWeek(res.data.previousWeek);
};
const fetchCategorySummary = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/expense/category-summary?userId=${userId}`
    );

    setCategorySummary(res.data);

  } catch (err) {
    console.log(err);
  }
};
const topCategory =
  Object.entries(categorySummary).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ["", 0]
  );
  // 🔹 Expense list API
  const fetchExpenses = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/expense/all?userId=${userId}`
      );

      console.log("Expenses:", res.data);
      setExpenses(res.data);

    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 ADD EXPENSE
  const addExpense = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/expense/add?userId=${userId}`,
        {
          title,
          amount: parseFloat(amount),
          category
        }
      );

      alert(res.data);

      setTitle("");
      setAmount("");
      setCategory("Food");

      await loadData(); // 🔥 FIX: proper refresh

    } catch (err) {
      console.log(err);
      alert(err.response?.data || "Failed to add expense");
    }
  };

  // 🔹 DELETE EXPENSE
  const deleteExpense = async (id) => {
    try {
      await axios.delete(
        `${BASE_URL}/expense/delete/${id}`
      );

      alert("Deleted Successfully");

      await loadData(); // 🔥 FIX

    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  // 🔹 UPDATE EXPENSE
  const updateExpense = async (id) => {

    const old = expenses.find((e) => e.id === id);

    const newTitle = prompt("Enter title", old.title);
    const newAmount = prompt("Enter amount", old.amount);
    const newCategory = prompt("Enter category", old.category);

    if (!newTitle || !newAmount || !newCategory) {
      alert("All fields required");
      return;
    }

    try {
      await axios.put(
        `${BASE_URL}/expense/update/${id}`,
        {
          title: newTitle,
          amount: parseFloat(newAmount),
          category: newCategory
        }
      );

      alert("Updated Successfully");

      await loadData(); // 🔥 FIX

    } catch (err) {
      console.log(err);
      alert("Update failed");
    }
  };
  const setMonthlyBudget = async () => {

  const amount = prompt(
    "Enter Monthly Budget"
  );

  if (!amount || amount <= 0) {
    alert("Enter valid amount");
    return;
  }

  try {

    const res = await axios.post(
      `${BASE_URL}/budget/set?userId=${userId}&amount=${amount}`
    );

    alert(res.data);

    fetchBudget();

  } catch (err) {
    console.log(err);
    alert("Failed to save budget");
  }
};
const fetchBudget = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/budget/get?userId=${userId}`
    );

    setBudget(res.data);

  } catch (err) {
    console.log(err);
  }
};
const downloadReport = () => {
  const today = new Date().toLocaleDateString();

  let total = expenses.reduce(
    (sum, e) => sum + e.amount,
    0
  );

  let report = `
BUDGET BUDDY REPORT
Generated: ${today}

---------------------------------
EXPENSE LIST
---------------------------------

`;

  expenses.forEach((e) => {
    report += `${e.title} | ₹${e.amount} | ${e.category}\n`;
  });

  report += `
---------------------------------
TOTAL SPENT: ₹${total}
---------------------------------
`;

  const blob = new Blob([report], {
    type: "text/plain"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "budget-report.txt";
  a.click();
};

const calculateBudgetStatus = () => {

  if (budget <= 0) {
    setBudgetStatus("No Budget Set");
    return;
  }

  const percentageUsed =
    (spent / budget) * 100;

  if (percentageUsed >= 90) {
    setBudgetStatus("🔴 Danger: You've used 90%+ of your budget");
  }
  else if (percentageUsed >= 75) {
    setBudgetStatus("🟡 Warning: You've used 75%+ of your budget");
  }
  else {
    setBudgetStatus("🟢 Budget Health: Good");
  }
};
const calculateCategoryTotals = () => {

  let food = 0;
  let travel = 0;
  let shopping = 0;
  let other = 0;

  expenses.forEach((exp) => {

    if (exp.category === "Food") {
      food += exp.amount;
    }
    else if (exp.category === "Travel") {
      travel += exp.amount;
    }
    else if (exp.category === "Shopping") {
      shopping += exp.amount;
    }
    else {
      other += exp.amount;
    }

  });

  setFoodTotal(food);
  setTravelTotal(travel);
  setShoppingTotal(shopping);
  setOtherTotal(other);
};
const fetchMonthlyComparison = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/expense/monthly-comparison?userId=${userId}`
    );

    setCurrentMonth(res.data.currentMonth);
    setPreviousMonth(res.data.previousMonth);

  } catch (err) {
    console.log(err);
  }
};
const handleLogout = () => {
  localStorage.removeItem("user");
  window.location.href = "/";
};
const difference = currentMonth - previousMonth;

const percentage =
  previousMonth === 0
    ? 100
    : ((difference / previousMonth) * 100).toFixed(1);


const spent = expenses.reduce(
  (sum, exp) => sum + exp.amount,
  0
);

const remaining = budget - spent;
const dailyLimitValue =
  daysLeft > 0
    ? (remaining / daysLeft).toFixed(2)
    : 0;
const calculateAdvice = () => {

  const today = new Date();

  const lastDay = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  );

  const remainingDays =
    lastDay.getDate() - today.getDate();

  setDaysLeft(remainingDays);

  const totalSpent = expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );

  const remainingBudget =
    budget - totalSpent;

  if (remainingDays > 0) {
   
    setDailyLimit(
      (remainingBudget / remainingDays).toFixed(2)
    );
  }
};

  return (
    <div className="dashboard-layout">
      <div
  className="hamburger"
  onClick={() =>
    setSidebarOpen(!sidebarOpen)
  }
>
  ☰
</div>
    <div
  className={
    sidebarOpen
      ? "sidebar open"
      : "sidebar"
  }
>
 
<div className="logo-circle">
  💰
</div>
 <h1 className="app-title">
  BudgetBuddy
</h1>

  <div
  className="menu-item"
  onClick={() => {
    setActivePage("dashboard");
    setSidebarOpen(false);
  }}
>
   Dashboard
</div>

<div
  className="menu-item"
 onClick={() => {
  setActivePage("add");
  setSidebarOpen(false);
  setShowForm(true);
}}
>
   Add Expense
</div>

<div
  className="menu-item"
  onClick={() => {
    setActivePage("analytics");
    setSidebarOpen(false);
  }}
>
   Analytics
</div>


<div
  className="menu-item"
  onClick={() => {
    setActivePage("expenses");
    setSidebarOpen(false);
  }}
>
   Expenses
</div>
  <div className="menu-item logout" onClick={handleLogout}>
   Logout
</div>
  
</div>

<div
  className={
    sidebarOpen
      ? "content sidebar-active"
      : "content"
  }
>
    <div className="container">
      <div className="dashboard-card-container">
{activePage === "dashboard" && (
  <>
    
  
        <h1>Welcome, {userName} </h1>
<div className="cards">

 

  <div className="card">
    <h3> Budget</h3>
    <h2>₹{budget}</h2>
  </div>

  <div className="card">
    <h3> Spent</h3>
    <h2>₹{spent}</h2>
  </div>

  <div className="card">
    <h3>Remaining</h3>
    <h2>₹{remaining}</h2>
  </div>

  <div className="card">

<h3> Budget Advice</h3>

<p>
  Days Left This Month: {daysLeft}
</p>

<p>
  Recommended Daily Spending:
  ₹{dailyLimitValue}
</p>
</div>

  <div className="card">
<h3>⚠️ Budget Status</h3>

<p>{budgetStatus}</p>
</div>
<div className="card">
  <h3> Top Spending Category</h3>

  {Object.entries(categorySummary).map(([key, value]) => (
    <p key={key}>
      {key}: ₹{value}
    </p>
  ))}

  <h4>
     Highest: {topCategory[0]} → ₹{topCategory[1]}
  </h4>
</div>

<div className="card">
  <h3> Weekly Comparison</h3>

  <p>This Week: ₹{currentWeek}</p>
  <p>Last Week: ₹{previousWeek}</p>

  <p>
    Difference: ₹{currentWeek - previousWeek}
  </p>
</div>
<div className="card">
  
  <h3> Monthly Comparison</h3>

  <p>This Month: ₹{currentMonth}</p>

  <p>Last Month: ₹{previousMonth}</p>

  <p>
    {difference >= 0
      ? `↑ ${percentage}% increase`
      : `↓ ${Math.abs(percentage)}% decrease`}
  </p>
  
</div>
</div>
</>
)}


{activePage === "analytics" && (
<>

<h3>📊 Spending by Category</h3>

<p>🍔 Food: ₹{foodTotal}</p>

<p>🚌 Travel: ₹{travelTotal}</p>

<p>🛍️ Shopping: ₹{shoppingTotal}</p>

<p>📦 Other: ₹{otherTotal}</p>


<h3> Expense Distribution</h3>
<div className="card">
<PieChart width={400} height={300}>
  <Pie
  data={chartData}
  dataKey="value"
  cx="50%"
  cy="50%"
  outerRadius={100}
  label
>
  {chartData.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={COLORS[index % COLORS.length]}
    />
  ))}
</Pie>

  <Tooltip />
  <Legend />
</PieChart>
  </div>
<h3> Monthly Spending</h3>
<div className="card">
<LineChart width={500} height={300} data={trendData}>
  <XAxis dataKey="month" />
  <YAxis />
  <Tooltip />
  <CartesianGrid stroke="#ccc" />
  <Line type="monotone" dataKey="amount" stroke="#8884d8" />
</LineChart>
</div>
<h3>📊 Weekly Spending</h3>

{weeklyData.length > 0 ? (
  <div className="card">
  <BarChart width={500} height={300} data={weeklyData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="day" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="amount" fill="#4f46e5" />
  </BarChart>
  </div>
) : (
  <p>No weekly data available</p>
)}
</>
)}

{activePage === "add" && (
  <div className="add-page">

    {/* HEADER */}
    <div className="page-header">
      <h2>➕ Add Expense</h2>

      <div className="action-buttons">
        
        <button onClick={loadData}>
  🔄 Refresh
</button>
        <button onClick={setMonthlyBudget}>
           Set Budget
        </button>
      </div>
    </div>

    {/* FORM CENTER CARD */}
    {showForm && (
      <div className="center-card">
        <h3>Enter Expense Details</h3>

        <div className="expense-form">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Other</option>
          </select>

          <button onClick={addExpense}>
            Save Expense
          </button>
        </div>
      </div>
    )}

  </div>
)}
{activePage === "expenses" && (
  <>
    <h3> Recent Expenses</h3>

    <ul>
      {expenses
        .slice()
        .reverse()
        .slice(0, 5)
        .map((exp) => (
          <li key={exp.id}>
            {exp.title} - ₹{exp.amount}
          </li>
        ))}
    </ul>

    <h3> Your Expenses</h3>

    {expenses.length === 0 ? (
      <p>No expenses added yet</p>
    ) : (
      <table className="expense-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td>{exp.title}</td>
              <td>₹{exp.amount}</td>
              <td>{exp.category}</td>
              <td>{exp.date}</td>

              <td>
                <button onClick={() => deleteExpense(exp.id)}>
                  Delete
                </button>

                <button onClick={() => updateExpense(exp.id)}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    )}
    <button onClick={downloadReport}>
   Download Monthly Report
</button>
  </>
)}


      </div>
      
    </div>
    </div>
    </div>
    
  );
}

export default Dashboard;