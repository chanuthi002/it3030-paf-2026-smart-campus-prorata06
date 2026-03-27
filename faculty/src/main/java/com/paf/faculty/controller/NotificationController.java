package com.paf.faculty.controller;

import com.paf.faculty.service.NotificationService;
import com.paf.faculty.model.Notification;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public List<Notification> getNotifications(@PathVariable String userId) {
        return service.getUserNotifications(userId);
    }

    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(@PathVariable String userId) {
        List<Notification> notifications = service.getUserNotifications(userId);
        long unreadCount = notifications.stream().filter(n -> !n.isRead()).count();
        return ResponseEntity.ok(Map.of("unreadCount", (int) unreadCount));
    }

    @PutMapping("/{notificationId}/mark-as-read")
    public ResponseEntity<String> markAsRead(@PathVariable String notificationId) {
        try {
            service.markAsRead(notificationId);
            return ResponseEntity.ok("✅ Notification marked as read");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(@PathVariable String notificationId) {
        try {
            service.deleteNotification(notificationId);
            return ResponseEntity.ok("✅ Notification deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}/clear-all")
    public ResponseEntity<String> clearAllNotifications(@PathVariable String userId) {
        try {
            service.clearAllNotifications(userId);
            return ResponseEntity.ok("✅ All notifications cleared");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error: " + e.getMessage());
        }
    }
}