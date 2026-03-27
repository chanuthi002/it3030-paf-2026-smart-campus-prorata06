package com.paf.faculty.service;

import com.paf.faculty.model.Availability;
import com.paf.faculty.repository.AvailabilityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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

    // ✅ GET BY ID
    public Optional<Availability> getById(String availabilityId) {
        return repository.findById(availabilityId);
    }

    // ✅ UPDATE AVAILABILITY
    public Availability updateAvailability(String availabilityId, Availability updatedAvailability) {

        Optional<Availability> existingOpt = repository.findById(availabilityId);
        if (existingOpt.isEmpty()) {
            throw new RuntimeException("Availability slot not found: " + availabilityId);
        }

        Availability existing = existingOpt.get();

        // 🔍 Check for time conflicts with other slots (excluding current one)
        List<Availability> conflictingSlots = repository.findByResourceIdAndDate(
                existing.getResourceId(),
                updatedAvailability.getDate());

        for (Availability slot : conflictingSlots) {
            // Skip the current slot being updated
            if (slot.getId().equals(availabilityId)) {
                continue;
            }

            boolean overlap = updatedAvailability.getStartTime().isBefore(slot.getEndTime()) &&
                    updatedAvailability.getEndTime().isAfter(slot.getStartTime());

            if (overlap) {
                throw new RuntimeException("Time slot conflict detected with another availability!");
            }
        }

        // ✅ Update the availability
        existing.setDate(updatedAvailability.getDate());
        existing.setStartTime(updatedAvailability.getStartTime());
        existing.setEndTime(updatedAvailability.getEndTime());

        return repository.save(existing);
    }

    // ✅ DELETE AVAILABILITY
    public void deleteAvailability(String availabilityId) {
        if (!repository.existsById(availabilityId)) {
            throw new RuntimeException("Availability slot not found: " + availabilityId);
        }
        repository.deleteById(availabilityId);
    }
}