package com.paf.faculty.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.http.ResponseEntity;
import com.paf.faculty.model.Availability;
import com.paf.faculty.model.Resource;
import com.paf.faculty.service.ResourceService;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {

    @Autowired
    private ResourceService service;

    // ✅ CREATE
    @PostMapping
    public Resource create(@RequestBody Resource resource) {
        return service.save(resource);
    }

    // ✅ READ ALL
    @GetMapping
    public List<Resource> getAll() {
        return service.getAll();
    }

    // ✅ READ BY ID
    @GetMapping("/{id}")
    public Resource getById(@PathVariable String id) {
        return service.getById(id);
    }

    // ✅ UPDATE
    @PutMapping("/{id}")
    public Resource update(@PathVariable String id, @RequestBody Resource resource) {
        return service.update(id, resource);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public String delete(@PathVariable String id) {
        service.delete(id);
        return "Resource deleted successfully";
    }

    // ✅ FILTER BY TYPE
    @GetMapping("/type/{type}")
    public List<Resource> getByType(@PathVariable String type) {
        return service.getByType(type);
    }

    // ✅ FILTER BY CAPACITY
    @GetMapping("/capacity/{capacity}")
    public List<Resource> getByCapacity(@PathVariable int capacity) {
        return service.getByCapacity(capacity);
    }

    // ✅ FILTER BY LOCATION
    @GetMapping("/location/{location}")
    public List<Resource> getByLocation(@PathVariable String location) {
        return service.getByLocation(location);
    }

    // ✅ COMBINED FILTER
    @GetMapping("/search")
    public List<Resource> search(
            @RequestParam String type,
            @RequestParam String location) {
        return service.search(type, location);
    }

    /*
     * @PostMapping
     * public ResponseEntity<?> add(@RequestBody Availability availability) {
     * try {
     * return ResponseEntity.ok(service.addAvailability(availability));
     * } catch (RuntimeException e) {
     * return ResponseEntity.badRequest().body(e.getMessage());
     * }
     * }
     */
}