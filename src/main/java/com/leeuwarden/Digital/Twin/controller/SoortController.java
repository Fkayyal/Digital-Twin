package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.entity.Soort;
import com.leeuwarden.Digital.Twin.repository.SoortRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/soorten")
public class SoortController {

    private SoortRepository soortRepository;

    public SoortController(SoortRepository soortRepository) {
        this.soortRepository = soortRepository;
    }


    @GetMapping
    public List<Soort> getAll(){
        return soortRepository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Soort> updateSoort(@PathVariable Long id, @RequestBody Soort update){
        if (!soortRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        update.setSoortId(id);  // Zorg dat ID klopt
        Soort saved = soortRepository.save(update);
        return ResponseEntity.ok(saved);
    }
}
