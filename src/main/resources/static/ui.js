// showMessage is een minder irritante vervanging van een alert //
export function showMessage(text, timeoutMs = 2000) {
    const el = document.getElementById("messageOverlay");
    if (!el) return;
    el.textContent = text;
    el.style.display = "block";

    clearTimeout(showMessage._timer);
    showMessage._timer = setTimeout(() => {
        el.style.display = "none";
    }, timeoutMs);
}
