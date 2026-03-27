package com.paf.faculty.service;

import com.paf.faculty.model.Notification;
import com.paf.faculty.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    public void createNotification(String userId, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setMessage(message);
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        repo.save(n);
    }

    public List<Notification> getUserNotifications(String userId) {
        return repo.findByUserId(userId);
    }

    public void markAsRead(String notificationId) {
        Optional<Notification> notif = repo.findById(notificationId);
        if (notif.isPresent()) {
            Notification n = notif.get();
            n.setRead(true);
            repo.save(n);
        } else {
            throw new RuntimeException("Notification not found");
        }
    }

    public void deleteNotification(String notificationId) {
        repo.deleteById(notificationId);
    }

    public void clearAllNotifications(String userId) {
        List<Notification> notifications = repo.findByUserId(userId);
        repo.deleteAll(notifications);
    }
}