package com.iswarya.backend.entity;

import com.iswarya.backend.entity.enums.LoanStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "loans")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String bankName;

    private String branchName;

    private BigDecimal loanAmount;

    private BigDecimal interestRate;

    private LocalDate pledgeDate;

    private LocalDate dueDate;

    private LocalDate renewalDate;

    private LocalDate closedDate;

    @Enumerated(EnumType.STRING)
    private LoanStatus status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}