import React, { createContext, useContext, useState } from "react";
import { db } from "../SimpleSupabaseClient";

const PlacesContext = createContext();

export const PlacesProvider = ({ children }) => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await db.from("places").select("*");

      if (error) throw error;

      setPlaces(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addPlace = async (placeData) => {
    try {
      const { data, error } = await db.from("places").insert([placeData]);

      if (error) throw error;

      setPlaces([...places, data[0]]);
      return data[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <PlacesContext.Provider
      value={{
        places,
        loading,
        fetchPlaces,
        addPlace,
        lastUpdate,
      }}
    >
      {children}
    </PlacesContext.Provider>
  );
};

export const usePlaces = () => useContext(PlacesContext);
