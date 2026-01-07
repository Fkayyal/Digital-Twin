package com.leeuwarden.Digital.Twin.entity;

import jakarta.persistence.*;

@Entity
public class Agent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long agentId;

    @Column(name = "beschrijving", nullable = false)
    private String beschrijving;

    @Column(name = "quality_of_life_score")
    private Integer qualityOfLifeScore;

    @Column(name = "justification", columnDefinition = "TEXT")
    private String justification;

    // Default constructor
    public Agent() {}

    // Getters/Setters
    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public String getBeschrijving() { return beschrijving; }
    public void setBeschrijving(String beschrijving) { this.beschrijving = beschrijving; }

    public Integer getQualityOfLifeScore() { return qualityOfLifeScore; }
    public void setQualityOfLifeScore(Integer qualityOfLifeScore) { this.qualityOfLifeScore = qualityOfLifeScore; }

    public String getJustification() { return justification; }
    public void setJustification(String justification) { this.justification = justification; }
}

