package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.DTO.PolygonRequestDTO;
import com.leeuwarden.Digital.Twin.entity.Polygon;
import com.leeuwarden.Digital.Twin.repository.PolygonRepository;
import org.springframework.web.bind.annotation.*;

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

        return polygonRepository.save(polygon);
    }

}
