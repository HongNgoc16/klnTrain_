package com.klntrain.controller;

import com.klntrain.dto.request.CancelRequest;
import com.klntrain.dto.response.ApiResponse;
import com.klntrain.service.CancelService;
import com.klntrain.util.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cancel")
@RequiredArgsConstructor
public class CancelController {

    private final CancelService cancelService;

    @GetMapping("/fee/{idVe}")
    public ResponseEntity<ApiResponse<?>> getCancelFee(@PathVariable Long idVe) {
        var result = cancelService.tinhPhiHuy(idVe);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> cancelTickets(@RequestBody CancelRequest req) {
        if (req.getMaDatCho() == null || req.getIdVeList() == null || req.getIdVeList().isEmpty()) {
            throw AppException.badRequest("Thiếu maDatCho hoặc danh sách vé");
        }
        var result = cancelService.cancelTickets(req.getMaDatCho(), req.getIdVeList(), req.getLyDo());
        return ResponseEntity.ok(ApiResponse.ok(result,
            "Hủy " + result.get("soVeHuy") + " vé thành công"));
    }
}
