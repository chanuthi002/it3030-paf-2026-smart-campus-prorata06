package com.paf.faculty.service;

import com.paf.faculty.model.Availability;
import com.paf.faculty.model.Booking;
import com.paf.faculty.repository.AvailabilityRepository;
import com.paf.faculty.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepo;

    @Autowired
    private AvailabilityRepository availabilityRepo;

    // ✅ CREATE BOOKING
    public Booking createBooking(Booking newBooking) {

        // 🔍 1. Check availability exists
        List<Availability> availabilityList = availabilityRepo.findByResourceIdAndDate(
                newBooking.getResourceId(),
                newBooking.getDate());

        boolean validSlot = false;

        for (Availability a : availabilityList) {
            if (!newBooking.getStartTime().isBefore(a.getStartTime()) &&
                    !newBooking.getEndTime().isAfter(a.getEndTime())) {
                validSlot = true;
                break;
            }
        }

        if (!validSlot) {
            throw new RuntimeException("Booking not within availability!");
        }

        // 🔍 2. Check booking conflicts
        List<Booking> existingBookings = bookingRepo.findByResourceIdAndDate(
                newBooking.getResourceId(),
                newBooking.getDate());

        for (Booking b : existingBookings) {

            boolean overlap = newBooking.getStartTime().isBefore(b.getEndTime()) &&
                    newBooking.getEndTime().isAfter(b.getStartTime());

            if (overlap) {
                throw new RuntimeException("Booking conflict detected!");
            }
        }

        // ✅ Save booking
        return bookingRepo.save(newBooking);
    }

    // GET BOOKINGS
    public List<Booking> getByResource(String resourceId) {
        return bookingRepo.findByResourceIdAndDate(resourceId, null);
    }
}