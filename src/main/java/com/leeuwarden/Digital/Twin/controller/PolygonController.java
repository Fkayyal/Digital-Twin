package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.DTO.PolygonRequestDTO;
import com.leeuwarden.Digital.Twin.entity.Polygon;
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

    public PolygonController(PolygonRepository polygonRepository) {
        this.polygonRepository = polygonRepository;
    }

    // dit is eigenlijk een soort van mapper, die DTO omzet naar Entity.
    // DTO --> Entity
    @PostMapping
    public Polygon createPolygon(@RequestBody PolygonRequestDTO polygonRequestDTO) {
        Polygon polygon = new Polygon();
        polygon.setPointsJson(polygonRequestDTO.getPointsJson());
        polygon.setOppervlakte(polygonRequestDTO.getOppervlakte());
        polygon.setHoogte(polygonRequestDTO.getHoogte());

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

}
