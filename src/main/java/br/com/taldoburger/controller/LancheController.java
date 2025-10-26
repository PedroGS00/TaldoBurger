package br.com.taldoburger.controller;

import br.com.taldoburger.dto.LancheResponseDTO; 
import br.com.taldoburger.model.Lanche;
import br.com.taldoburger.service.LancheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile; 
import java.util.*;


@RestController
@RequestMapping("/lanches")
public class LancheController {

    @Autowired
    private LancheService lancheService;

    @PostMapping
    public ResponseEntity<LancheResponseDTO> createLanche(@RequestParam("file") MultipartFile file,
            @RequestParam("nome") String nome,
            @RequestParam("descricao") String descricao,
            @RequestParam("preco") Double preco,
            @RequestParam("estoque") Integer estoque) {

        LancheResponseDTO newLanche = lancheService.saveImg(file, nome, descricao, preco, estoque);
        return new ResponseEntity<>(newLanche, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LancheResponseDTO>> getAllLanches(){
        List<LancheResponseDTO> lanche = lancheService.findAllLanches();
        return new ResponseEntity<>(lanche, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lanche> getLancheById(@PathVariable Long id) {
        Optional<Lanche> lanche = lancheService.findLancheById(id);
        return lanche.map(value -> new ResponseEntity<>(value, HttpStatus.OK)).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LancheResponseDTO> updateLanche(@PathVariable Long id, 
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("nome") String nome,
            @RequestParam("descricao") String descricao,
            @RequestParam("preco") Double preco,
            @RequestParam("estoque") Integer estoque) {
        
        try {
            LancheResponseDTO updatedLanche = lancheService.updateLancheWithImage(id, file, nome, descricao, preco, estoque);
            return new ResponseEntity<>(updatedLanche, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLanche(@PathVariable Long id) {
        lancheService.deleteLanche(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
