package com.leeuwarden.Digital.Twin.controller;

import com.leeuwarden.Digital.Twin.entity.Agent;
import com.leeuwarden.Digital.Twin.repository.AgentRepository;
import com.leeuwarden.Digital.Twin.service.OllamaService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/agents")
public class AgentController {

    @Autowired
    private AgentRepository agentRepository;

    @GetMapping
    public List<Agent> getAll(){
        return agentRepository.findAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Agent> updateAgent(@PathVariable Long id, @RequestBody Agent update){
        if (!agentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        update.setAgentId(id);  // Zorg dat ID klopt
        Agent saved = agentRepository.save(update);
        return ResponseEntity.ok(saved);
    }

    @PostMapping
    public Agent create(@RequestBody Agent agent) {
        return agentRepository.save(agent);
    }

    @Autowired
    private OllamaService ollamaService;

    @PostMapping("/analyze")  // Geen {id} meer!
    public ResponseEntity<Agent> analyze(@RequestBody Map<String, String> request) {
        String base64Image = request.get("base64Image");
        if (base64Image == null || base64Image.isEmpty()) {
            throw new RuntimeException("Geen base64Image ontvangen");
        }

        Agent agent = new Agent();
        agent.setBeschrijving("AI Quality of Life analyse - " + new Date());  // Timestamp of polygon-naam

        Agent analysis = ollamaService.analyzeImageForAgent(base64Image);
        agent.setQualityOfLifeScore(analysis.getQualityOfLifeScore());
        agent.setJustification(analysis.getJustification());

        Agent saved = agentRepository.save(agent);  // INSERT nieuw record!
        return ResponseEntity.ok(saved);
    }


    @GetMapping("/{id}")
    public Agent getAgent(@PathVariable Long id) {
        return agentRepository.findById(id).orElse(null);
    }


}