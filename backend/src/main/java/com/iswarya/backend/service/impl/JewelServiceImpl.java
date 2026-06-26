package com.iswarya.backend.service.impl;

import org.springframework.security.core.context.SecurityContextHolder;

import com.iswarya.backend.dto.JewelRequest;
import com.iswarya.backend.dto.JewelResponse;
import com.iswarya.backend.dto.UpdateJewelRequest;
import com.iswarya.backend.entity.Jewel;
import com.iswarya.backend.entity.Loan;
import com.iswarya.backend.exception.LoanNotFoundException;
import com.iswarya.backend.exception.UserNotFoundException;
import com.iswarya.backend.repository.JewelRepository;
import com.iswarya.backend.repository.LoanRepository;
import com.iswarya.backend.repository.UserRepository;
import com.iswarya.backend.service.JewelService;

import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.security.core.Authentication;

import com.iswarya.backend.entity.User;

@Service
public class JewelServiceImpl implements JewelService {

    private final JewelRepository jewelRepository;
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;

    public JewelServiceImpl(
            JewelRepository jewelRepository,
            LoanRepository loanRepository,
            UserRepository userRepository) {

        this.jewelRepository = jewelRepository;
        this.loanRepository = loanRepository;
        this.userRepository = userRepository;
    }

    private JewelResponse mapToResponse(
            Jewel jewel) {

        return JewelResponse.builder()
                .id(jewel.getId())
                .jewelType(jewel.getJewelType())
                .weight(jewel.getWeight())
                .quantity(jewel.getQuantity())
                .description(jewel.getDescription())
                .build();
    }

    @Override
    public JewelResponse createJewel(
            Long loanId,
            JewelRequest request) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found"));

        Loan loan = loanRepository
                .findByIdAndUser(
                        loanId,
                        user)
                .orElseThrow(() -> new LoanNotFoundException(
                        "Loan not found"));

        Jewel jewel = Jewel.builder()
                .jewelType(
                        request.getJewelType())
                .weight(
                        request.getWeight())
                .quantity(
                        request.getQuantity())
                .description(
                        request.getDescription())
                .loan(loan)
                .build();

        Jewel savedJewel = jewelRepository.save(jewel);

        return mapToResponse(savedJewel);
    }

    @Override
    public List<JewelResponse> getJewelsByLoan(
            Long loanId) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found"));

        Loan loan = loanRepository
                .findByIdAndUser(
                        loanId,
                        user)
                .orElseThrow(() -> new LoanNotFoundException(
                        "Loan not found"));

        List<Jewel> jewels = jewelRepository.findByLoan(loan);

        return jewels.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public JewelResponse updateJewel(
            Long loanId,
            Long jewelId,
            UpdateJewelRequest request) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found"));

        Loan loan = loanRepository
                .findByIdAndUser(
                        loanId,
                        user)
                .orElseThrow(() -> new LoanNotFoundException(
                        "Loan not found"));

        Jewel jewel = jewelRepository
                .findByIdAndLoan(
                        jewelId,
                        loan)
                .orElseThrow(() -> new RuntimeException(
                        "Jewel not found"));

        if (request.getJewelType() != null) {
            jewel.setJewelType(
                    request.getJewelType());
        }

        if (request.getWeight() != null) {
            jewel.setWeight(
                    request.getWeight());
        }

        if (request.getQuantity() != null) {
            jewel.setQuantity(
                    request.getQuantity());
        }

        if (request.getDescription() != null) {
            jewel.setDescription(
                    request.getDescription());
        }

        Jewel updatedJewel = jewelRepository.save(jewel);

        return mapToResponse(updatedJewel);
    }

    @Override
    public void deleteJewel(
            Long loanId,
            Long jewelId) {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found"));

        Loan loan = loanRepository
                .findByIdAndUser(
                        loanId,
                        user)
                .orElseThrow(() -> new LoanNotFoundException(
                        "Loan not found"));

        Jewel jewel = jewelRepository
                .findByIdAndLoan(
                        jewelId,
                        loan)
                .orElseThrow(() -> new RuntimeException(
                        "Jewel not found"));

        jewelRepository.delete(jewel);
    }

}
