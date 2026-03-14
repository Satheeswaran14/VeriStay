package com.veristay.controller;

import com.veristay.model.ContactMessage;
import com.veristay.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    // Public endpoint for anyone to submit a message
    @PostMapping("/submit")
    public ResponseEntity<?> submitMessage(@RequestBody ContactMessage contactMessage) {
        contactMessageRepository.save(contactMessage);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Your message has been sent successfully!"));
    }

    // Secure endpoint ONLY for Admins to view messages
    @GetMapping("/all")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        return ResponseEntity.ok(contactMessageRepository.findAllByOrderByCreatedAtDesc());
    }

    // NEW: Secure endpoint ONLY for Admins to delete a message
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        if (contactMessageRepository.existsById(id)) {
            contactMessageRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Message deleted"));
        }
        return ResponseEntity.status(404).body(Map.of("error", "Message not found"));
    }
}