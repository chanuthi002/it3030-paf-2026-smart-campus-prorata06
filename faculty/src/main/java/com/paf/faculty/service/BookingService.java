package com.paf.faculty.service;

import com.paf.faculty.model.Availability;
import com.paf.faculty.model.Booking;
import com.paf.faculty.model.User;
import com.paf.faculty.repository.AvailabilityRepository;
import com.paf.faculty.repository.BookingRepository;
import com.paf.faculty.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepo;

    @Autowired
    private AvailabilityRepository availabilityRepo;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    // ✅ CREATE BOOKING
    public Booking createBooking(Booking newBooking) {

        // 🔥 AUTO SET USER NAME
        if (newBooking.getUserId() != null) {
            Optional<User> user = userRepository.findById(newBooking.getUserId());
            user.ifPresent(u -> newBooking.setBookedBy(u.getName()));
        }

        // 🔍 CHECK AVAILABILITY
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

        // 🔍 CHECK CONFLICT
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

        // ✅ SAVE
        Booking savedBooking = bookingRepo.save(newBooking);

        // 🔔 NOTIFICATION
        if (newBooking.getUserId() != null) {
            notificationService.createNotification(
                    newBooking.getUserId(),
                    "✅ Booking confirmed for Resource: " +
                            newBooking.getResourceId() +
                            " on " + newBooking.getDate() +
                            " (" + newBooking.getStartTime() +
                            " - " + newBooking.getEndTime() + ")");
        }

        return savedBooking;
    }

    // ✅ GET BOOKINGS BY RESOURCE
    public List<Booking> getByResource(String resourceId) {
        return bookingRepo.findByResourceId(resourceId);
    }

    // ✅ GET BOOKINGS BY USER
    public List<Booking> getByUserId(String userId) {
        return bookingRepo.findByUserId(userId);
    }

    // ✅ GET BOOKINGS BY DATE
    public List<Booking> getByDate(LocalDate date) {
        return bookingRepo.findByDate(date);
    }
}