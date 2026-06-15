package com.iswarya.backend.service;

import com.iswarya.backend.dto.LoanRequest;
import com.iswarya.backend.dto.LoanResponse;
import com.iswarya.backend.dto.UpdateLoanRequest;
import com.iswarya.backend.entity.enums.LoanStatus;

import java.util.List;

public interface LoanService {

    LoanResponse createLoan(
            LoanRequest request);

    List<LoanResponse> getMyLoans();

    LoanResponse getLoanById(Long id);

    LoanResponse updateLoan(
        Long id,
        UpdateLoanRequest request);

    LoanResponse closeLoan(Long id);

    List<LoanResponse> getLoansByStatus(
        LoanStatus status);
}