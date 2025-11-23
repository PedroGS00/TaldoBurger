package br.com.taldoburger.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
public class PedidoController {

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> order) {
        String orderId = UUID.randomUUID().toString();
        return new ResponseEntity<>(Map.of("orderId", orderId, "status", "CONFIRMADO"), HttpStatus.CREATED);
    }
}

