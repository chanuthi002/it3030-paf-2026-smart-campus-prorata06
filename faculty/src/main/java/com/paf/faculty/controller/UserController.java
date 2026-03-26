package com.paf.faculty.controller;

import com.paf.faculty.model.User;
import com.paf.faculty.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping
    public List<User> getUsers() {
        return userService.getAllUsers();
    }

    @PutMapping("/{id}/role")
    public User updateRole(@PathVariable String id, @RequestParam String role) {
        return userService.updateRole(id, role);
    }
}