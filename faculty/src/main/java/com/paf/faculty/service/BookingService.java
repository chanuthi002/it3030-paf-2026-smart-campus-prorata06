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

    private static final String BOOKING_ID_PREFIX = "FB";
    private static final int BOOKING_ID_WIDTH = 6;

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

        if (newBooking.getId() == null || newBooking.getId().isBlank()) {
            newBooking.setId(generateNextBookingId());
        }

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
        newBooking.setStatus("ACTIVE");
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

    // ✅ GET ALL BOOKINGS (ADMIN)
    public List<Booking> getAllBookings() {
        return bookingRepo.findAll();
    }

    // ✅ CANCEL BOOKING (ADMIN)
    public Booking cancelBooking(String bookingId) {
        Optional<Booking> existing = bookingRepo.findById(bookingId);
        if (existing.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = existing.get();
        booking.setStatus("CANCELLED");
        return bookingRepo.save(booking);
    }

    // ✅ UPDATE BOOKING
    public Booking updateBooking(String bookingId, Booking updatedBooking) {
        Optional<Booking> existing = bookingRepo.findById(bookingId);
        if (existing.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = existing.get();
        booking.setResourceId(updatedBooking.getResourceId());
        booking.setDate(updatedBooking.getDate());
        booking.setStartTime(updatedBooking.getStartTime());
        booking.setEndTime(updatedBooking.getEndTime());
        booking.setBookedBy(updatedBooking.getBookedBy());
        booking.setUserId(updatedBooking.getUserId());

        return bookingRepo.save(booking);
    }

    // ✅ DELETE BOOKING
    public void deleteBooking(String bookingId) {
        if (!bookingRepo.existsById(bookingId)) {
            throw new RuntimeException("Booking not found");
        }
        bookingRepo.deleteById(bookingId);
    }

    private String generateNextBookingId() {
        Optional<Booking> latest = bookingRepo.findTopByIdStartingWithOrderByIdDesc(BOOKING_ID_PREFIX);

        if (latest.isEmpty()) {
            return BOOKING_ID_PREFIX + String.format("%0" + BOOKING_ID_WIDTH + "d", 0);
        }

        String latestId = latest.get().getId();
        String numericPart = latestId.substring(BOOKING_ID_PREFIX.length());
        int nextNumber = Integer.parseInt(numericPart) + 1;

        return BOOKING_ID_PREFIX + String.format("%0" + BOOKING_ID_WIDTH + "d", nextNumber);
    }
}