package com.paf.faculty.repository;

import com.paf.faculty.model.Availability;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface AvailabilityRepository extends MongoRepository<Availability, String> {

    List<Availability> findByResourceId(String resourceId);

    List<Availability> findByResourceIdAndDate(String resourceId, LocalDate date);
}