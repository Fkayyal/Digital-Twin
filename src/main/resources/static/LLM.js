export function setupLLMAnalyzer(agentId = 1) {
    const analyzeBtn = document.getElementById("analyzeQoL");
    const qolResult = document.getElementById("qol-result");

    if (!analyzeBtn || !qolResult) {
        console.warn("QoL knoppen niet gevonden");
        return;
    }

    analyzeBtn.addEventListener("click", async () => {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = "Analyseren...";
        qolResult.innerHTML = "⏳ Bezig met AI analyse...";

        try {
            const agent = await analyzeCurrentView(agentId);
            qolResult.innerHTML = `
                <strong>QoL Score: ${agent.qualityOfLifeScore}/100</strong><br>
                <small>${agent.justification}</small>
            `;
        } catch (error) {
            qolResult.innerHTML = `❌ Fout: ${error.message}`;
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = "Quality of Life Analyseren";
        }
    });
}

export async function analyzeCurrentView(agentId) {
    const viewer = window.viewer;
    if (!viewer) throw new Error("Viewer niet gevonden");

    return new Promise((resolve, reject) => {
        viewer.scene.render();
        const canvas = viewer.canvas;
        const base64Image = canvas.toDataURL('image/png').split(',')[1];

        // POST body ipv query param
        fetch('http://localhost:8080/agents/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image })
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then(agent => resolve(agent))
            .catch(reject);
    });
}

