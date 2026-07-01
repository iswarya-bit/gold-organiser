package com.iswarya.backend.controller;

import com.iswarya.backend.dto.JewelRequest;
import com.iswarya.backend.dto.JewelResponse;
import com.iswarya.backend.dto.UpdateJewelRequest;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.iswarya.backend.service.JewelService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/loans/{loanId}/jewels")
@SecurityRequirement(name = "Bearer Authentication")
public class JewelController {

    private final JewelService jewelService;

    public JewelController(
            JewelService jewelService) {

        this.jewelService = jewelService;
    }

    @Operation(summary = "Create a new Jewel", description = "Creates a new jewel for the authenticated user.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Jewel created successfully"),
                        @ApiResponse(responseCode = "400", description = "Validation failed"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "404", description = "Jewel not found")
        })
    @PostMapping
    public ResponseEntity<JewelResponse> createJewel(
            @PathVariable Long loanId,
            @RequestBody JewelRequest request) {

        return ResponseEntity.ok(
                jewelService.createJewel(
                        loanId,
                        request));
    }


    @Operation(summary = "Get Jewels by Loan ID", description = "Returns a list of jewels associated with a specific loan.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Jewels retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Loan not found")
    })
    @GetMapping
    public ResponseEntity<List<JewelResponse>> getJewelsByLoan(
            @PathVariable Long loanId) {

        return ResponseEntity.ok(
                jewelService.getJewelsByLoan(
                        loanId));
    }


    @Operation(summary = "Update a Jewel", description = "Updates an existing jewel associated with a specific loan.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Jewel updated successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Jewel not found")
    })
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

    @Operation(summary = "Delete a Jewel", description = "Deletes an existing jewel associated with a specific loan.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Jewel deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "Jewel not found")
    })
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