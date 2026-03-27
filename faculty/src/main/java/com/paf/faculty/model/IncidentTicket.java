package com.paf.faculty.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "incident_tickets")
@Data
public class IncidentTicket {

    @Id
    private String id;

    private String title;
    private String description;
    private String resourceId; // Which resource has the issue
    private String reportedBy; // User who reported
    private String reportedByUserId; // User ID who reported
    private String assignedTo; // Technician assigned
    private String assignedToUserId; // Technician user ID

    private TicketStatus status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    private TicketPriority priority; // LOW, MEDIUM, HIGH, CRITICAL
    private TicketCategory category; // MAINTENANCE, REPAIR, ISSUE, OTHER

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;

    private List<String> attachmentIds; // References to IncidentAttachment IDs
    private List<String> updateIds; // References to TechnicianUpdate IDs

    private String resolution; // Final resolution description
}
