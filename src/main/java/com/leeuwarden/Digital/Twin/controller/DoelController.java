package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.entity.Doel;
import com.leeuwarden.Digital.Twin.repository.DoelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doelen")
public class DoelController {

    @Autowired
    private DoelRepository doelRepository;

    @GetMapping
    public List<Doel> getAll(){
        return doelRepository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doel> updateDoel(@PathVariable Long id, @RequestBody Doel update){
        if (!doelRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        update.setDoelId(id);  // Zorg dat ID klopt
        Doel saved = doelRepository.save(update);
        return ResponseEntity.ok(saved);
    }
}
