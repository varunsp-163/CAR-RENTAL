import React from "react";
import "react-dropdown/style.css";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCar } from "../context/CarContext"; // Import useCar

const Card = ({ cars }) => {
  const { setSelectedCar } = useCar();
  return (
    <>
      <div className="flex flex-wrap gap-4 justify-evenly">
        {cars.map((car) => (
          <div
            key={car.id}
            className={
              car.available
                ? "bg-white rounded-lg shadow-md max-w-[400px] p-4 border border-gray-300 hover:border-blue-500 transition duration-300 transform hover:scale-105"
                : "bg-white rounded-lg shadow-md max-w-[400px] p-4 border border-gray-300 hover:border-red-500 transition duration-300 transform hover:scale-105"
            }
          >
            <h3 className="text-2xl font-semibold mb-2">{car.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{car.description}</p>
            <div className="mb-3">
              <span>Empty Slots :</span>
            </div>

            {car.timeSlots.map((slot) => (
              <div key={slot.id} className="mb-2">
                <div
                  className={
                    slot.isBooked
                      ? "flex justify-between p-1 shadow-lg rounded-md gap-3 line-through bg-red-500 items-center"
                      : "flex justify-between p-1 shadow-lg rounded-md gap-3 bg-green-500 items-center"
                  }
                >
                  <h4 className="text-sm font-semibold">
                    Start Time - End Time
                  </h4>
                  <p className="text-blue-100">
                    {slot.startTime}-{slot.endTime}
                  </p>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <Link
                to="/cars/booknow"
                onClick={() => setSelectedCar(car)} // Set the selected car in the context
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Book now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Card;
