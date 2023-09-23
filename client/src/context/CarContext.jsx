import React, { createContext, useContext, useState } from "react";

const CarContext = createContext();

export function CarProvider({ children }) {
  const [selectedCar, setSelectedCar] = useState(null);

  return (
    <CarContext.Provider value={{ selectedCar, setSelectedCar }}>
      {children}
    </CarContext.Provider>
  );
}

export function useCar() {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error("useCar must be used within a CarProvider");
  }
  return context;
}
