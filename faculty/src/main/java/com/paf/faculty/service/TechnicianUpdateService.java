package com.paf.faculty.service;

import com.paf.faculty.model.TechnicianUpdate;
import com.paf.faculty.model.UpdateType;
import com.paf.faculty.repository.TechnicianUpdateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TechnicianUpdateService {

    @Autowired
    private TechnicianUpdateRepository repository;

    @Autowired
    private NotificationService notificationService;

    // ✅ CREATE UPDATE (COMMENT)
    public TechnicianUpdate addComment(String ticketId, String message, String technicianId, String technicianName) {

        TechnicianUpdate update = new TechnicianUpdate();
        update.setTicketId(ticketId);
        update.setMessage(message);
        update.setType(UpdateType.COMMENT);
        update.setUpdatedBy(technicianName);
        update.setUpdatedByUserId(technicianId);
        update.setCreatedAt(LocalDateTime.now());

        return repository.save(update);
    }

    // ✅ ADD STATUS CHANGE LOG
    public TechnicianUpdate logStatusChange(String ticketId, String previousStatus, String newStatus,
            String technicianId, String technicianName) {

        TechnicianUpdate update = new TechnicianUpdate();
        update.setTicketId(ticketId);
        update.setType(UpdateType.STATUS_CHANGE);
        update.setPreviousStatus(previousStatus);
        update.setNewStatus(newStatus);
        update.setMessage("Status changed from " + previousStatus + " to " + newStatus);
        update.setUpdatedBy(technicianName);
        update.setUpdatedByUserId(technicianId);
        update.setCreatedAt(LocalDateTime.now());

        return repository.save(update);
    }

    // ✅ ADD WORK LOG
    public TechnicianUpdate logWork(String ticketId, String workDescription, long timeSpentMinutes,
            String technicianId, String technicianName) {

        TechnicianUpdate update = new TechnicianUpdate();
        update.setTicketId(ticketId);
        update.setType(UpdateType.WORK_LOG);
        update.setWorkDescription(workDescription);
        update.setTimeSpentMinutes(timeSpentMinutes);
        update.setMessage("Work logged: " + workDescription + " (" + timeSpentMinutes + " minutes)");
        update.setUpdatedBy(technicianName);
        update.setUpdatedByUserId(technicianId);
        update.setCreatedAt(LocalDateTime.now());

        return repository.save(update);
    }

    // ✅ ADD NOTE
    public TechnicianUpdate addNote(String ticketId, String note, String technicianId, String technicianName) {

        TechnicianUpdate update = new TechnicianUpdate();
        update.setTicketId(ticketId);
        update.setType(UpdateType.NOTE);
        update.setMessage(note);
        update.setUpdatedBy(technicianName);
        update.setUpdatedByUserId(technicianId);
        update.setCreatedAt(LocalDateTime.now());

        return repository.save(update);
    }

    // ✅ LOG ASSIGNMENT
    public TechnicianUpdate logAssignment(String ticketId, String assignedTechnicianId,
            String assignedTechnicianName, String adminId, String adminName) {

        TechnicianUpdate update = new TechnicianUpdate();
        update.setTicketId(ticketId);
        update.setType(UpdateType.ASSIGNMENT);
        update.setMessage("Ticket assigned to " + assignedTechnicianName);
        update.setUpdatedBy(adminName);
        update.setUpdatedByUserId(adminId);
        update.setCreatedAt(LocalDateTime.now());

        // 🔔 NOTIFY ASSIGNED TECHNICIAN
        notificationService.createNotification(
                assignedTechnicianId,
                "🔧 You have been assigned to ticket: " + ticketId);

        return repository.save(update);
    }

    // ✅ GET UPDATES FOR TICKET (TIMELINE)
    public List<TechnicianUpdate> getTicketUpdates(String ticketId) {
        return repository.findByTicketIdOrderByCreatedAtDesc(ticketId);
    }

    // ✅ GET UPDATES BY TYPE
    public List<TechnicianUpdate> getUpdatesByType(String ticketId, UpdateType type) {
        return repository.findByTicketIdAndType(ticketId, type);
    }

    // ✅ GET WORK LOGS FOR TICKET
    public List<TechnicianUpdate> getWorkLogs(String ticketId) {
        return repository.findByTicketIdAndType(ticketId, UpdateType.WORK_LOG);
    }

    // ✅ GET TOTAL TIME SPENT
    public long getTotalTimeSpent(String ticketId) {
        List<TechnicianUpdate> workLogs = getWorkLogs(ticketId);
        return workLogs.stream()
                .mapToLong(TechnicianUpdate::getTimeSpentMinutes)
                .sum();
    }

    // ✅ GET COMMENTS FOR TICKET
    public List<TechnicianUpdate> getComments(String ticketId) {
        return repository.findByTicketIdAndType(ticketId, UpdateType.COMMENT);
    }

    // ✅ GET UPDATES BY TECHNICIAN
    public List<TechnicianUpdate> getUpdatesByTechnician(String technicianId) {
        return repository.findByUpdatedByUserIdOrderByCreatedAtDesc(technicianId);
    }

    // ✅ GET BY ID
    public Optional<TechnicianUpdate> getUpdateById(String updateId) {
        return repository.findById(updateId);
    }

    // ✅ DELETE UPDATE
    public void deleteUpdate(String updateId) {
        if (!repository.existsById(updateId)) {
            throw new RuntimeException("Update not found: " + updateId);
        }
        repository.deleteById(updateId);
    }
}
