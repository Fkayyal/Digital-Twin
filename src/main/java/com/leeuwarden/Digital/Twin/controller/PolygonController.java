package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.DTO.PolygonRequestDTO;
import com.leeuwarden.Digital.Twin.entity.Polygon;
import com.leeuwarden.Digital.Twin.mapper.PolygonMapper;
import com.leeuwarden.Digital.Twin.repository.PolygonRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

//Dit is de API‑laag.
//Het zegt: “als er een POST naar /api/polygons komt met een PolygonRequest,
// dan maak ik een Polygon aan en sla ik die via PolygonRepository op in de database”.
@RestController
@RequestMapping("/polygons")
@CrossOrigin(origins = "http://localhost:63342")
public class PolygonController {
    // Dependancy injection
    private final PolygonRepository polygonRepository;
    private final PolygonMapper polygonMapper;

    public PolygonController(PolygonRepository polygonRepository, PolygonMapper polygonMapper) {
        this.polygonRepository = polygonRepository;
        this.polygonMapper = polygonMapper;
    }


    @PostMapping
    public Polygon createPolygon(@RequestBody PolygonRequestDTO polygonRequestDTO) {
        // Zet de data uit de request (DTO) om naar een Polygon entity
        System.out.println("soortId = " + polygonRequestDTO.getSoortId());
        Polygon polygon = polygonMapper.toEntity(polygonRequestDTO);
        return polygonRepository.save(polygon);
    }

    @DeleteMapping("/{id}")
    public void deletePolygon(@PathVariable Long id) {
        polygonRepository.deleteById(id);
    }

    @GetMapping
    public List<Polygon> getPolygons() {
        return polygonRepository.findAll();
    }
    @PutMapping("/{id}")
    public Polygon updateHeight(@PathVariable Long id, @RequestBody Map<String, Double> update) {
        Polygon polygon = polygonRepository.findById(id).orElseThrow();
        polygon.setHoogte(update.get("hoogte"));
        return polygonRepository.save(polygon);
    }

    @GetMapping("/{id}")
    public Polygon getPolygon(@PathVariable Long id) {
        return polygonRepository.findById(id).orElseThrow();
    }


}
