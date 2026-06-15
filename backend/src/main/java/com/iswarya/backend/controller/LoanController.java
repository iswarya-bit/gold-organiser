package com.iswarya.backend.controller;

import com.iswarya.backend.dto.LoanRequest;
import com.iswarya.backend.dto.LoanResponse;
import com.iswarya.backend.dto.UpdateLoanRequest;
import com.iswarya.backend.entity.enums.LoanStatus;
import com.iswarya.backend.service.LoanService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(
            LoanService loanService) {

        this.loanService = loanService;
    }

    @PostMapping
    public ResponseEntity<LoanResponse> createLoan(
            @RequestBody LoanRequest request) {

        LoanResponse response = loanService.createLoan(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getLoanById(@PathVariable Long id) {

        return ResponseEntity.ok(
                loanService.getLoanById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoanResponse> updateLoan(
            @PathVariable Long id,
            @RequestBody UpdateLoanRequest request) {

        return ResponseEntity.ok(
                loanService.updateLoan(
                        id,
                        request));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<LoanResponse> closeLoan(@PathVariable Long id) {

        return ResponseEntity.ok(
                loanService.closeLoan(id));
    }

    @GetMapping
    public ResponseEntity<List<LoanResponse>> getLoans(
            @RequestParam(required = false) LoanStatus status) {

        if (status != null) {
            return ResponseEntity.ok(
                    loanService.getLoansByStatus(
                            status));
        }

        return ResponseEntity.ok(
                loanService.getMyLoans());
    }
}