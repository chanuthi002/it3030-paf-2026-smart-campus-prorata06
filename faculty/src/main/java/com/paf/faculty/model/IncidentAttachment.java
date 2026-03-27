package com.paf.faculty.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "incident_attachments")
@Data
public class IncidentAttachment {

    @Id
    private String id;

    private String ticketId; // Reference to IncidentTicket

    private String fileName;
    private String fileType; // MIME type (e.g., image/png, application/pdf)
    private Long fileSize; // in bytes
    private String fileUrl; // Storage path or URL

    private String uploadedBy; // User who uploaded
    private String uploadedByUserId; // User ID who uploaded
    private LocalDateTime uploadedAt;

    private String description; // Optional description of the attachment
}
