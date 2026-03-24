package com.paf.faculty.service;

import com.paf.faculty.model.Availability;
import com.paf.faculty.repository.AvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvailabilityService {

    @Autowired
    private AvailabilityRepository repository;

    // ✅ CREATE WITH CONFLICT DETECTION
    public Availability addAvailability(Availability newAvailability) {

        // 🔍 Get existing availability for same resource + date
        List<Availability> existingList = repository.findByResourceIdAndDate(
                newAvailability.getResourceId(),
                newAvailability.getDate());

        // ⚠️ Check for time conflicts
        for (Availability existing : existingList) {

            boolean overlap = newAvailability.getStartTime().isBefore(existing.getEndTime()) &&
                    newAvailability.getEndTime().isAfter(existing.getStartTime());

            if (overlap) {
                throw new RuntimeException("Time slot conflict detected!");
            }
        }

        // ✅ Save if no conflict
        return repository.save(newAvailability);
    }

    // ✅ GET BY RESOURCE
    public List<Availability> getByResource(String resourceId) {
        return repository.findByResourceId(resourceId);
    }

    // ✅ GET BY RESOURCE + DATE (OPTIONAL - USEFUL)
    public List<Availability> getByResourceAndDate(String resourceId, java.time.LocalDate date) {
        return repository.findByResourceIdAndDate(resourceId, date);
    }
}