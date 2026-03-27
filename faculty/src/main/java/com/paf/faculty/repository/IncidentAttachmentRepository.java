package com.paf.faculty.repository;

import com.paf.faculty.model.IncidentAttachment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IncidentAttachmentRepository extends MongoRepository<IncidentAttachment, String> {

    List<IncidentAttachment> findByTicketId(String ticketId);
}
