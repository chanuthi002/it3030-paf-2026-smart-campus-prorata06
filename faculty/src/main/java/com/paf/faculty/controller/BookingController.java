package com.paf.faculty.controller;

import com.paf.faculty.model.Booking;
import com.paf.faculty.service.BookingService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    @Autowired
    private BookingService service;

    // CREATE
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Booking booking) {
        try {
            return ResponseEntity.ok(service.createBooking(booking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // GET BY RESOURCE
    @GetMapping("/{resourceId}")
    public List<Booking> getByResource(@PathVariable String resourceId) {
        return service.getByResource(resourceId); // ✅ FIXED
    }
}
