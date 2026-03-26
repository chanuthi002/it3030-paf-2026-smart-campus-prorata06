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
}