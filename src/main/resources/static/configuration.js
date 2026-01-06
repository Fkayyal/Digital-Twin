// === STANDAARDWAARDEN (zoals je al had) ===
export async function populateConfigs() {
    const tbody = document.querySelector('#configDefaultValues tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    try {
        const soorten = await fetch('/soorten').then(r => r.json());
        soorten.forEach(soort => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${soort.soortId}</td>
                <td>${soort.naam}</td>
                <td>${soort.kostenPerMeter}</td>
                <td>${soort.opbrengst}</td>
                <td>${soort.eenheidstype}</td>
                <td>${soort.leefbaarheidsScore}</td>
                <td>${soort.aantalMensen || ''}</td>
                <td>
                    <a class="text-green configEdit"
                       data-bs-toggle="modal"
                       data-bs-target="#exampleModal"
                       data-id="${soort.soortId}">
                       Edit
                    </a>
                </td>
            `;
        });
    } catch(e) {
        tbody.innerHTML = '<tr><td colspan="8">Geen data</td></tr>';
    }
}

export function initModalEdit() {
    const editModalEl = document.getElementById('exampleModal');
    let currentConfigId = null;

    if (!editModalEl) return;

    editModalEl.addEventListener('show.bs.modal', function (event) {
        const button = event.relatedTarget;
        const row = button.closest('tr');

        const naam = row.cells[1].textContent;
        currentConfigId = button.getAttribute('data-id');

        const titleEl = editModalEl.querySelector('.modal-title');
        titleEl.textContent = naam;

        document.getElementById('naamEdit').value = row.cells[1].textContent;
        document.getElementById('kostenPerMeterEdit').value = row.cells[2].textContent;
        document.getElementById('opbrengstEdit').value = row.cells[3].textContent;
        document.getElementById('eenheidstypeEdit').value = row.cells[4].textContent;
        document.getElementById('leefbaarheidsScoreEdit').value = row.cells[5].textContent;
        document.getElementById('aantalMensenEdit').value = row.cells[6].textContent;
    });

    document.getElementById('saveBtn').onclick = async (event) => {
        const btn = event.currentTarget;
        btn.disabled = true;

        try {
            await fetch(`/soorten/${currentConfigId}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(getConfigInputs())
            });

            //MODAL RESET
            editModalEl.style.display = 'none';
            editModalEl.classList.remove('show', 'd-block', 'show');
            document.body.classList.remove('modal-open');
            Array.from(document.querySelectorAll('.modal-backdrop')).forEach(el => el.remove());

            populateConfigs();

        } catch(e) {
            alert('Fout: ' + e);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Opslaan';
        }
    };
}

export function getConfigInputs() {
    return {
        naam: document.getElementById('naamEdit').value,
        kostenPerMeter: parseFloat(document.getElementById('kostenPerMeterEdit').value),
        opbrengst: parseFloat(document.getElementById('opbrengstEdit').value),
        eenheidstype: document.getElementById('eenheidstypeEdit').value,
        leefbaarheidsScore: parseInt(document.getElementById('leefbaarheidsScoreEdit').value),
        aantalMensen: document.getElementById('aantalMensenEdit').value
            ? parseInt(document.getElementById('aantalMensenEdit').value)
            : null
    };
}

// === DOELEN (zelfde structuur/aanpak) ===
export async function populateDoelen() {
    const tbody = document.querySelector('#configGoalsValues tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    try {
        const doelen = await fetch('/doelen').then(r => r.json());
        doelen.forEach(doel => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${doel.doelId}</td>
                <td>${doel.Omschrijving}</td>
                <td>${doel.Aantal}</td>
                <td>
                    <a class="text-green configGEdit"
                       data-bs-toggle="modal"
                       data-bs-target="#doelenModal"
                       data-id="${doel.doelId}">
                       Edit
                    </a>
                </td>
            `;
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4">Geen doelen</td></tr>';
    }
}

export function getDoelInputs() {
    return {
        Omschrijving: document.getElementById('doelOmschrijvingEdit').value,
        Aantal: parseInt(document.getElementById('doelAantalEdit').value)
    };
}

export function initDoelenModal() {
    const doelenModalEl = document.getElementById('doelenModal');
    const saveDoelBtn = document.getElementById('saveDoelBtn');
    let currentDoelId = null;

    if (!doelenModalEl || !saveDoelBtn) return;

    doelenModalEl.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        const row = button.closest('tr');

        currentDoelId = button.getAttribute('data-id');

        document.getElementById('doelOmschrijvingEdit').value = row.cells[1].textContent;
        document.getElementById('doelAantalEdit').value = row.cells[2].textContent;
    });

    saveDoelBtn.onclick = async (event) => {
        const btn = event.currentTarget;
        btn.disabled = true;

        try {
            await fetch(`/doelen/${currentDoelId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(getDoelInputs())
            });

            doelenModalEl.style.display = 'none';
            doelenModalEl.classList.remove('show', 'd-block', 'show');
            document.body.classList.remove('modal-open');
            Array.from(document.querySelectorAll('.modal-backdrop')).forEach(el => el.remove());

            populateDoelen();

        } catch (e) {
            alert('Fout: ' + e);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Opslaan';
        }
    };
}