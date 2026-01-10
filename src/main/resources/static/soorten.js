export const colorBySoortCode = {
    VRIJSTAANDE_WONING: '#005C97',
    APPARTEMENT: '#e53935',
    RIJTJESWONING: '#ffb347',
    BEDRIJFSGEBOUW: '#205961',
    PARK_GROEN: '#00906b',
    WEGEN: '#6c757d',
    PARKEERPLAATSEN: '#adb5bd',
    OVERDEKTE_PARKEERPLAATSEN: '#343a40'
};

export function colorForSoortCode(soortCode, fallback = '#2f3f36') {
    return colorBySoortCode[soortCode] ?? fallback;
}