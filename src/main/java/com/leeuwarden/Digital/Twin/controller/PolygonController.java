package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.DTO.PolygonRequestDTO;
import com.leeuwarden.Digital.Twin.DTO.PolygonStatsDTO;
import com.leeuwarden.Digital.Twin.entity.Polygon;
import com.leeuwarden.Digital.Twin.mapper.PolygonMapper;
import com.leeuwarden.Digital.Twin.repository.PolygonRepository;
import com.leeuwarden.Digital.Twin.service.PolygonStatisticsService;
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
    private final PolygonStatisticsService polygonStatisticsService;

    public PolygonController(PolygonRepository polygonRepository, PolygonMapper polygonMapper, PolygonStatisticsService polygonStatisticsService) {
        this.polygonRepository = polygonRepository;
        this.polygonMapper = polygonMapper;
        this.polygonStatisticsService = polygonStatisticsService;
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
    public Polygon updatePolygon(@PathVariable Long id, @RequestBody PolygonRequestDTO updateDto) {
        Polygon polygon = polygonRepository.findById(id).orElseThrow();
        polygonMapper.updateEntityFromDto(updateDto, polygon);
        return polygonRepository.save(polygon);
    }
    @GetMapping("/{id}")
    public Polygon getPolygon(@PathVariable Long id) {
        return polygonRepository.findById(id).orElseThrow();
    }

    @GetMapping("/{id}/stats")
    public PolygonStatsDTO getPolygonStats(@PathVariable Long id) {
        Polygon polygon = polygonRepository.findById(id).orElseThrow();
        return polygonStatisticsService.calculate(polygon);
    }

    @GetMapping("/stats")
    public PolygonStatsDTO getAllPolygonStats() {
        var polygons = polygonRepository.findAll();

        double totaleEenheden = 0;
        double totaleKosten = 0;
        double totaleOpbrengst = 0;
        double totaleMensen = 0;
        double totaleLeefbaarheid = 0;

        for (Polygon p : polygons) {
            PolygonStatsDTO s = polygonStatisticsService.calculate(p);
            totaleEenheden += s.getAantalEenheden();
            totaleKosten += s.getTotaleKosten();
            totaleOpbrengst += s.getTotaleOpbrengst();
            totaleMensen += s.getAantalMensen();
            totaleLeefbaarheid += s.getLeefbaarheidPunten();
        }

        double gemiddeldeLeefbaarheid = 0.0;
        if (totaleEenheden > 0) {
            gemiddeldeLeefbaarheid = totaleLeefbaarheid / totaleEenheden;
        }

        PolygonStatsDTO dto = new PolygonStatsDTO();
        dto.setPolygonId(null); // niet relevant voor totaal
        dto.setAantalEenheden(totaleEenheden);
        dto.setTotaleKosten(totaleKosten);
        dto.setTotaleOpbrengst(totaleOpbrengst);
        dto.setAantalMensen(totaleMensen);
        dto.setLeefbaarheidPunten(gemiddeldeLeefbaarheid);
        return dto;
    }
}

