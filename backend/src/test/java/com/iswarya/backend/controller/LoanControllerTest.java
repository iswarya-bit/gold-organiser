package com.iswarya.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.iswarya.backend.dto.LoanRequest;
import com.iswarya.backend.dto.LoanResponse;
import com.iswarya.backend.entity.enums.LoanStatus;
import com.iswarya.backend.service.LoanService;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import com.iswarya.backend.security.JwtAuthenticationFilter;
import com.iswarya.backend.service.CustomUserDetailsService;
import com.iswarya.backend.service.JwtService;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

@WebMvcTest(LoanController.class)
@AutoConfigureMockMvc(addFilters = false)
class LoanControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private LoanService loanService;

        @MockitoBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private CustomUserDetailsService customUserDetailsService;

        @Autowired
        private ObjectMapper objectMapper;

        @Test
        void getLoanById_ShouldReturnLoan() throws Exception {

                LoanResponse response = LoanResponse.builder()
                                .id(1L)
                                .bankName("SBI")
                                .loanAmount(new BigDecimal("500000"))
                                .status(LoanStatus.ACTIVE)
                                .build();

                when(loanService.getLoanById(1L))
                                .thenReturn(response);

                mockMvc.perform(get("/api/loans/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.bankName").value("SBI"))
                                .andExpect(jsonPath("$.loanAmount").value(500000))
                                .andExpect(jsonPath("$.status").value("ACTIVE"));
        }

        @Test
        void createLoan_ShouldReturnCreatedLoan() throws Exception {

                LoanRequest request = new LoanRequest();
                request.setBankName("SBI");
                request.setBranchName("Chennai");
                request.setLoanAmount(new BigDecimal("500000"));
                request.setInterestRate(new BigDecimal("8.5"));
                request.setPledgeDate(java.time.LocalDate.now());
                request.setDueDate(java.time.LocalDate.now().plusMonths(12));

                LoanResponse response = LoanResponse.builder()
                                .id(1L)
                                .bankName("SBI")
                                .branchName("Chennai")
                                .loanAmount(new BigDecimal("500000"))
                                .interestRate(new BigDecimal("8.5"))
                                .pledgeDate(LocalDate.now())
                                .dueDate(LocalDate.now().plusMonths(12))
                                .status(LoanStatus.ACTIVE)
                                .build();

                when(loanService.createLoan(any(LoanRequest.class)))
                                .thenReturn(response);

                mockMvc.perform(post("/api/loans")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(1))
                                .andExpect(jsonPath("$.bankName").value("SBI"))
                                .andExpect(jsonPath("$.branchName").value("Chennai"))
                                .andExpect(jsonPath("$.loanAmount").value(500000))
                                .andExpect(jsonPath("$.interestRate").value(8.5))
                                .andExpect(jsonPath("$.status").value("ACTIVE"));
        }
}