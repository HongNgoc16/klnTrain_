package com.klntrain.controller;

import com.klntrain.dto.response.ApiResponse;
import com.klntrain.service.TrainService;
import com.klntrain.util.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trains")
@RequiredArgsConstructor
public class TrainController {

    private final TrainService trainService;

    @GetMapping("/stations")
    public ResponseEntity<ApiResponse<?>> getAllStations() {
        return ResponseEntity.ok(ApiResponse.ok(trainService.getAllStations()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<?>> searchTrains(
        @RequestParam Long gaDi,
        @RequestParam Long gaDen,
        @RequestParam String ngayChay
    ) {
        if (gaDi == null || gaDen == null || ngayChay == null || ngayChay.isBlank()) {
            throw AppException.badRequest("Thiếu tham số: gaDi, gaDen, ngayChay");
        }
        var results = trainService.searchTrains(gaDi, gaDen, ngayChay);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/{idChuyen}/seats/{soToa}")
    public ResponseEntity<ApiResponse<?>> getSeatMap(
        @PathVariable Long idChuyen,
        @PathVariable Integer soToa,
        @RequestParam(required = false) Long idGaLen,
        @RequestParam(required = false) Long idGaXuong
    ) {
        var result = trainService.getSeatMap(idChuyen, soToa, idGaLen, idGaXuong);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
