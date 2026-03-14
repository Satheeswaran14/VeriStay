package com.veristay.controller;

import com.veristay.config.JwtUtil;
import com.veristay.model.Admin;
import com.veristay.model.User;
import com.veristay.repository.AdminRepository;
import com.veristay.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired private UserRepository userRepository;
    @Autowired private AdminRepository adminRepository; // NEW Admin Table
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // Prevent registering an email that exists in EITHER table
        if (userRepository.findByEmail(user.getEmail()).isPresent() || adminRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already taken!"));
        }
        
        // Force public registrations to never be admins.
        if ("ROLE_ADMIN".equals(user.getRole())) {
             user.setRole("ROLE_USER"); 
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        // 1. Check Standard Users Table
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
                user.setPassword(null); 
                return ResponseEntity.ok(Map.of("token", token, "user", user));
            }
        } 
        // 2. Check Admins Table
        else {
            Optional<Admin> adminOptional = adminRepository.findByEmail(loginRequest.getEmail());
            if (adminOptional.isPresent()) {
                Admin admin = adminOptional.get();
                if (passwordEncoder.matches(loginRequest.getPassword(), admin.getPassword())) {
                    String token = jwtUtil.generateToken(admin.getEmail(), admin.getRole());
                    admin.setPassword(null);
                    return ResponseEntity.ok(Map.of("token", token, "user", admin));
                }
            }
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password"));
    }
}