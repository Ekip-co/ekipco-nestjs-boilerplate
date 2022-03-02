export function convertToLines(data) {
    const lines = [];
    if (!data) {
        return lines;
    }
    if (typeof data === 'object') {
        //  Object ise
        Object.keys(data).forEach((key: string) => {
            const obj = data[key];
            if (typeof obj === 'object') {
                lines.push(
                    `${key}: ${JSON.stringify(obj, getCircularReplacer())}`,
                );
            } else {
                lines.push(`${key}: ${obj}`);
            }
        });
    } else if (Array.isArray(data)) {
        // Array ise
        data.forEach((data) => {
            lines.push(data);
        });
    } else {
        lines.push(`${data}`);
    }
    return lines;
}

// Aşırı uzun bir object ise ve kendi içerisinde tekrar ediyorsa ekleme
function getCircularReplacer() {
    const seen = new WeakSet();

    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
}
