package com.paf.faculty.repository;

import com.paf.faculty.model.TechnicianUpdate;
import com.paf.faculty.model.UpdateType;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TechnicianUpdateRepository extends MongoRepository<TechnicianUpdate, String> {

    List<TechnicianUpdate> findByTicketIdOrderByCreatedAtDesc(String ticketId);

    List<TechnicianUpdate> findByTicketIdAndType(String ticketId, UpdateType type);

    List<TechnicianUpdate> findByUpdatedByUserIdOrderByCreatedAtDesc(String updatedByUserId);
}
