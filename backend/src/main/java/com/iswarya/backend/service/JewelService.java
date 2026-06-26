package com.iswarya.backend.service;

import java.util.List;

import com.iswarya.backend.dto.JewelRequest;
import com.iswarya.backend.dto.JewelResponse;
import com.iswarya.backend.dto.UpdateJewelRequest;

public interface JewelService {

    JewelResponse createJewel(
            Long loanId,
            JewelRequest request);

    List<JewelResponse> getJewelsByLoan(
        Long loanId);

    JewelResponse updateJewel(
        Long loanId,
        Long jewelId,
        UpdateJewelRequest request);

    void deleteJewel(
        Long loanId,
        Long jewelId);
}