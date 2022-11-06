interface createElementProps {
    classes?: string[] | string | null;
    id?: string | null;
    attrs?: { [key: string]: string | number };
    dataset?: { [key: string]: string | number };
    content?: string | HTMLElement[];
}

export default class PageBuilder {
    public static createElement<T extends HTMLElement>(tag = 'div', properties: createElementProps = {}): T {
        const element = <T>document.createElement(tag);
        if (properties.classes) {
            let classes: string[];
            if (typeof properties.classes === 'string') {
                classes = properties.classes
                    .replace(/,/g, ' ')
                    .replace(/\./g, ' ')
                    .replace(/\s{2,}/g, ' ')
                    .trim()
                    .split(' ');
            } else {
                classes = properties.classes.map((item) => {
                    return item
                        .replace(/,/g, ' ')
                        .replace(/\./g, ' ')
                        .replace(/\s{2,}/g, ' ')
                        .trim();
                });
            }
            element.classList.add(...classes);
        }
        if (properties.id) {
            element.id = properties.id
                .replace(/#/g, ' ')
                .replace(/\s{2,}/g, ' ')
                .trim();
        }

        if (properties.attrs) {
            for (const attr in properties.attrs) {
                const value: string | number | boolean = properties.attrs[attr];
                element.setAttribute(attr, value.toString());
            }
        }

        if (properties.dataset) {
            for (const key in properties.dataset) {
                const value: string | number = properties.dataset[key];
                element.dataset[key] = value.toString();
            }
        }

        if (properties.content) {
            if (typeof properties.content === 'string') {
                element.innerHTML = properties.content;
            } else if (properties.content instanceof HTMLElement) {
                element.append(properties.content);
            } else if (Array.isArray(properties.content)) {
                properties.content.forEach((item: string | HTMLElement) => {
                    if (typeof item === 'string') {
                        element.insertAdjacentHTML('beforeend', item);
                    } else {
                        element.append(item);
                    }
                });
            }
        }
        return element;
    }
}
