package com.paf.faculty.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.paf.faculty.model.Resource;
import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(String type);

    List<Resource> findByCapacityGreaterThan(int capacity);

    List<Resource> findByLocation(String location);

    List<Resource> findByTypeAndLocation(String type, String location);
}