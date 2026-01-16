package com.leeuwarden.Digital.Twin.service;

//imports
import com.leeuwarden.Digital.Twin.entity.Agent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** The OllamaServiceTest tests for possible problems in the OllamaService */
@ExtendWith(MockitoExtension.class)
class OllamaServiceTest {

    //Create Test/Mock data
    private OllamaService service;
    @Mock
    private WebClient webClient;
    @Mock
    private WebClient.RequestBodyUriSpec uriSpec;
    @Mock
    private WebClient.RequestBodySpec bodySpec;
    @Mock
    private WebClient.RequestHeadersSpec headersSpec;
    @Mock
    private WebClient.ResponseSpec responseSpec;

    //Create Test Ollama service
    @BeforeEach
    void setUp() throws Exception {
        service = new OllamaService("http://localhost:11434");
        var field = OllamaService.class.getDeclaredField("webClient");
        field.setAccessible(true);
        field.set(service, webClient);
    }

    //Setup Test/Mock data
    private void setupMockChain(String response) {
        when(webClient.post()).thenReturn(uriSpec);
        when(uriSpec.uri("/api/chat")).thenReturn(bodySpec);
        when(bodySpec.contentType(any())).thenReturn(bodySpec);
        when(bodySpec.bodyValue(any())).thenReturn(headersSpec);
        when(headersSpec.retrieve()).thenReturn(responseSpec);
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(response));
    }


    /** Test1 : AnalyzeImageSucces
     * Tests for the correct response when everything is in order
     */
    @Test
    void analyzeImageSuccess() {
        String response = "{\"message\":{\"content\":\"```json\\n{\\\"quality_of_life_score\\\":85,\\\"justification\\\":\\\"Goed\\\"}\\n```\"}}";
        setupMockChain(response);

        Agent agent = service.analyzeImageForAgent("base64");

        assertEquals(85, agent.getQualityOfLifeScore());
        assertEquals("Goed", agent.getJustification());
    }

    /** Test2 : AnalyzeImageError
     * Tests for the correct response when the input is wrong
     */
    @Test
    void analyzeImageError() {
        String response = "{\"message\":{\"content\":\"invalid json\"}}";
        setupMockChain(response);

        Agent agent = service.analyzeImageForAgent("base64");

        assertEquals(0, agent.getQualityOfLifeScore());
        assertTrue(agent.getJustification().startsWith("Parse error"));
    }

    /** Test3 : AnalyzeImageMissingFields
     * Tests for the correct response when there are missing fields
     */
    @Test
    void analyzeImageMissingFields() {
        String response = "{\"message\":{\"content\":\"```json\\n{\\\"other\\\":\\\"value\\\"}\\n```\"}}";
        setupMockChain(response);

        Agent agent = service.analyzeImageForAgent("base64");

        assertEquals(0, agent.getQualityOfLifeScore());
        assertEquals("Geen analyse", agent.getJustification());
    }
}
