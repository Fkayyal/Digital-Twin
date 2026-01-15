package com.leeuwarden.Digital.Twin.service;

import com.fasterxml.jackson.core.json.JsonReadFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leeuwarden.Digital.Twin.entity.Agent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import java.util.List;
import java.util.Map;

@Service
public class OllamaService {
    private final WebClient webClient;

    public OllamaService(@Value("${OLLAMA_giURL:http://localhost:11434}") String ollamaUrl) {
        this.webClient = WebClient.create(ollamaUrl);
    }

    public String analyzeImage(String base64Image) {
        String prompt = """
You are an expert visual analyst tasked with estimating historical or contemporary quality of life for a real-world urban location using only a single image.
The image is a 3D first-person view of part of a city. Do not ask for any additional information; base all judgments solely on visual evidence in the image.
Provide a single numeric Quality of Life (QoL) score from 0 to 100 (0 = extremely poor, 100 = excellent) and a concise written justification
(3 short paragraphs) explaining the factors used to determine the score.
Required output: JSON with exactly two fields: "quality_of_life_score": integer between 0 and 100, and "justification": string (max ~300 characters)
that links visible cues to QoL factors. Guidelines for the justification: Cite specific visual cues from the image and map each cue to the
aspect of quality of life it implies (examples: housing condition, sanitation, safety, access to services, green space, noise/traffic, walkability,
economic activity, social cohesion). When making assumptions, label them clearly as
"Assumption:" and explain why the assumption is reasonable from the image. If a major QoL factor is ambiguous,
mark it as "Uncertain:" and describe two plausible visual interpretations and how each would change the score.
Do not invent non-visual facts (no population numbers, no local policies, no unseen climate data).
Keep the justification factual, evidence-based, and succinct. Do not include any additional fields, metadata, or commentary outside the two required JSON fields.
""";

        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> request = Map.of(
                "model", "llava:7b",
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", prompt,
                        "images", List.of(base64Image)
                )),
                "stream", false,
                "options", Map.of("temperature", 0.1)
        );

        return webClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    public Agent analyzeImageForAgent(String base64Image) {
        String response = analyzeImage(base64Image);
        Agent agent = new Agent();
        ObjectMapper mapper = new ObjectMapper();

        //Sta unescaped control chars toe
        mapper.configure(JsonReadFeature.ALLOW_UNESCAPED_CONTROL_CHARS.mappedFeature(), true);

        try {
            JsonNode root = mapper.readTree(response);
            JsonNode contentNode = root.path("message").path("content");

            String content = contentNode.asText();

            content = content.replaceAll("```json\\s*", "")
                    .replaceAll("\\s*```\\s*$", "")
                    .trim()
                    .replace("\\\\n", "\n")
                    .replace("\\\\r", "");

            JsonNode innerJson = mapper.readTree(content);
            agent.setQualityOfLifeScore(innerJson.path("quality_of_life_score").asInt(0));
            agent.setJustification(innerJson.path("justification").asText("Geen analyse"));
        } catch (Exception e) {
            agent.setQualityOfLifeScore(0);
            agent.setJustification("Parse error: " + e.getMessage() + "\nRaw: " + response);
        }
        return agent;
    }

}
