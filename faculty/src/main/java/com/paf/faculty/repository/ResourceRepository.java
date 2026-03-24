package com.paf.faculty.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.paf.faculty.model.Resource;;

public interface ResourceRepository extends MongoRepository<Resource, String> {
}