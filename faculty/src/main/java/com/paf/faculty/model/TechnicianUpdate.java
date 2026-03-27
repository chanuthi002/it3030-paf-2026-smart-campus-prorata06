package com.paf.faculty.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "technician_updates")
@Data
public class TechnicianUpdate {

    @Id
    private String id;

    private String ticketId; // Reference to IncidentTicket

    private String message; // Update message/comment
    private UpdateType type; // COMMENT, STATUS_CHANGE, WORK_LOG, NOTE

    private String updatedBy; // Technician name
    private String updatedByUserId; // Technician user ID
    private LocalDateTime createdAt;

    private String previousStatus; // If status changed, what was the old status
    private String newStatus; // If status changed, what is the new status

    private long timeSpentMinutes; // For work log type
    private String workDescription; // What was done
}
