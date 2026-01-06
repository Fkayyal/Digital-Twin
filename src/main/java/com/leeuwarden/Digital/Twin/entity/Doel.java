package com.leeuwarden.Digital.Twin.entity;

import jakarta.persistence.*;

@Entity
public class Doel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long doelId;

    @Column(nullable = false)
    private String Omschrijving;

    @Column(nullable = false)
    private int Aantal;

    public Long getDoelId() {
        return doelId;
    }

    public void setDoelId(Long id) {
        this.doelId = id;
    }

    public String getOmschrijving() {
        return Omschrijving;
    }

    public void setOmschrijving(String omschrijving) {
        this.Omschrijving = omschrijving;
    }

    public int getAantal() {
        return Aantal;
    }

    public void setAantal(int aantal) {
        this.Aantal = aantal;
    }
}
