package com.paf.faculty.controller;

import com.paf.faculty.model.IncidentAttachment;
import com.paf.faculty.service.IncidentAttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
@CrossOrigin
public class IncidentAttachmentController {

    @Autowired
    private IncidentAttachmentService service;

    // ✅ UPLOAD ATTACHMENT
    @PostMapping("/upload")
    public ResponseEntity<?> uploadAttachment(
            @RequestParam String ticketId,
            @RequestParam String uploadedByUserId,
            @RequestParam String uploadedByName,
            @RequestParam(required = false) String description,
            @RequestParam MultipartFile file) {
        try {
            IncidentAttachment attachment = service.saveAttachment(
                    ticketId,
                    file,
                    uploadedByUserId,
                    uploadedByName,
                    description);
            return ResponseEntity.ok(attachment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ GET ATTACHMENTS BY TICKET
    @GetMapping("/ticket/{ticketId}")
    public List<IncidentAttachment> getAttachmentsByTicket(@PathVariable String ticketId) {
        return service.getAttachmentsByTicket(ticketId);
    }

    // ✅ GET BY ID
    @GetMapping("/{attachmentId}")
    public ResponseEntity<?> getAttachmentById(@PathVariable String attachmentId) {
        return service.getAttachmentById(attachmentId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ DELETE ATTACHMENT
    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable String attachmentId) {
        try {
            service.deleteAttachment(attachmentId);
            return ResponseEntity.ok("Attachment deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ DOWNLOAD ATTACHMENT
    @GetMapping("/{attachmentId}/download")
    public ResponseEntity<?> downloadAttachment(@PathVariable String attachmentId) {
        try {
            return ResponseEntity.ok(service.getAttachmentById(attachmentId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
