package com.iswarya.backend.controller;

import com.iswarya.backend.dto.JewelRequest;
import com.iswarya.backend.dto.JewelResponse;
import com.iswarya.backend.dto.UpdateJewelRequest;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.iswarya.backend.service.JewelService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/loans/{loanId}/jewels")
@SecurityRequirement(name = "Bearer Authentication")
public class JewelController {

        private final JewelService jewelService;

        private final ObjectMapper objectMapper;

        public JewelController(
                        JewelService jewelService, ObjectMapper objectMapper) {

                this.jewelService = jewelService;
                this.objectMapper = objectMapper;
        }

        @Operation(summary = "Create a new Jewel", description = "Creates a new jewel for the authenticated user.")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Jewel created successfully"),
                        @ApiResponse(responseCode = "400", description = "Validation failed"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "404", description = "Jewel not found")
        })

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<JewelResponse> createJewel(
                        @PathVariable Long loanId,

                        @RequestPart("jewel") String jewelJson,

                        @RequestPart(value = "images", required = false) List<MultipartFile> images) {

                JewelRequest request;

                try {
                        request = objectMapper.readValue(
                                        jewelJson,
                                        JewelRequest.class);
                } catch (Exception e) {
                        throw new RuntimeException("Invalid jewel JSON", e);
                }

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(
                                                jewelService.createJewel(
                                                                loanId,
                                                                request,
                                                                images));
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

        @Operation(summary = "Get Jewel by ID", description = "Returns a specific jewel associated with a specific loan.")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Jewel retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized"),
                        @ApiResponse(responseCode = "404", description = "Jewel not found")
        })
        @GetMapping("/{jewelId}")
        public ResponseEntity<JewelResponse> getJewelById(
                        @PathVariable Long loanId,
                        @PathVariable Long jewelId) {

                return ResponseEntity.ok(
                                jewelService.getJewelById(
                                                loanId,
                                                jewelId));
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