import React, { useState } from "react";
import { useCar } from "../context/CarContext";
import axios from "axios";

const Booking = () => {
  const { selectedCar } = useCar();
  const [selected, setSelected] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedHandler = (startTime, endTime) => {
    setSelected(`${startTime} - ${endTime}`);
  };

  const bookCar = async () => {
    const selectedTimeSlot = selectedCar.timeSlots.find(
      (slot) => `${slot.startTime} - ${slot.endTime}` === selected
    );
    // console.log(selectedTimeSlot);

    if (!selectedTimeSlot) {
      setErrorMessage("Selected time slot not found");
      return;
    }

    try {
      setIsBooking(true);
      await axios.post(
        "https://car-rental-api-git-main-varunsp-163.vercel.app/api/cars/booknow",
        selectedTimeSlot
      );
      setIsBooking(false);
      setBooked(true);
      setErrorMessage(""); 
      console.log("Car booked successfully!");
    } catch (error) {
      setIsBooking(false);
      setErrorMessage("Booking failed: " + error.message);
      console.error("Booking failed:", error);
    }
  };

  const cancelCar = async () => {
    const selectedTimeSlot = selectedCar.timeSlots.find(
      (slot) => `${slot.startTime} - ${slot.endTime}` === selected
    );
    if (!selectedTimeSlot) {
      setErrorMessage("Selected time slot not found");
      return;
    }
    try {
      await axios.post(
        "https://car-rental-api-git-main-varunsp-163.vercel.app/api/cars/cancelCar",
        selectedTimeSlot
      );
      setErrorMessage(""); 
      console.log("Car canceled successfully!");
    } catch (error) {
      setErrorMessage("Canceling failed: " + error.message);
      console.error("Canceling failed:", error);
    }
  };

  if (!selectedCar) {
    return (
      <div className="justify-center font-bold text-2xl">
        <p>No car details found.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-2">Book your Car now</h1>
      <div key={selectedCar.id} className="max-w-[400px] p-4">
        <h3 className="text-2xl font-semibold mb-2">{selectedCar.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{selectedCar.description}</p>
        <div className="mb-3">
          <span>Slots available:</span>
        </div>
        <h4 className="text-sm text-center p-2 font-semibold">
          Start Time - End Time
        </h4>
        {selectedCar.timeSlots.map((slot) => (
          <div
            key={slot.id}
            className={
              slot.isBooked
                ? "flex flex-col justify-between p-1 gap-3 mb-2 line-through items-center"
                : "flex flex-col justify-between p-1 gap-3 mb-2 items-center"
            }
          >
            <button
              key={slot.id}
              onClick={() => selectedHandler(slot.startTime, slot.endTime)}
              className={`text-blue-600 hover:cursor-pointer ${
                selected === `${slot.startTime} - ${slot.endTime}`
                  ? "font-bold text-red-600"
                  : ""
              }`}
            >
              {slot.startTime} - {slot.endTime}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="font-bold mb-2">
          Selected Option: <span className="text-green-600">{selected}</span>
        </p>
        <div className="gap-2 flex">
          <div className="p-2">
            <button
              onClick={bookCar}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Book now
            </button>
          </div>
          <div className="p-2">
            <button
              onClick={cancelCar}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancel Booking
            </button>
          </div>
        </div>

        {isBooking && (
          <div className="text-center">
            <h1 className="font-bold text-2xl">Booking...</h1>
          </div>
        )}
        {booked && (
          <div className="text-center">
            <h1 className="font-bold text-3xl">Booked</h1>
          </div>
        )}
        {errorMessage && (
          <div className="text-center text-red-600 mt-2">{errorMessage}</div>
        )}
      </div>
    </>
  );
};

export default Booking;
