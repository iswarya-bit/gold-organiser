package com.iswarya.backend.controller;

import com.iswarya.backend.dto.LoanRequest;
import com.iswarya.backend.dto.LoanResponse;
import com.iswarya.backend.dto.RenewLoanRequest;
import com.iswarya.backend.dto.UpdateLoanRequest;
import com.iswarya.backend.entity.enums.LoanStatus;
import com.iswarya.backend.service.LoanService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
@SecurityRequirement(name = "Bearer Authentication")
public class LoanController {

        private final LoanService loanService;

        public LoanController(
                        LoanService loanService) {

                this.loanService = loanService;
        }


        
        @Operation(summary = "Create a new loan", description = "Creates a new gold loan for the authenticated user.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Loan created successfully"),
                        @ApiResponse(responseCode = "400", description = "Validation failed"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "404", description = "User not found")
        })
        @PostMapping
        public ResponseEntity<LoanResponse> createLoan(
                        @Valid @RequestBody LoanRequest request) {

                LoanResponse response = loanService.createLoan(request);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(response);
        }



        @Operation(summary = "Get loan by ID", description = "Returns a specific loan of the authenticated user.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Loan retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "404", description = "Loan not found")
        })
        @GetMapping("/{id}")
        public ResponseEntity<LoanResponse> getLoanById(@Valid @PathVariable Long id) {

                return ResponseEntity.ok(
                                loanService.getLoanById(id));
        }



        @Operation(summary = "Update loan", description = "Updates loan details.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Loan updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Validation failed"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "404", description = "Loan not found")
        })
        @PutMapping("/{id}")
        public ResponseEntity<LoanResponse> updateLoan(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateLoanRequest request) {

                return ResponseEntity.ok(
                                loanService.updateLoan(
                                                id,
                                                request));
        }



        @Operation(summary = "Close loan", description = "Marks a loan as closed.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Loan closed successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "404", description = "Loan not found")
        })
        @PatchMapping("/{id}/close")
        public ResponseEntity<LoanResponse> closeLoan(@Valid @PathVariable Long id) {

                return ResponseEntity.ok(
                                loanService.closeLoan(id));
        }



        @Operation(summary = "Get all loans", description = "Returns all loans belonging to the authenticated user.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Loans retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping
        public ResponseEntity<List<LoanResponse>> getLoans(
                        @Valid @RequestParam(required = false) LoanStatus status) {

                if (status != null) {
                        return ResponseEntity.ok(
                                        loanService.getLoansByStatus(
                                                        status));
                }

                return ResponseEntity.ok(
                                loanService.getMyLoans());
        }



        @Operation(summary = "Renew loan", description = "Extends the due date of an active loan.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Loan renewed successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid renewal request"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "404", description = "Loan not found")
        })
        @PatchMapping("/{id}/renew")
        public ResponseEntity<LoanResponse> renewLoan(
                        @PathVariable Long id,
                        @Valid @RequestBody RenewLoanRequest request) {

                return ResponseEntity.ok(
                                loanService.renewLoan(
                                                id,
                                                request));
        }



        @Operation(summary = "Filter loans by status", description = "Returns loans filtered by their status.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Loans retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized")
        })
        @GetMapping("/status/{status}")
        public ResponseEntity<List<LoanResponse>> getLoansByStatus(
                        @Valid @PathVariable LoanStatus status) {

                return ResponseEntity.ok(
                                loanService.getLoansByStatus(status));
        }
}