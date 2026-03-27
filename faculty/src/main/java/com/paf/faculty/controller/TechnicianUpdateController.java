package com.paf.faculty.controller;

import com.paf.faculty.model.TechnicianUpdate;
import com.paf.faculty.model.UpdateType;
import com.paf.faculty.service.TechnicianUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technician-updates")
@CrossOrigin
public class TechnicianUpdateController {

    @Autowired
    private TechnicianUpdateService service;

    // ✅ ADD COMMENT
    @PostMapping("/comment")
    public ResponseEntity<?> addComment(@RequestBody Map<String, String> body) {
        try {
            String ticketId = body.get("ticketId");
            String message = body.get("message");
            String technicianId = body.get("technicianId");
            String technicianName = body.get("technicianName");

            TechnicianUpdate update = service.addComment(ticketId, message, technicianId, technicianName);
            return ResponseEntity.ok(update);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ LOG STATUS CHANGE
    @PostMapping("/status-change")
    public ResponseEntity<?> logStatusChange(@RequestBody Map<String, String> body) {
        try {
            String ticketId = body.get("ticketId");
            String previousStatus = body.get("previousStatus");
            String newStatus = body.get("newStatus");
            String technicianId = body.get("technicianId");
            String technicianName = body.get("technicianName");

            TechnicianUpdate update = service.logStatusChange(ticketId, previousStatus, newStatus,
                    technicianId, technicianName);
            return ResponseEntity.ok(update);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ LOG WORK
    @PostMapping("/work-log")
    public ResponseEntity<?> logWork(@RequestBody Map<String, Object> body) {
        try {
            String ticketId = (String) body.get("ticketId");
            String workDescription = (String) body.get("workDescription");
            Long timeSpentMinutes = ((Number) body.get("timeSpentMinutes")).longValue();
            String technicianId = (String) body.get("technicianId");
            String technicianName = (String) body.get("technicianName");

            TechnicianUpdate update = service.logWork(ticketId, workDescription, timeSpentMinutes,
                    technicianId, technicianName);
            return ResponseEntity.ok(update);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ ADD NOTE
    @PostMapping("/note")
    public ResponseEntity<?> addNote(@RequestBody Map<String, String> body) {
        try {
            String ticketId = body.get("ticketId");
            String note = body.get("note");
            String technicianId = body.get("technicianId");
            String technicianName = body.get("technicianName");

            TechnicianUpdate update = service.addNote(ticketId, note, technicianId, technicianName);
            return ResponseEntity.ok(update);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ LOG ASSIGNMENT
    @PostMapping("/assignment")
    public ResponseEntity<?> logAssignment(@RequestBody Map<String, String> body) {
        try {
            String ticketId = body.get("ticketId");
            String assignedTechnicianId = body.get("assignedTechnicianId");
            String assignedTechnicianName = body.get("assignedTechnicianName");
            String adminId = body.get("adminId");
            String adminName = body.get("adminName");

            TechnicianUpdate update = service.logAssignment(ticketId, assignedTechnicianId,
                    assignedTechnicianName, adminId, adminName);
            return ResponseEntity.ok(update);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ✅ GET TICKET UPDATES (TIMELINE)
    @GetMapping("/ticket/{ticketId}")
    public List<TechnicianUpdate> getTicketUpdates(@PathVariable String ticketId) {
        return service.getTicketUpdates(ticketId);
    }

    // ✅ GET UPDATES BY TYPE
    @GetMapping("/ticket/{ticketId}/type/{type}")
    public List<TechnicianUpdate> getUpdatesByType(
            @PathVariable String ticketId,
            @PathVariable UpdateType type) {
        return service.getUpdatesByType(ticketId, type);
    }

    // ✅ GET WORK LOGS
    @GetMapping("/ticket/{ticketId}/work-logs")
    public List<TechnicianUpdate> getWorkLogs(@PathVariable String ticketId) {
        return service.getWorkLogs(ticketId);
    }

    // ✅ GET TOTAL TIME SPENT
    @GetMapping("/ticket/{ticketId}/total-time")
    public ResponseEntity<Long> getTotalTimeSpent(@PathVariable String ticketId) {
        return ResponseEntity.ok(service.getTotalTimeSpent(ticketId));
    }

    // ✅ GET COMMENTS
    @GetMapping("/ticket/{ticketId}/comments")
    public List<TechnicianUpdate> getComments(@PathVariable String ticketId) {
        return service.getComments(ticketId);
    }

    // ✅ GET UPDATES BY TECHNICIAN
    @GetMapping("/technician/{technicianId}")
    public List<TechnicianUpdate> getUpdatesByTechnician(@PathVariable String technicianId) {
        return service.getUpdatesByTechnician(technicianId);
    }

    // ✅ GET BY ID
    @GetMapping("/{updateId}")
    public ResponseEntity<?> getUpdateById(@PathVariable String updateId) {
        return service.getUpdateById(updateId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ DELETE UPDATE
    @DeleteMapping("/{updateId}")
    public ResponseEntity<?> deleteUpdate(@PathVariable String updateId) {
        try {
            service.deleteUpdate(updateId);
            return ResponseEntity.ok("Update deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
