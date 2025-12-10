package com.leeuwarden.Digital.Twin.entity;

import jakarta.persistence.*;

@Entity
public class Coordinaat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long puntId;

    @ManyToOne
    @JoinColumn(name = "gebied_id", nullable = false)
    private Gebied gebied;

    @Column(nullable = false)
    private double x;

    @Column(nullable = false)
    private double y;

    @Column(nullable = false)
    private double z;

    @Column(nullable = false)
    private int volgorde; // 0,1,2,... volgorde van de punten

    public Coordinaat() {
    }

    public Coordinaat(Gebied gebied, double x, double y, double z, int volgorde) {
        this.gebied = gebied;
        this.x = x;
        this.y = y;
        this.z = z;
        this.volgorde = volgorde;
    }

    public Long getPuntId() {
        return puntId;
    }

    public Gebied getGebied() {
        return gebied;
    }

    public void setGebied(Gebied gebied) {
        this.gebied = gebied;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getZ() {
        return z;
    }

    public void setZ(double z) {
        this.z = z;
    }

    public int getVolgorde() {
        return volgorde;
    }

    public void setVolgorde(int volgorde) {
        this.volgorde = volgorde;
    }
}
