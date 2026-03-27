package com.paf.faculty.controller;

import com.paf.faculty.model.Availability;
import com.paf.faculty.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin
public class AvailabilityController {

    @Autowired
    private AvailabilityService service;

    // ✅ CREATE availability
    @PostMapping
    public ResponseEntity<?> add(@RequestBody Availability availability) {
        try {
            return ResponseEntity.ok(service.addAvailability(availability));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ GET availability by resource
    @GetMapping("/{resourceId}")
    public List<Availability> get(@PathVariable String resourceId) {
        return service.getByResource(resourceId);
    }

    // ✅ GET availability by ID
    @GetMapping("/slot/{availabilityId}")
    public ResponseEntity<?> getById(@PathVariable String availabilityId) {
        try {
            Optional<Availability> availability = service.getById(availabilityId);
            return availability.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ UPDATE availability
    @PutMapping("/{availabilityId}")
    public ResponseEntity<?> update(@PathVariable String availabilityId,
            @RequestBody Availability availability) {
        try {
            return ResponseEntity.ok(service.updateAvailability(availabilityId, availability));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ DELETE availability
    @DeleteMapping("/{availabilityId}")
    public ResponseEntity<?> delete(@PathVariable String availabilityId) {
        try {
            service.deleteAvailability(availabilityId);
            return ResponseEntity.ok("Availability deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}