package com.paf.faculty.security;

import com.paf.faculty.model.Role;
import com.paf.faculty.model.User;
import com.paf.faculty.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    public OAuth2LoginSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication)
            throws IOException, ServletException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        // 🔍 Check if user exists
        Optional<User> existingUser = userRepository.findByEmail(email);

        User user;

        if (existingUser.isEmpty()) {
            // 🆕 Create new user
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole(Role.USER); // default role
            user = userRepository.save(user);
        } else {
            user = existingUser.get();
        }

        // ✅ Encode values (VERY IMPORTANT)
        String encodedEmail = URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8);
        String encodedName = URLEncoder.encode(user.getName(), StandardCharsets.UTF_8);
        String encodedRole = URLEncoder.encode(user.getRole().name(), StandardCharsets.UTF_8);
        String encodedId = URLEncoder.encode(user.getId(), StandardCharsets.UTF_8);

        // 🔥 Redirect with FULL USER DATA
        String redirectUrl = "http://localhost:3000/dashboard"
                + "?email=" + encodedEmail
                + "&name=" + encodedName
                + "&role=" + encodedRole
                + "&id=" + encodedId;

        response.sendRedirect(redirectUrl);
    }
}