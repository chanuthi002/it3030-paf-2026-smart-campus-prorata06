package com.paf.faculty.service;

import com.paf.faculty.model.IncidentAttachment;
import com.paf.faculty.repository.IncidentAttachmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class IncidentAttachmentService {

    @Autowired
    private IncidentAttachmentRepository repository;

    // 📁 FILE STORAGE PATH
    private static final String UPLOAD_DIR = "uploads/incident-attachments/";

    // ✅ SAVE ATTACHMENT
    public IncidentAttachment saveAttachment(String ticketId, MultipartFile file,
            String uploadedByUserId, String uploadedByName,
            String description) throws IOException {

        // 🔹 VALIDATE FILE
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // 🔹 CREATE FILE NAME
        String originalFileName = file.getOriginalFilename();
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

        // 🔹 ENSURE UPLOAD DIRECTORY EXISTS
        Path uploadPath = Paths.get(UPLOAD_DIR);
        Files.createDirectories(uploadPath);

        // 🔹 SAVE FILE
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.write(filePath, file.getBytes());

        // 🔹 CREATE ATTACHMENT RECORD
        IncidentAttachment attachment = new IncidentAttachment();
        attachment.setTicketId(ticketId);
        attachment.setFileName(originalFileName);
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setFileUrl(filePath.toString());
        attachment.setUploadedBy(uploadedByName);
        attachment.setUploadedByUserId(uploadedByUserId);
        attachment.setUploadedAt(LocalDateTime.now());
        attachment.setDescription(description);

        return repository.save(attachment);
    }

    // ✅ GET ATTACHMENTS BY TICKET
    public List<IncidentAttachment> getAttachmentsByTicket(String ticketId) {
        return repository.findByTicketId(ticketId);
    }

    // ✅ GET BY ID
    public Optional<IncidentAttachment> getAttachmentById(String attachmentId) {
        return repository.findById(attachmentId);
    }

    // ✅ DELETE ATTACHMENT (AND FILE)
    public void deleteAttachment(String attachmentId) {

        Optional<IncidentAttachment> attachmentOpt = repository.findById(attachmentId);
        if (attachmentOpt.isEmpty()) {
            throw new RuntimeException("Attachment not found: " + attachmentId);
        }

        IncidentAttachment attachment = attachmentOpt.get();

        // 🔹 DELETE FILE FROM DISK
        try {
            Path filePath = Paths.get(attachment.getFileUrl());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }

        // 🔹 DELETE DATABASE RECORD
        repository.deleteById(attachmentId);
    }

    // ✅ GET FILE CONTENT (FOR DOWNLOAD)
    public byte[] getFileContent(String attachmentId) throws IOException {

        Optional<IncidentAttachment> attachmentOpt = repository.findById(attachmentId);
        if (attachmentOpt.isEmpty()) {
            throw new RuntimeException("Attachment not found: " + attachmentId);
        }

        IncidentAttachment attachment = attachmentOpt.get();
        Path filePath = Paths.get(attachment.getFileUrl());

        return Files.readAllBytes(filePath);
    }

    // ✅ UPDATE ATTACHMENT DESCRIPTION
    public IncidentAttachment updateDescription(String attachmentId, String description) {

        Optional<IncidentAttachment> attachmentOpt = repository.findById(attachmentId);
        if (attachmentOpt.isEmpty()) {
            throw new RuntimeException("Attachment not found: " + attachmentId);
        }

        IncidentAttachment attachment = attachmentOpt.get();
        attachment.setDescription(description);

        return repository.save(attachment);
    }
}
