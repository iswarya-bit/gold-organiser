package com.iswarya.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.iswarya.backend.entity.enums.LoanStatus;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanResponse {

    private Long id;

    private String bankName;

    private String branchName;

    private BigDecimal loanAmount;

    private BigDecimal interestRate;

    private LocalDate pledgeDate;

    private LocalDate dueDate;

    private LoanStatus status;
}