import logo from "./assets/logo512.png";
import "./App.css";
import { BrowserRouter, Route, Link, Routes } from "react-router-dom";
import { Booking, Cars, Home } from "./pages";
import { useState, useEffect } from "react";
import { CarProvider } from "./context/CarContext"; // Import the CarProvider

function App() {
  const [dateState, setDateState] = useState(new Date());
  useEffect(() => {
    setInterval(() => setDateState(new Date()), 30000);
  }, []);
  return (
    <div>
      <BrowserRouter>
        <nav className="w-full flex justify-between items-center bg-white sm:px-8 px-4 py-4 border-b border-b-[#e6ebf4]">
          <Link to="/">
            <img
              src={logo}
              alt="logo image"
              srcset=""
              className="w-9 object-contain"
            />
          </Link>
          <div className="flex gap-2">
            <span className="font-bold">Date and Time:</span>
            <p>
              {" "}
              {dateState.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p>
              {dateState.toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </p>
          </div>
          <Link
            to="/cars"
            className="font-inter font-medium bg-[#6469ff] text-white px-4 py-2 rounded-md"
          >
            Reserve cars
          </Link>
        </nav>
        <main className="sm:p-8 px-4 py-8 w-full bg-[#f9fafe] min-h-[calc(100vh-73px)]">
          <CarProvider>
            <Routes>
              <Route path="/" element={<Home />} exact />
              <Route path="/cars" element={<Cars />} />
              <Route path="/cars/booknow" element={<Booking />} />
            </Routes>
          </CarProvider>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
