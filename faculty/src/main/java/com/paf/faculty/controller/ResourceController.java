package com.paf.faculty.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.paf.faculty.model.Resource;
import com.paf.faculty.service.ResourceService;;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {

    @Autowired
    private ResourceService service;

    // CREATE
    @PostMapping
    public Resource create(@RequestBody Resource resource) {
        return service.save(resource);
    }

    // READ
    @GetMapping
    public List<Resource> getAll() {
        return service.getAll();
    }
}