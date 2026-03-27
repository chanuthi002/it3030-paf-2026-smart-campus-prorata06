package com.paf.faculty.controller;

import com.paf.faculty.model.IncidentTicket;
import com.paf.faculty.model.TicketStatus;
import com.paf.faculty.model.TicketPriority;
import com.paf.faculty.service.IncidentTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin
public class IncidentTicketController {

    @Autowired
    private IncidentTicketService service;

    // ✅ CREATE TICKET
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody IncidentTicket ticket) {
        try {
            return ResponseEntity.ok(service.createTicket(ticket));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ GET ALL TICKETS
    @GetMapping
    public List<IncidentTicket> getAllTickets() {
        return service.getAllTickets();
    }

    // ✅ GET BY ID
    @GetMapping("/{ticketId}")
    public ResponseEntity<?> getTicketById(@PathVariable String ticketId) {
        return service.getTicketById(ticketId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ GET BY STATUS
    @GetMapping("/status/{status}")
    public List<IncidentTicket> getByStatus(@PathVariable TicketStatus status) {
        return service.getByStatus(status);
    }

    // ✅ GET BY RESOURCE
    @GetMapping("/resource/{resourceId}")
    public List<IncidentTicket> getByResource(@PathVariable String resourceId) {
        return service.getByResource(resourceId);
    }

    // ✅ GET BY REPORTER
    @GetMapping("/reporter/{reportedByUserId}")
    public List<IncidentTicket> getByReporter(@PathVariable String reportedByUserId) {
        return service.getByReporter(reportedByUserId);
    }

    // ✅ GET BY TECHNICIAN
    @GetMapping("/technician/{assignedToUserId}")
    public List<IncidentTicket> getByTechnician(@PathVariable String assignedToUserId) {
        return service.getByTechnician(assignedToUserId);
    }

    // ✅ GET BY PRIORITY
    @GetMapping("/priority/{priority}")
    public List<IncidentTicket> getByPriority(@PathVariable TicketPriority priority) {
        return service.getByPriority(priority);
    }

    // ✅ ASSIGN TICKET
    @PutMapping("/{ticketId}/assign")
    public ResponseEntity<?> assignTicket(
            @PathVariable String ticketId,
            @RequestParam String technicianUserId,
            @RequestParam String technicianName) {
        try {
            return ResponseEntity.ok(service.assignTicket(ticketId, technicianUserId, technicianName));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ UPDATE STATUS
    @PutMapping("/{ticketId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String ticketId,
            @RequestParam TicketStatus newStatus) {
        try {
            return ResponseEntity.ok(service.updateStatus(ticketId, newStatus));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ UPDATE PRIORITY
    @PutMapping("/{ticketId}/priority")
    public ResponseEntity<?> updatePriority(
            @PathVariable String ticketId,
            @RequestParam TicketPriority newPriority) {
        try {
            return ResponseEntity.ok(service.updatePriority(ticketId, newPriority));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ RESOLVE TICKET
    @PutMapping("/{ticketId}/resolve")
    public ResponseEntity<?> resolveTicket(
            @PathVariable String ticketId,
            @RequestParam String resolution,
            @RequestParam(required = false) String staffMessage) {
        try {
            return ResponseEntity.ok(service.resolveTicket(ticketId, resolution, staffMessage));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ ADD ATTACHMENT ID
    @PutMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<?> addAttachmentId(
            @PathVariable String ticketId,
            @PathVariable String attachmentId) {
        try {
            return ResponseEntity.ok(service.addAttachmentId(ticketId, attachmentId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ ADD UPDATE ID
    @PutMapping("/{ticketId}/updates/{updateId}")
    public ResponseEntity<?> addUpdateId(
            @PathVariable String ticketId,
            @PathVariable String updateId) {
        try {
            return ResponseEntity.ok(service.addUpdateId(ticketId, updateId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ DELETE TICKET
    @DeleteMapping("/{ticketId}")
    public ResponseEntity<?> deleteTicket(@PathVariable String ticketId) {
        try {
            service.deleteTicket(ticketId);
            return ResponseEntity.ok("Ticket deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ GET OPEN TICKETS BY PRIORITY (DASHBOARD)
    @GetMapping("/dashboard/open-high-priority")
    public List<IncidentTicket> getOpenHighPriorityTickets() {
        return service.getOpenTicketsByPriority();
    }

    // ✅ COUNT BY STATUS
    @GetMapping("/stats/count/{status}")
    public ResponseEntity<Long> countByStatus(@PathVariable TicketStatus status) {
        return ResponseEntity.ok(service.countByStatus(status));
    }
}
