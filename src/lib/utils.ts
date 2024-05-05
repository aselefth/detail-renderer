export async function sleep(delay: number = 300) {
    await new Promise((res) => setTimeout(res, delay));
}

export function getRandomHexColor() {
    function generateRandomPart() {
        const variants = '3456789ABCDEF';
        return variants[Math.floor(Math.random() * variants.length)];
    }
    return [
        '#',
        generateRandomPart(),
        generateRandomPart(),
        generateRandomPart(),
        generateRandomPart(),
        generateRandomPart(),
        generateRandomPart()
    ].join('');
}
