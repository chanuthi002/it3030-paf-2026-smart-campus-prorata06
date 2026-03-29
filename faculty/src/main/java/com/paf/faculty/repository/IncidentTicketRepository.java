package com.paf.faculty.repository;

import com.paf.faculty.model.IncidentTicket;
import com.paf.faculty.model.TicketStatus;
import com.paf.faculty.model.TicketPriority;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {

    List<IncidentTicket> findByStatus(TicketStatus status);

    List<IncidentTicket> findByResourceId(String resourceId);

    List<IncidentTicket> findByReportedByUserId(String reportedByUserId);

    List<IncidentTicket> findByAssignedToUserId(String assignedToUserId);

    List<IncidentTicket> findByPriority(TicketPriority priority);

    List<IncidentTicket> findByStatusOrderByPriorityDesc(TicketStatus status);

    long countByStatus(TicketStatus status);

    Optional<IncidentTicket> findTopByIdStartingWithOrderByIdDesc(String prefix);
}
