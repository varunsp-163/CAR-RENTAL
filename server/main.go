package main

import (
	"encoding/json"

	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/net/context"
)

type TimeSlot struct {
	ID        int    `json:"id"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	IsBooked  bool   `json:"isBooked"`
	BookingID int    `json:"bookingID"`
}

type Car struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Available   bool       `json:"available"`
	TimeSlots   []TimeSlot `json:"timeSlots"`
}

var cars []Car

func main() {
	godotenv.Load(".env")
	// Connect to MongoDB
	value := os.Getenv("MONGODB_CONNECTION")
	clientOptions := options.Client().ApplyURI(value)
	client, err := mongo.Connect(context.Background(), clientOptions)

	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	err = client.Ping(context.Background(), nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}
	defer client.Disconnect(context.Background())

	carsCollection := client.Database("Cars-Details").Collection("Cars")

	cursor, err := carsCollection.Find(context.Background(), bson.M{})
	if err != nil {
		log.Fatalf("Failed to query MongoDB: %v", err)
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var car Car
		if err := cursor.Decode(&car); err != nil {
			log.Printf("Error decoding car: %v", err)
			continue
		}
		cars = append(cars, car)
	}

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowedMethods: []string{"GET", "OPTIONS", "POST", "PATCH"},
	})

	http.HandleFunc("/api/cars", getCars)
	http.HandleFunc("/api/cars/booknow", bookCar)
	http.HandleFunc("/api/cars/cancelCar", cancelCar)

	handler := c.Handler(http.DefaultServeMux)

	http.ListenAndServe(":5000", handler)

}

func getCars(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cars)
}

// Booking car
func bookCar(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received a booking request")
	var selectedTimeSlot TimeSlot
	if err := json.NewDecoder(r.Body).Decode(&selectedTimeSlot); err != nil {
		http.Error(w, "Failed to decode selected time slot data", http.StatusBadRequest)
		return
	}

	var updatedCar *Car
	var updatedSlot *TimeSlot

	for j, car := range cars {

		for i, slot := range car.TimeSlots {
			if slot.StartTime == selectedTimeSlot.StartTime && slot.EndTime == selectedTimeSlot.EndTime && slot.ID == selectedTimeSlot.ID {
				if slot.IsBooked {
					errorMessage := map[string]string{"error": "Selected time slot is already booked"}
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusConflict)
					json.NewEncoder(w).Encode(errorMessage)
					return
				}

				cars[j].TimeSlots[i].IsBooked = true

				updatedCar = &cars[j]
				updatedSlot = &cars[j].TimeSlots[i]

				break
			}
		}
	}

	if updatedCar == nil || updatedSlot == nil {
		http.Error(w, "Selected time slot not found", http.StatusNotFound)
		return
	}

	value := os.Getenv("MONGODB_CONNECTION")
	clientOptions := options.Client().ApplyURI(value)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		http.Error(w, "Failed to connect to MongoDB", http.StatusInternalServerError)
		return
	}
	defer client.Disconnect(context.Background())

	carsCollection := client.Database("Cars-Details").Collection("Cars")

	filter := bson.M{
		"id":                  updatedCar.ID,
		"timeSlots.id":        updatedSlot.ID,
		"timeSlots.startTime": updatedSlot.StartTime,
		"timeSlots.endTime":   updatedSlot.EndTime,
	}

	update := bson.M{
		"$set": bson.M{
			"timeSlots.$.isBooked": true,
		},
	}

	fmt.Printf("Filter: %+v\n", filter)
	fmt.Printf("Update: %+v\n", update)

	_, err = carsCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		http.Error(w, "Failed to update the MongoDB document", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}

//canceling car

func cancelCar(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received a cacelation request")
	var selectedTimeSlot TimeSlot
	if err := json.NewDecoder(r.Body).Decode(&selectedTimeSlot); err != nil {
		http.Error(w, "Failed to decode selected time slot data", http.StatusBadRequest)
		return
	}

	var updatedCar *Car
	var updatedSlot *TimeSlot

	for j, car := range cars {

		for i, slot := range car.TimeSlots {
			if slot.StartTime == selectedTimeSlot.StartTime && slot.EndTime == selectedTimeSlot.EndTime && slot.ID == selectedTimeSlot.ID {

				cars[j].TimeSlots[i].IsBooked = false

				updatedCar = &cars[j]
				updatedSlot = &cars[j].TimeSlots[i]

				break
			}
		}
	}

	if updatedCar == nil || updatedSlot == nil {
		http.Error(w, "Selected time slot not found", http.StatusNotFound)
		return
	}

	value := os.Getenv("MONGODB_CONNECTION")
	clientOptions := options.Client().ApplyURI(value)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		http.Error(w, "Failed to connect to MongoDB", http.StatusInternalServerError)
		return
	}
	defer client.Disconnect(context.Background())

	carsCollection := client.Database("Cars-Details").Collection("Cars")

	filter := bson.M{
		"id":                  updatedCar.ID,
		"timeSlots.id":        updatedSlot.ID,
		"timeSlots.startTime": updatedSlot.StartTime,
		"timeSlots.endTime":   updatedSlot.EndTime,
	}

	update := bson.M{
		"$set": bson.M{
			"timeSlots.$.isBooked": false,
		},
	}

	fmt.Printf("Filter: %+v\n", filter)
	fmt.Printf("Update: %+v\n", update)

	_, err = carsCollection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		http.Error(w, "Failed to update the MongoDB document", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)

}
