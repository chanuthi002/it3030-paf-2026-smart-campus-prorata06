package com.paf.faculty.repository;

import com.paf.faculty.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);
}