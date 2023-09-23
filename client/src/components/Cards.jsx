import React from "react";
import Card from "./Card";
import { useState, useEffect } from "react";


const Cards = () => {
  const [cars, setCars] = useState([]);

  async function fetchData() {
    try {
      const response = await fetch("http://localhost:5000/api/cars");
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Card cars={cars} />
    </div>
  );
};

export default Cards;
