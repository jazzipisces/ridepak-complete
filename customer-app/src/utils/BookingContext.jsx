import React, { createContext, useState, useContext } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [activeRide, setActiveRide] = useState(null);

  const createBooking = (bookingData) => {
    const booking = {
      id: 'PR' + Math.floor(Math.random() * 10000),
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setCurrentBooking(booking);
    setBookingHistory(prev => [booking, ...prev]);
    return booking;
  };

  const updateBookingStatus = (bookingId, status) => {
    if (currentBooking?.id === bookingId) {
      setCurrentBooking(prev => ({ ...prev, status }));
    }
    
    setBookingHistory(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status }
          : booking
      )
    );
  };

  const startRide = (booking) => {
    setActiveRide(booking);
    updateBookingStatus(booking.id, 'in-progress');
  };

  const completeRide = (bookingId) => {
    setActiveRide(null);
    updateBookingStatus(bookingId, 'completed');
    setCurrentBooking(null);
  };

  const cancelBooking = (bookingId) => {
    if (currentBooking?.id === bookingId) {
      setCurrentBooking(null);
    }
    updateBookingStatus(bookingId, 'cancelled');
    setActiveRide(null);
  };

  const value = {
    currentBooking,
    setCurrentBooking,
    bookingHistory,
    activeRide,
    createBooking,
    updateBookingStatus,
    startRide,
    completeRide,
    cancelBooking
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};