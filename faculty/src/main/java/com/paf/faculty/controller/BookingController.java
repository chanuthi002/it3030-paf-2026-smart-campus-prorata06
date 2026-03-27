package com.paf.faculty.controller;

import com.paf.faculty.model.Booking;
import com.paf.faculty.service.BookingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    @Autowired
    private BookingService service;

    // ✅ CREATE
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking booking) {
        try {
            return ResponseEntity.ok(service.createBooking(booking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ GET BY RESOURCE
    @GetMapping("/resource/{resourceId}")
    public List<Booking> getByResource(@PathVariable String resourceId) {
        return service.getByResource(resourceId);
    }

    // ✅ GET BY USER
    @GetMapping("/user/{userId}")
    public List<Booking> getByUser(@PathVariable String userId) {
        return service.getByUserId(userId);
    }

    // ✅ GET BY DATE
    @GetMapping("/date/{date}")
    public List<Booking> getByDate(@PathVariable String date) {
        return service.getByDate(LocalDate.parse(date));
    }

    // ✅ GET ALL BOOKINGS (ADMIN)
    @GetMapping
    public List<Booking> getAll() {
        return service.getAllBookings();
    }

    // ✅ CANCEL BOOKING (ADMIN)
    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancel(@PathVariable String bookingId) {
        try {
            return ResponseEntity.ok(service.cancelBooking(bookingId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ UPDATE BOOKING
    @PutMapping("/{bookingId}")
    public ResponseEntity<?> update(@PathVariable String bookingId, @RequestBody Booking updatedBooking) {
        try {
            return ResponseEntity.ok(service.updateBooking(bookingId, updatedBooking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ DELETE BOOKING
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> delete(@PathVariable String bookingId) {
        try {
            service.deleteBooking(bookingId);
            return ResponseEntity.ok("Booking deleted");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}