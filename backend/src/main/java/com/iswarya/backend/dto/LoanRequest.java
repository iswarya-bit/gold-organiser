package com.iswarya.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoanRequest {

    private String bankName;

    private String branchName;

    private BigDecimal loanAmount;

    private BigDecimal interestRate;

    private LocalDate pledgeDate;

    private LocalDate dueDate;
}