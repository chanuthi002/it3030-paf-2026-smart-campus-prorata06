package com.paf.faculty.service;

import com.paf.faculty.model.IncidentTicket;
import com.paf.faculty.model.TicketStatus;
import com.paf.faculty.model.TicketPriority;
import com.paf.faculty.model.TicketCategory;
import com.paf.faculty.repository.IncidentTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class IncidentTicketService {

    @Autowired
    private IncidentTicketRepository repository;

    @Autowired
    private NotificationService notificationService;

    // ✅ CREATE TICKET
    public IncidentTicket createTicket(IncidentTicket newTicket) {

        // 🔹 SET TIMESTAMPS
        newTicket.setCreatedAt(LocalDateTime.now());
        newTicket.setUpdatedAt(LocalDateTime.now());
        newTicket.setStatus(TicketStatus.OPEN);

        // 🔹 INITIALIZE LISTS
        if (newTicket.getAttachmentIds() == null) {
            newTicket.setAttachmentIds(new ArrayList<>());
        }
        if (newTicket.getUpdateIds() == null) {
            newTicket.setUpdateIds(new ArrayList<>());
        }

        // 🔹 SAVE AND RETURN
        return repository.save(newTicket);
    }

    // ✅ GET ALL TICKETS
    public List<IncidentTicket> getAllTickets() {
        return repository.findAll();
    }

    // ✅ GET BY ID
    public Optional<IncidentTicket> getTicketById(String ticketId) {
        return repository.findById(ticketId);
    }

    // ✅ GET BY STATUS
    public List<IncidentTicket> getByStatus(TicketStatus status) {
        return repository.findByStatus(status);
    }

    // ✅ GET BY RESOURCE
    public List<IncidentTicket> getByResource(String resourceId) {
        return repository.findByResourceId(resourceId);
    }

    // ✅ GET BY REPORTER
    public List<IncidentTicket> getByReporter(String reportedByUserId) {
        return repository.findByReportedByUserId(reportedByUserId);
    }

    // ✅ GET BY TECHNICIAN (ASSIGNED)
    public List<IncidentTicket> getByTechnician(String assignedToUserId) {
        return repository.findByAssignedToUserId(assignedToUserId);
    }

    // ✅ GET BY PRIORITY
    public List<IncidentTicket> getByPriority(TicketPriority priority) {
        return repository.findByPriority(priority);
    }

    // ✅ ASSIGN TICKET TO TECHNICIAN
    public IncidentTicket assignTicket(String ticketId, String technicianUserId, String technicianName) {

        Optional<IncidentTicket> ticketOpt = repository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found: " + ticketId);
        }

        IncidentTicket ticket = ticketOpt.get();
        ticket.setAssignedToUserId(technicianUserId);
        ticket.setAssignedTo(technicianName);
        ticket.setUpdatedAt(LocalDateTime.now());

        // 🔔 SEND NOTIFICATION
        notificationService.createNotification(
                technicianUserId,
                "🔧 New ticket assigned to you: " + ticket.getTitle());

        return repository.save(ticket);
    }

    // ✅ UPDATE STATUS
    public IncidentTicket updateStatus(String ticketId, TicketStatus newStatus) {

        Optional<IncidentTicket> ticketOpt = repository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found: " + ticketId);
        }

        IncidentTicket ticket = ticketOpt.get();
        ticket.setStatus(newStatus);
        ticket.setUpdatedAt(LocalDateTime.now());

        // 🔔 MARK AS RESOLVED IF STATUS IS RESOLVED
        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        // 🔔 SEND NOTIFICATION TO REPORTER
        String statusMessage = "📋 Ticket status updated: " + newStatus.toString();
        notificationService.createNotification(ticket.getReportedByUserId(), statusMessage);

        return repository.save(ticket);
    }

    // ✅ UPDATE PRIORITY
    public IncidentTicket updatePriority(String ticketId, TicketPriority newPriority) {

        Optional<IncidentTicket> ticketOpt = repository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found: " + ticketId);
        }

        IncidentTicket ticket = ticketOpt.get();
        ticket.setPriority(newPriority);
        ticket.setUpdatedAt(LocalDateTime.now());

        return repository.save(ticket);
    }

    // ✅ ADD RESOLUTION
    public IncidentTicket resolveTicket(String ticketId, String resolution) {

        Optional<IncidentTicket> ticketOpt = repository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found: " + ticketId);
        }

        IncidentTicket ticket = ticketOpt.get();
        ticket.setResolution(resolution);
        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setResolvedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());

        // 🔔 SEND NOTIFICATION TO REPORTER
        notificationService.createNotification(
                ticket.getReportedByUserId(),
                "✅ Your ticket has been resolved: " + ticket.getTitle());

        return repository.save(ticket);
    }

    // ✅ ADD ATTACHMENT ID
    public IncidentTicket addAttachmentId(String ticketId, String attachmentId) {

        Optional<IncidentTicket> ticketOpt = repository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found: " + ticketId);
        }

        IncidentTicket ticket = ticketOpt.get();
        if (!ticket.getAttachmentIds().contains(attachmentId)) {
            ticket.getAttachmentIds().add(attachmentId);
            ticket.setUpdatedAt(LocalDateTime.now());
        }

        return repository.save(ticket);
    }

    // ✅ ADD UPDATE ID
    public IncidentTicket addUpdateId(String ticketId, String updateId) {

        Optional<IncidentTicket> ticketOpt = repository.findById(ticketId);
        if (ticketOpt.isEmpty()) {
            throw new RuntimeException("Ticket not found: " + ticketId);
        }

        IncidentTicket ticket = ticketOpt.get();
        if (!ticket.getUpdateIds().contains(updateId)) {
            ticket.getUpdateIds().add(updateId);
            ticket.setUpdatedAt(LocalDateTime.now());
        }

        return repository.save(ticket);
    }

    // ✅ DELETE TICKET
    public void deleteTicket(String ticketId) {
        if (!repository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found: " + ticketId);
        }
        repository.deleteById(ticketId);
    }

    // ✅ GET OPEN TICKETS BY PRIORITY (Dashboard)
    public List<IncidentTicket> getOpenTicketsByPriority() {
        return repository.findByStatusOrderByPriorityDesc(TicketStatus.OPEN);
    }

    // ✅ COUNT BY STATUS
    public long countByStatus(TicketStatus status) {
        return repository.countByStatus(status);
    }
}
