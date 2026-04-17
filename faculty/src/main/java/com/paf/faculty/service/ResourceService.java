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

    // ✅ FIXED: Generate unique ID based on maximum existing ID
    private String generateCustomId() {
        List<Resource> allResources = repository.findAll();
        
        if (allResources.isEmpty()) {
            return "F0001";
        }
        
        int maxNumber = 0;
        for (Resource resource : allResources) {
            String id = resource.getId();
            if (id != null && id.startsWith("F")) {
                try {
                    int number = Integer.parseInt(id.substring(1));
                    if (number > maxNumber) {
                        maxNumber = number;
                    }
                } catch (NumberFormatException e) {
                    // Skip invalid IDs
                }
            }
        }
        
        int nextNumber = maxNumber + 1;
        return String.format("F%04d", nextNumber);
    }

    // ✅ FIXED CREATE - Always generate a NEW ID (ignore any ID from frontend)
    public Resource save(Resource resource) {
        // CRITICAL FIX: Always generate a new ID, don't trust the incoming ID
        String newId = generateCustomId();
        resource.setId(newId);
        System.out.println("🆕 Creating NEW resource with ID: " + newId);
        
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
            System.out.println("✏️ Updating resource with ID: " + id);
            return repository.save(existing);
        }
        return null;
    }

    // DELETE
    public void delete(String id) {
        System.out.println("🗑️ Deleting resource with ID: " + id);
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