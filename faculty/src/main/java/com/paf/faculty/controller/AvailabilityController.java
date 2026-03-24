package com.paf.faculty.controller;

import com.paf.faculty.model.Availability;
import com.paf.faculty.service.AvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/availability")
@CrossOrigin
public class AvailabilityController {

    @Autowired
    private AvailabilityService service;

    // CREATE availability
    @PostMapping
    public Availability add(@RequestBody Availability availability) {
        return service.addAvailability(availability);
    }

    // GET availability by resource
    @GetMapping("/{resourceId}")
    public List<Availability> get(@PathVariable String resourceId) {
        return service.getByResource(resourceId);
    }
}