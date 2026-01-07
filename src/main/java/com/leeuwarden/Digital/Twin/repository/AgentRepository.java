package com.leeuwarden.Digital.Twin.repository;

import com.leeuwarden.Digital.Twin.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentRepository extends JpaRepository<Agent, Long> {
}
