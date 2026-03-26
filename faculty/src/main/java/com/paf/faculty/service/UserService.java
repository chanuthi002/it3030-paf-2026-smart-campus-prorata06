package com.paf.faculty.service;

import com.paf.faculty.model.User;
import com.paf.faculty.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateRole(String userId, String role) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setRole(Enum.valueOf(com.paf.faculty.model.Role.class, role));
        return userRepository.save(user);
    }
}