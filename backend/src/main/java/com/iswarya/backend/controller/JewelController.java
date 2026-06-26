package com.iswarya.backend.controller;

import com.iswarya.backend.dto.JewelRequest;
import com.iswarya.backend.dto.JewelResponse;
import com.iswarya.backend.dto.UpdateJewelRequest;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.iswarya.backend.service.JewelService;

@RestController
@RequestMapping("/api/loans/{loanId}/jewels")
public class JewelController {

    private final JewelService jewelService;

    public JewelController(
            JewelService jewelService) {

        this.jewelService = jewelService;
    }

    @PostMapping
    public ResponseEntity<JewelResponse> createJewel(
            @PathVariable Long loanId,
            @RequestBody JewelRequest request) {

        return ResponseEntity.ok(
                jewelService.createJewel(
                        loanId,
                        request));
    }

    @GetMapping
    public ResponseEntity<List<JewelResponse>> getJewelsByLoan(
            @PathVariable Long loanId) {

        return ResponseEntity.ok(
                jewelService.getJewelsByLoan(
                        loanId));
    }

    @PutMapping("/{jewelId}")
    public ResponseEntity<JewelResponse> updateJewel(
            @PathVariable Long loanId,
            @PathVariable Long jewelId,
            @RequestBody UpdateJewelRequest request) {

        return ResponseEntity.ok(
                jewelService.updateJewel(
                        loanId,
                        jewelId,
                        request));
    }

    @DeleteMapping("/{jewelId}")
    public ResponseEntity<String> deleteJewel(
            @PathVariable Long loanId,
            @PathVariable Long jewelId) {

        jewelService.deleteJewel(
                loanId,
                jewelId);

        return ResponseEntity.ok(
                "Jewel deleted successfully");
    }
}