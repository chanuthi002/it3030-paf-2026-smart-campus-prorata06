package com.paf.faculty.config;

import com.paf.faculty.repository.UserRepository;
import com.paf.faculty.security.OAuth2LoginSuccessHandler;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.*;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final UserRepository userRepository;

    public SecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // ✅ ENABLE CORS (VERY IMPORTANT)
                .cors(cors -> {
                })

                // ❌ Disable CSRF for API
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth

                        // PUBLIC
                        .requestMatchers("/", "/login", "/oauth2/**").permitAll()

                        // ✅ TEMP: allow all API (for React to work)
                        .requestMatchers("/api/**").permitAll()

                        // any other request
                        .anyRequest().authenticated())

                // ✅ Google OAuth
                .oauth2Login(oauth -> oauth
                        .successHandler(new OAuth2LoginSuccessHandler(userRepository)))

                // Optional (can remove later)
                .httpBasic();

        return http.build();
    }

    // ✅ CORS CONFIGURATION
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}