package com.paf.faculty.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import com.paf.faculty.model.Resource;
import com.paf.faculty.repository.ResourceRepository;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository repository;

    // CREATE
    public Resource save(Resource resource) {
        return repository.save(resource);
    }

    // READ ALL
    public List<Resource> getAll() {
        return repository.findAll();
    }

    // READ BY ID
    public Resource getById(String id) {
        Optional<Resource> resource = repository.findById(id);
        return resource.orElse(null);
    }

    // UPDATE
    public Resource update(String id, Resource newResource) {
        Resource existing = getById(id);

        if (existing != null) {
            existing.setName(newResource.getName());
            existing.setType(newResource.getType());
            existing.setCapacity(newResource.getCapacity());
            existing.setLocation(newResource.getLocation());
            existing.setStatus(newResource.getStatus());
            return repository.save(existing);
        }
        return null;
    }

    // DELETE
    public void delete(String id) {
        repository.deleteById(id);
    }

    // FILTER BY TYPE
    public List<Resource> getByType(String type) {
        return repository.findByType(type);
    }

    // FILTER BY CAPACITY
    public List<Resource> getByCapacity(int capacity) {
        return repository.findByCapacityGreaterThan(capacity);
    }

    // FILTER BY LOCATION
    public List<Resource> getByLocation(String location) {
        return repository.findByLocation(location);
    }

    // COMBINED FILTER
    public List<Resource> search(String type, String location) {
        return repository.findByTypeAndLocation(type, location);
    }
}