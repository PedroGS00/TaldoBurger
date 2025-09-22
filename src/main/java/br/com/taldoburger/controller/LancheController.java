package br.com.taldoburger.controller;

import br.com.taldoburger.model.Lanche;
import br.com.taldoburger.service.LancheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/lanches")
public class LancheController {

    @Autowired
    private LancheService lancheService;

    @PostMapping
    public ResponseEntity<Lanche> createLanche(@RequestBody Lanche lanche) {
        Lanche newLanche = lancheService.saveLanche(lanche);
        return new ResponseEntity<>(newLanche, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Lanche>> getAllLanches(){
        List<Lanche> lanche = lancheService.findAllLanches();
        return new ResponseEntity<>(lanche, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lanche> getLancheById(@PathVariable Long id) {
        Optional<Lanche> lanche = lancheService.findLancheById(id);
        return lanche.map(value -> new ResponseEntity<>(value, HttpStatus.OK)).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lanche> updateLanche(@PathVariable Long id, @RequestBody Lanche lanche) {
        Optional<Lanche> existingLanche = lancheService.findLancheById(id);
        if (existingLanche.isPresent()) {
            Lanche lancheToUpdate = existingLanche.get();
            lancheToUpdate.setNome(lanche.getNome());
            lancheToUpdate.setDescricao(lanche.getDescricao());
            lancheToUpdate.setPreco(lanche.getPreco());
            lancheToUpdate.setEstoque(lanche.getEstoque());

            Lanche updatedLanche = lancheService.saveLanche(lancheToUpdate);
            return new ResponseEntity<>(updatedLanche, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLanche(@PathVariable Long id) {
        lancheService.deleteLanche(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
